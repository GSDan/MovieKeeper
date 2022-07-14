const functions = require("firebase-functions");
const EbayAuthToken = require("ebay-oauth-nodejs-client");
const axios = require("axios");
const CircularJSON = require('circular-json');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const ebayAuthToken = new EbayAuthToken({
  clientId: process.env.EBAY_APPID,
  clientSecret: process.env.EBAY_CERTID,
  redirectUri: process.env.EBAY_RUNAME
});

const toStrip4k = ["ultra hd", "ultra-hd", "uhd", "4k", "hdr"];
const toStripBr = ["+ blu-ray", "blu-ray +", "blu ray", "blu-ray", "bluray", " blu ", "3d"];
const toStripMisc = [
  "dvd",
  "P&P free",
  "free P&P",
  "brand new",
  "& sealed",
  "and sealed",
  "new sealed",
  "new/sealed",
  "region free",
  "slipcover",
  "steelbook",
  "steel book",
  "fast dispatch",
  "the final cut",
  "final cut",
  " + ",
  "director's cut",
  "special edition",
  "limited edition",
  " uk",
  " usa"
]

// https://stackoverflow.com/a/7313467
String.prototype.replaceAll = function (strReplace, strWith)
{
  const esc = strReplace.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const reg = new RegExp(esc, 'ig');
  return this.replace(reg, strWith);
};

exports.getMovieFromBarcode = functions.https.onCall(async (data, context) =>
{
  try
  {
    if (!context.auth || !context.auth.uid) throw new Error("Not logged in.");

    const barcode = data.barcode;

    // check if this barcode has already been scanned, return data if so
    const priorScan = (await db.collection('Barcodes').doc(barcode).get()).data();
    if (priorScan)
    {
      const ids = priorScan.imdbIDs;
      let results = [];
      let promises = [];

      ids.forEach(id =>
      {
        promises.push(db.collection(priorScan.Type === 'movie' ? 'Movies' : 'TV').doc(id).get().then(val =>
        {
          results.push(val.data());
        }));
      });

      await Promise.all(promises);

      console.log('Found existing barcode: ' + barcode);

      return {
        'success': true,
        'likelyFormat': priorScan.Format,
        'data': results
      }
    }

    const tokenResp = await ebayAuthToken.getApplicationToken('PRODUCTION', ['https://api.ebay.com/oauth/api_scope']);
    const headers = {
      'Authorization': `Bearer ${CircularJSON.parse(tokenResp).access_token}`,
      'X-EBAY-C-MARKETPLACE-ID': data.region ? data.region : 'EBAY_US'
    };

    let ebayResp = await axios.get(`https://api.ebay.com/buy/browse/v1/item_summary/search?gtin=${barcode}`, { 'headers': headers });

    if (!ebayResp || !ebayResp.data || ebayResp.data.total == 0)
    {
      ebayResp = await axios.get(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${barcode}`, { 'headers': headers });
    }

    if (!ebayResp || !ebayResp.data || ebayResp.data.total == 0)
    {
      throw new Error("No results found");
    }

    let likelyFormat = "DVD";

    // console.log(ebayResp.data.itemSummaries)

    if (ebayResp.data.itemSummaries.length > 1)
    {
      // try to get a common sequence of words between the first 2 results
      let commonWords = "";
      const wordsInFirstRes = ebayResp.data.itemSummaries[0].title.split(" ");
      const wordsInSecondRes = ebayResp.data.itemSummaries[1].title.split(" ");

      for (let i = 0; i < wordsInFirstRes.length; i++)
      {
        // skip blanks and instances of 'the' 
        // 'The' can sometimes be out of order (e.g. 'Avengers, The') causing mismatches
        if (wordsInFirstRes[i] === "" || wordsInFirstRes[i].toLowerCase() == "the") continue;

        for (let j = 0; j < wordsInSecondRes.length; j++)
        {
          // compare to lowercase without commas
          const lhs = wordsInFirstRes[i].toLowerCase().replace(/,/g, '');
          const rhs = wordsInFirstRes[j].toLowerCase().replace(/,/g, '');
          if (lhs == rhs)
          {
            commonWords = `${commonWords} ${lhs}`;
            break;
          }
        }
      }

      if (commonWords.length > 0)
      {
        console.log("Common:", commonWords)

        let processedRes = processListingTitle(commonWords, likelyFormat)
        likelyFormat = processedRes.likelyFormat;

        const commonResp = await queryOmdb(processedRes.title);
        if (commonResp.success)
        {
          commonResp.likelyFormat = likelyFormat;
          commonResp.data = [commonResp.data];
          return commonResp;
        }
      }
    }

    for (let i = 0; i < ebayResp.data.itemSummaries.length; i++)
    {
      let thisTitle = ebayResp.data.itemSummaries[i].title;
      console.log(thisTitle);
      let processedRes = processListingTitle(thisTitle, likelyFormat)
      likelyFormat = processedRes.likelyFormat;
      console.log(processedRes)

      const omdbResp = await queryOmdb(processedRes.title);
      if (omdbResp.success)
      {
        omdbResp.likelyFormat = likelyFormat;
        omdbResp.data = [omdbResp.data]
        return omdbResp;
      }
    }

    return { "success": false, "likelyFormat": likelyFormat, "data": ebayResp.data.itemSummaries[0] };
  }
  catch (error)
  {
    console.log(error);
    return resp.send(error);
  }
});

const processListingTitle = function (title, likelyFormat) 
{
  title = title.toLowerCase();

  // strip format names, saving any matches as the potential format
  // Once set as 4K it can't be overridden, as something could be listed as '4K Blu Ray'
  toStrip4k.forEach((s) =>
  {
    if (title.includes(s))
    {
      likelyFormat = "4K";
      title = title.replaceAll(s, '');
    }
  });
  toStripBr.forEach((s) =>
  {
    if (title.includes(s))
    {
      if (likelyFormat === "DVD")
      {
        likelyFormat = "Blu-ray";
      }
      title = title.replaceAll(s, '');
    }
  });
  toStripMisc.forEach((s) =>
  {
    title = title.replaceAll(s, '');
  });

  // strip of extra descriptors in brackets e.g. (4k UHD, 2019)
  title = title.replace(/\([^)]*\)*/g, "");
  // strip stuff in asterisks e.g. *NEW - SEALED*
  title = title.replace(/\*([^,*]+)\*/g, "");
  // strip stuff in square brackets e.g. [2D - 3D]
  title = title.replace(/\[(.*?)\]/g, "");
  // strip the region detail (e.g. 'region 4', 'region b')
  title = title.replace(/region . /g, "");
  // strip everything after a hyphen 
  title = title.replace(/\-(.*)/g, "");

  title = title.trim();

  // strip NEW from the end if it's there
  if (title.endsWith(' new'))
  {
    title = title.substring(0, title.length - 3);
  }

  return {
    'title': title.trim(),
    'likelyFormat': likelyFormat
  }
}

const queryOmdb = async function (title)
{
  const omdbResp = await axios.get(`https://www.omdbapi.com/?t=${title}&apikey=${process.env.OMDB_KEY}`);
  if (omdbResp && omdbResp.data && omdbResp.data.Response === "True")
  {
    console.log("Found!", omdbResp.data.Title)
    return { "success": true, "data": omdbResp.data };
  }

  console.log("Failed to find", title);
  return { "success": false }
}

exports.getMovieFromTitle = functions.https.onCall(async (data, context) =>
{
  if (!context.auth || !context.auth.uid) throw new Error("Not logged in.");

  const omdbResp = await queryOmdb(data.title);
  if (omdbResp.success)
  {
    return omdbResp;
  }
  return { "success": false };
});

exports.getLibrary = functions.https.onCall(async (data, context) =>
{
  if (!context.auth || !context.auth.uid) throw new Error("Not logged in.");

  const userMovieCol = await db.collection(`Users/${context.auth.uid}/Movies`).get();
  const userTVCol = await db.collection(`Users/${context.auth.uid}/TV`).get();

  let promises = [];
  let toRet = [];

  userMovieCol.docs.map((userMovDoc) =>
  {
    promises.push(
      db.doc(`Movies/${userMovDoc.id}`).get().then((movDoc) => 
      {
        toRet.push({
          ...movDoc.data(),
          ...userMovDoc.data()
        });
      })
    );
  })

  userTVCol.docs.map(async (userTvDoc) =>
  {
    promises.push(
      db.doc(`TV/${userTvDoc.id}`).get().then((tvDoc) => 
      {
        toRet.push({
          ...tvDoc.data(),
          ...userTvDoc.data()
        });
      })
    );
  })

  await Promise.all(promises);

  return toRet;
});

exports.deleteFromLibrary = functions.https.onCall(async (data, context) =>
{
  if (!context.auth || !context.auth.uid) throw new Error("Not logged in.");

  const mediaType = data.Type === 'movie' ? 'Movies' : 'TV';

  return await db.collection(`Users/${context.auth.uid}/${mediaType}`).doc(data.id).delete();
});

exports.addMovieToLibrary = functions.https.onCall(async (data, context) =>
{
  if (!context.auth || !context.auth.uid) throw new Error("Not logged in.");

  const mediaType = data.Type === 'movie' ? 'Movies' : 'TV';

  const mediaRef = db.collection(mediaType).doc(data.imdbID);

  if (!(await mediaRef.get()).exists)
  {
    console.log(`${data.imdbID} (${data.Title}) does not yet exist`)
    let newData = {
      'Actors': data.Actors,
      'Director': data.Director,
      'Genre': data.Genre,
      'Poster': data.Poster,
      'Rated': data.Rated,
      'Runtime': data.Runtime,
      'Title': data.Title,
      'Type': data.Type,
      'Year': data.Year,
      'imdbID': data.imdbID,
      'imdbRating': data.imdbRating
    }

    if (data.Ratings)
    {
      const rotten = data.Ratings.find(r => r.Source === 'Rotten Tomatoes');
      if (rotten) newData.ScoreRotten = rotten.Value;
    }
    else if (data.ScoreRotten) newData.ScoreRotten;

    await mediaRef.set(newData);
  }

  if (data.Barcode)
  {
    // check if this barcode has already been scanned
    // if not, add to known barcodes
    const barcodeRef = db.collection('Barcodes').doc(data.Barcode);
    const barcodeVal = (await barcodeRef.get()).data();
    if (!barcodeVal)
    {
      barcodeRef.set({
        'Type': data.Type,
        'imdbIDs': [data.imdbID],
        'Format': data.OwnedFormats[0],
        'CreatedBy': context.auth.uid,
        'CreatedAt': Date.now()
      })
    }
    // if so, check if this movie has been associated (e.g. boxset)
    else if (!barcodeVal.imdbIDs.includes(data.imdbID))
    {
      barcodeRef.update({
        imdbIDs: [...barcodeVal.imdbIDs, data.imdbID]
      })
    }
  }

  const libraryRef = db.collection('Users').doc(context.auth.uid).collection(mediaType).doc(data.imdbID);
  return libraryRef.set(
    {
      'UserRating': data.UserRating,
      'Added': Date.now(),
      'Formats': data.OwnedFormats
    });
});