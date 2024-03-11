const functions = require('firebase-functions');
const EbayAuthToken = require('ebay-oauth-nodejs-client');
const axios = require('axios');
const CircularJSON = require('circular-json');
const admin = require('firebase-admin');

const { GoogleGenerativeAI } = require('@google/generative-ai');

admin.initializeApp();
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

const ebayAuthToken = new EbayAuthToken({
	clientId: process.env.EBAY_APPID,
	clientSecret: process.env.EBAY_CERTID,
	redirectUri: process.env.EBAY_RUNAME,
});

const toStrip4k = ['ultra hd', 'ultra-hd', 'uhd', '4k', 'hdr'];
const toStripBr = [
	'+ blu-ray',
	'blu-ray +',
	'blu ray',
	'blu-ray',
	'bluray',
	' blu ',
	'3d',
];
const toStripMisc = [
	'dvd',
	'P&P free',
	'free P&P',
	'brand new',
	'& sealed',
	'movie',
	'and sealed',
	'new sealed',
	'new/sealed',
	'region free',
	'slipcover',
	'steelbook',
	'steel book',
	'fast dispatch',
	'the final cut',
	'final cut',
	' + ',
	' & ',
	"director's cut",
	'special edition',
	'limited edition',
	' uk',
	' usa',
];

// https://stackoverflow.com/a/7313467
String.prototype.replaceAll = function (strReplace, strWith) {
	const esc = strReplace.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
	const reg = new RegExp(esc, 'ig');
	return this.replace(reg, strWith);
};

exports.getMovieFromBarcode = functions.https.onCall(async (data, context) => {
	try {
		if (!context.auth || !context.auth.uid) throw new Error('Not logged in.');

		const barcode = data.barcode;

		// check if this barcode has already been scanned, return data if so
		const priorScan = (
			await db.collection('Barcodes').doc(barcode).get()
		).data();
		if (priorScan) {
			const ids = priorScan.imdbIDs;
			let results = [];
			let promises = [];

			ids.forEach((id) => {
				promises.push(
					db
						.collection(priorScan.Type === 'movie' ? 'Movies' : 'TV')
						.doc(id)
						.get()
						.then((val) => {
							results.push(val.data());
						})
				);
			});

			await Promise.all(promises);

			console.log('Found existing barcode: ' + barcode);

			return {
				success: true,
				likelyFormat: priorScan.Format,
				previous: results,
			};
		}

		// We haven't got that barcode on file
		// Search for it on ebay, and use the titles of the results to try to figure out the movie
		// If there aren't any results from the user's requested eBay region, also check the US and GB
		// as together they account for 50% of all ebay listings

		const tokenResp = await ebayAuthToken.getApplicationToken('PRODUCTION', [
			'https://api.ebay.com/oauth/api_scope',
		]);
		const accessToken = CircularJSON.parse(tokenResp).access_token;

		let movieResults = null;
		let regionStack = ['EBAY_GB', 'EBAY_US'];
		if (data.region && !regionStack.includes(data.region)) {
			regionStack.push(data.region);
		}

		while (!movieResults && regionStack.length > 0) {
			const ebayResp = await queryEbay(barcode, accessToken, regionStack.pop());
			if (ebayResp) {
				movieResults = await getMovieFromEbayListings(
					ebayResp.data.itemSummaries
				);
			}
		}

		return movieResults ?? { success: false };
	} catch (error) {
		console.log(error);
		return { success: false, data: error };
	}
});

const queryEbay = async function (barcode, token, region) {
	try {
		const headers = {
			Authorization: `Bearer ${token}`,
			'X-EBAY-C-MARKETPLACE-ID': region,
		};

		let ebayResp = await axios.get(
			`https://api.ebay.com/buy/browse/v1/item_summary/search?gtin=${barcode}`,
			{ headers: headers }
		);

		if (!ebayResp || !ebayResp.data || ebayResp.data.total == 0) {
			ebayResp = await axios.get(
				`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${barcode}`,
				{ headers: headers }
			);
		}

		if (!ebayResp || !ebayResp.data || ebayResp.data.total == 0) {
			ebayResp = null;
		}

		return ebayResp;
	} catch (error) {
		console.log(error);
		return null;
	}
};

const getMovieFromEbayListings = async function (ebayItems) {
	let likelyFormat = 'DVD';

	if (ebayItems.length > 1) {
		// try to get a common sequence of words between the first 2 results
		let commonWords = [];
		const wordsInFirstRes = ebayItems[0].title.split(' ');
		const wordsInSecondRes = ebayItems[1].title.split(' ');

		for (let i = 0; i < wordsInFirstRes.length; i++) {
			// skip blanks
			if (wordsInFirstRes[i] === '') continue;

			for (let j = 0; j < wordsInSecondRes.length; j++) {
				// compare to lowercase without commas
				const lhs = wordsInFirstRes[i].toLowerCase().replace(/,/g, '');
				const rhs = wordsInFirstRes[j].toLowerCase().replace(/,/g, '');
				if (lhs == rhs) {
					commonWords.push(lhs);
					break;
				}
			}
		}

		if (commonWords.length > 0) {
			if (ebayItems.length > 2) {
				let inAll = [];

				// narrow it down against a third result if we have one
				const wordsInThirdRes = ebayItems[2].title.split(' ');

				for (let i = 0; i < commonWords.length; i++)
					for (let j = 0; j < wordsInThirdRes.length; j++) {
						const rhs = wordsInThirdRes[j].toLowerCase().replace(/,/g, '');
						if (commonWords[i] == rhs) {
							inAll.push(rhs);
							break;
						}
					}

				if (inAll.length > 0) commonWords = inAll;
			}

			commonWords = commonWords.join(' ');
			console.log('common words', commonWords);
			let processedRes = processListingTitle(commonWords, likelyFormat);
			console.log('processed words', processedRes);
			likelyFormat = processedRes.likelyFormat;

			let result = await attemptFromTitle(processedRes.title);
			if (result) {
				result.likelyFormat = likelyFormat;
				return result;
			}
		}
	}

	for (let i = 0; i < ebayItems.length; i++) {
		let thisTitle = ebayItems[i].title;
		let processedRes = processListingTitle(thisTitle, likelyFormat);
		likelyFormat = processedRes.likelyFormat;

		let result = await attemptFromTitle(processedRes.title);

		if (result) {
			result.likelyFormat = likelyFormat;
			return result;
		}
	}

	return null;
};

const processListingTitle = function (title, likelyFormat) {
	title = title.toLowerCase();

	// strip format names, saving any matches as the potential format
	// Once set as 4K it can't be overridden, as something could be listed as '4K Blu Ray'
	toStrip4k.forEach((s) => {
		if (title.includes(s)) {
			likelyFormat = '4K';
			title = title.replaceAll(s, '');
		}
	});
	toStripBr.forEach((s) => {
		if (title.includes(s)) {
			if (likelyFormat === 'DVD') {
				likelyFormat = 'Blu-ray';
			}
			title = title.replaceAll(s, '');
		}
	});
	toStripMisc.forEach((s) => {
		title = title.replaceAll(s, '');
	});

	// strip of extra descriptors in brackets e.g. (4k UHD, 2019)
	title = title.replace(/\([^)]*\)*/g, '');
	// strip stuff in asterisks e.g. *NEW - SEALED*
	title = title.replace(/\*([^,*]+)\*/g, '');
	// strip stuff in square brackets e.g. [2D - 3D]
	title = title.replace(/\[(.*?)\]/g, '');
	// strip the region detail (e.g. 'region 4', 'region b')
	title = title.replace(/region . /g, '');
	// strip everything after a hyphen
	title = title.replace(/\-(.*)/g, '');

	title = title.trim();

	// strip NEW from the end if it's there
	if (title.endsWith(' new')) {
		title = title.substring(0, title.length - 3);
	}

	return {
		title: title.trim(),
		likelyFormat: likelyFormat,
	};
};

// Search imdb for items using the given title string,
// and fetch additional details from OMDB for the first result
const attemptFromTitle = async function (title) {
	const imdbResp = await queryImdb(title);

	if (imdbResp && imdbResp.length > 0) {
		const omdbResp = await queryOmdb(null, imdbResp[0].imdbID);
		if (omdbResp.success) {
			omdbResp.data.Thumb = omdbResp.data.Poster;
			if (imdbResp[0].Poster) {
				// imdb returns higher res than omdb
				omdbResp.data.Poster = imdbResp[0].Poster;
			}

			omdbResp.imdb = imdbResp;
			return omdbResp;
		}
	}

	return null;
};

const queryImdb = async function (title) {
	try {
		const imdbResp = await axios.get(
			`https://sg.media-imdb.com/suggests/${title
				.charAt()
				.toLowerCase()}/${encodeURIComponent(title)}.json`
		);

		if (imdbResp.status === '404') return [];

		const parsedResults = JSON.parse((await imdbResp.data).match(/{.*}/g)).d;

		if (!parsedResults || parsedResults.length === 0) {
			return [];
		}

		return parsedResults.map((imdbRes) => {
			return {
				imdbID: imdbRes.id,
				Title: imdbRes.l,
				Year: imdbRes.y,
				Type: imdbRes.q === 'feature' ? 'Movie' : imdbRes.q,
				Poster: imdbRes.i ? imdbRes.i[0] : undefined,
				Actors: imdbRes.s,
			};
		});
	} catch (error) {
		return [];
	}
};

const queryOmdb = async function (title = null, id = null) {
	let qType = id ? 'i' : 't';

	const omdbResp = await axios.get(
		`https://www.omdbapi.com/?${qType}=${id ? id : title}&apikey=${
			process.env.OMDB_KEY
		}`
	);
	if (omdbResp && omdbResp.data && omdbResp.data.Response === 'True') {
		return { success: true, data: omdbResp.data };
	}

	console.log('Failed to find', title);
	return { success: false };
};

exports.getMovieFromImdbId = functions.https.onCall(async (data, context) => {
	if (!context.auth || !context.auth.uid) throw new Error('Not logged in.');

	try {
		const omdbResp = await queryOmdb(null, data.id);
		if (omdbResp.success) {
			omdbResp.data.Thumb = omdbResp.data.Poster;
			const imdbResp = await queryImdb(omdbResp.data.Title);

			for (let i = 0; i < imdbResp.length; i++) {
				if (imdbResp[i].imdbID === omdbResp.data.imdbID && imdbResp[i].Poster) {
					// imdb returns higher res than omdb
					omdbResp.data.Poster = imdbResp[0].Poster;
				}
				break;
			}
			return omdbResp;
		}
	} catch (error) {
		console.log(error);
	}

	return { success: false };
});

exports.getTrivia = functions.https.onCall(async (data, context) => {
	if (!context.auth || !context.auth.uid)
		throw new functions.https.HttpsError('unauthenticated', 'Not logged in.');

	const userMovieCol = await db
		.collection(`Users/${context.auth.uid}/Movies`)
		.get();

	if (userMovieCol.empty || userMovieCol.docs.length < data.NumChoices) {
		throw new functions.https.HttpsError(
			'invalid-argument',
			'Not enough movies registered'
		);
	}

	let randomIds = [];
	let randomChoices = [];

	// get three different movies from the user's library
	for (let i = 0; i < data.NumChoices; i++) {
		let thisMovieId = null;
		do {
			thisMovieId =
				userMovieCol.docs[Math.floor(Math.random() * userMovieCol.docs.length)]
					.id;
		} while (randomIds.includes(thisMovieId));

		const movieData = (await db.doc(`Movies/${thisMovieId}`).get()).data();

		randomIds.push(thisMovieId);
		randomChoices.push(movieData);
	}

	const genAI = new GoogleGenerativeAI(process.env.GOOGLEAI_KEY);
	const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

	const prompt = `Create one piece of movie trivia for the following movie, given its title and IMDB ID. 
    Do not name the movie. Do not give the name of any characters. Try not to make it too obvious.
		Instead of the title, say 'this movie'. Do this for the movie '${randomChoices[0].Title}', which has the IMDB ID ${randomChoices[0].imdbID}`;

	const aiResult = await model.generateContent(prompt);
	const aiResp = await aiResult.response;

	return {
		triviaQuestion: aiResp.text(),
		answer: randomChoices[0],
		incorrectOptions: randomChoices.slice(1),
	};
});

exports.getLibrary = functions.https.onCall(async (data, context) => {
	if (!context.auth || !context.auth.uid) throw new Error('Not logged in.');

	const userMovieCol = await db
		.collection(`Users/${context.auth.uid}/Movies`)
		.get();
	const userTVCol = await db.collection(`Users/${context.auth.uid}/TV`).get();

	let promises = [];
	let toRet = [];

	userMovieCol.docs.map((userMovDoc) => {
		promises.push(
			db
				.doc(`Movies/${userMovDoc.id}`)
				.get()
				.then((movDoc) => {
					toRet.push({
						...movDoc.data(),
						...userMovDoc.data(),
					});
				})
		);
	});

	userTVCol.docs.map(async (userTvDoc) => {
		promises.push(
			db
				.doc(`TV/${userTvDoc.id}`)
				.get()
				.then((tvDoc) => {
					toRet.push({
						...tvDoc.data(),
						...userTvDoc.data(),
					});
				})
		);
	});

	await Promise.all(promises);

	return toRet;
});

exports.deleteFromLibrary = functions.https.onCall(async (data, context) => {
	if (!context.auth || !context.auth.uid) throw new Error('Not logged in.');

	const mediaType = data.Type === 'movie' ? 'Movies' : 'TV';

	return await db
		.collection(`Users/${context.auth.uid}/${mediaType}`)
		.doc(data.id)
		.delete();
});

exports.addBoxsetToLibrary = functions.https.onCall(async (data, context) => {
	if (!context.auth || !context.auth.uid) throw new Error('Not logged in.');

	const barcodeRef = db.collection('Barcodes').doc(data.Barcode);
	const barcodeVal = (await barcodeRef.get()).data();
	const sentIds = data.MediaItems.map((item) => item.imdbID);

	// check if this barcode has already been scanned
	// if not, add to known barcodes
	if (!barcodeVal) {
		barcodeRef.set({
			Type: 'movie',
			imdbIDs: sentIds,
			Format: data.OwnedFormats,
			CreatedBy: context.auth.uid,
			CreatedAt: Date.now(),
		});
	}
	// if so, check if all of these movies have been associated
	else {
		let dbIds = barcodeVal.imdbIDs;
		sentIds.forEach((id) => {
			if (!dbIds.includes(id)) {
				dbIds.push(id);
			}
		});

		if (dbIds.length > barcodeVal.imdbIDs.length) {
			barcodeRef.update({
				imdbIDs: dbIds,
			});
		}
	}
	let promises = [];

	data.MediaItems.forEach((item) => {
		const mediaRef = db.collection('Movies').doc(item.imdbID);

		promises.push(
			mediaRef
				.get()
				.then((snapshot) => {
					if (!snapshot.exists) {
						console.log(`${item.imdbID} (${item.Title}) does not yet exist`);
						let newData = {
							Actors: item.Actors,
							Director: item.Director,
							Genre: item.Genre,
							Thumb: item.Thumb,
							Poster: item.Poster,
							Rated: item.Rated,
							Runtime: item.Runtime,
							Title: item.Title,
							Type: item.Type,
							Year: item.Year,
							imdbID: item.imdbID,
							imdbRating: item.imdbRating,
						};

						if (item.Ratings) {
							const rotten = item.Ratings.find(
								(r) => r.Source === 'Rotten Tomatoes'
							);
							if (rotten) newData.ScoreRotten = rotten.Value;
						} else if (data.ScoreRotten) newData.ScoreRotten;

						return mediaRef.set(newData);
					}
				})
				.then(() => {
					const libraryRef = db
						.collection('Users')
						.doc(context.auth.uid)
						.collection('Movies')
						.doc(item.imdbID);
					return libraryRef.get();
				})
				.then((libraryItemSnapshot) => {
					let combinedFormats = [];
					if (libraryItemSnapshot.exists) {
						let priorFormats = libraryItemSnapshot.Formats;
						if (!priorFormats || priorFormats.length == 0) {
							combinedFormats = data.OwnedFormats;
						} else {
							['DVD', 'Blu-ray', '4K'].forEach((format) => {
								if (
									combinedFormats.includes(format) ||
									data.OwnedFormats.includes(format)
								) {
									combinedFormats.push(format);
								}
							});
						}
					}

					return libraryItemSnapshot.ref.set({
						UserRating: item.UserRating ?? 0,
						Added: Date.now(),
						Formats: data.OwnedFormats,
					});
				})
		);
	});

	return await Promise.all(promises);
});

exports.addCustomToLibrary = functions.https.onCall(async (data, context) => {
	if (!context.auth || !context.auth.uid) throw new Error('Not logged in.');
	const id = `custom_${context.auth.uid}_${Date.now()}`;

	const mediaType = data.Type === 'movie' ? 'Movies' : 'TV';
	const mediaRef = db.collection(mediaType).doc(id);

	let newData = {
		Actors: data.Actors,
		Director: data.Director,
		Genre: data.Genre,
		Title: data.Title,
		Type: data.Type,
		Year: data.Year,
		imdbID: id,
	};

	let userData = {
		UserRating: data.UserRating ?? 0,
		Added: Date.now(),
		Formats: data.OwnedFormats,
	};

	if (data.totalSeasons) {
		newData.totalSeasons = data.totalSeasons;
		// if a user adds a custom TV show, just assume they own all of it
		// they can fix that themselves later if they want
		userData.OwnedSeasons = [];
		for (let i = 1; i <= newData.totalSeasons; i++) {
			userData.OwnedSeasons.push({ num: i, owned: true });
		}
	}

	await mediaRef.set(newData);

	const libraryRef = db
		.collection('Users')
		.doc(context.auth.uid)
		.collection(mediaType)
		.doc(id);
	return libraryRef.set(userData);
});

exports.addMovieToLibrary = functions.https.onCall(async (data, context) => {
	if (!context.auth || !context.auth.uid) throw new Error('Not logged in.');

	const mediaType = data.Type === 'movie' ? 'Movies' : 'TV';

	const mediaRef = db.collection(mediaType).doc(data.imdbID);

	if (!(await mediaRef.get()).exists) {
		console.log(`${data.imdbID} (${data.Title}) does not yet exist`);
		let newData = {
			Actors: data.Actors,
			Director: data.Director,
			Genre: data.Genre,
			Thumb: data.Thumb,
			Poster: data.Poster,
			Rated: data.Rated,
			Runtime: data.Runtime,
			Title: data.Title,
			Type: data.Type,
			Year: data.Year,
			imdbID: data.imdbID,
			imdbRating: data.imdbRating,
		};

		if (data.totalSeasons) {
			newData.totalSeasons = data.totalSeasons;
		}

		if (data.Ratings) {
			const rotten = data.Ratings.find((r) => r.Source === 'Rotten Tomatoes');
			if (rotten) newData.ScoreRotten = rotten.Value;
		} else if (data.ScoreRotten) newData.ScoreRotten;

		await mediaRef.set(newData);
	}

	if (data.Barcode) {
		// check if this barcode has already been scanned
		// if not, add to known barcodes
		const barcodeRef = db.collection('Barcodes').doc(data.Barcode);
		const barcodeVal = (await barcodeRef.get()).data();
		if (!barcodeVal) {
			barcodeRef.set({
				Type: data.Type,
				imdbIDs: [data.imdbID],
				Format: data.OwnedFormats,
				CreatedBy: context.auth.uid,
				CreatedAt: Date.now(),
			});
		}
		// if so, check if this movie has been associated (e.g. boxset)
		else if (!barcodeVal.imdbIDs.includes(data.imdbID)) {
			barcodeRef.update({
				imdbIDs: [...barcodeVal.imdbIDs, data.imdbID],
			});
		}
	}

	let userData = {
		UserRating: data.UserRating,
		Added: Date.now(),
		Formats: data.OwnedFormats,
	};

	if (data.OwnedSeasons) userData.OwnedSeasons = data.OwnedSeasons;

	const libraryRef = db
		.collection('Users')
		.doc(context.auth.uid)
		.collection(mediaType)
		.doc(data.imdbID);
	return libraryRef.set(userData);
});
