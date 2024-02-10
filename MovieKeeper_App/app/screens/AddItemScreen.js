import { StyleSheet, Text, View, Image, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import { Picker } from '@react-native-picker/picker';

import Screen from '../components/Mk_Screen';
import colours from '../config/colours';
import { getFromBarcode, getFromId } from '../api/libraryItems';
import Mk_Button from '../components/Mk_Button';
import { getString, loadCachedMatches, setString } from '../config/storage';
import Mk_TextSearch from '../components/Mk_TextSearch';
import { useSearchTitle } from '../hooks/searchTitle';

export default function AddItemScreen({ navigation }) {
	const marketplaces = [
		{ region: 'EBAY_US', display: 'United States' },
		{ region: 'EBAY_AT', display: 'Austria' },
		{ region: 'EBAY_AU', display: 'Australia' },
		{ region: 'EBAY_BE', display: 'Belgium' },
		{ region: 'EBAY_CA', display: 'Canada' },
		{ region: 'EBAY_CH', display: 'Switzerland' },
		{ region: 'EBAY_DE', display: 'Germany' },
		{ region: 'EBAY_ES', display: 'Spain' },
		{ region: 'EBAY_FR', display: 'France' },
		{ region: 'EBAY_GB', display: 'Great Britain' },
		{ region: 'EBAY_HK', display: 'Hong Kong' },
		{ region: 'EBAY_IE', display: 'Ireland' },
		{ region: 'EBAY_IN', display: 'India' },
		{ region: 'EBAY_IT', display: 'Italy' },
		{ region: 'EBAY_MY', display: 'Malaysia' },
		{ region: 'EBAY_NL', display: 'Netherlands' },
		{ region: 'EBAY_PH', display: 'Philippines' },
		{ region: 'EBAY_PL', display: 'Poland' },
		{ region: 'EBAY_SG', display: 'Singapore' },
		{ region: 'EBAY_TH', display: 'Thailand' },
		{ region: 'EBAY_TW', display: 'Taiwan' },
		{ region: 'EBAY_VN', display: 'Vietnam' },
	];

	const [hasPermission, setHasPermission] = useState(null);
	const [scannerVisible, setScannerVisible] = useState(false);
	const [showRegionExplainer, setShowRegionExplainer] = useState(true);
	const [searchTitle, resetResults, { imdbLoading, imdbError, imdbResults }] =
		useSearchTitle();
	const [selectedRegion, setSelectedRegion] = useState();
	const [titleInput, setTitleInput] = useState();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [useRearCam, setUseRearCam] = useState(true);

	useEffect(() => {
		let isMounted = true;

		(async () => {
			const storedRegion = await getString('ebayRegion');
			if (storedRegion && isMounted) {
				setSelectedRegion(storedRegion);
				setShowRegionExplainer(false);
			}
		})();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			if (imdbResults && imdbResults.length > 0) {
				setLoading(true);
				let omdbRes = await getFromId(imdbResults[0].imdbID);
				if (isMounted && omdbRes) {
					setLoading(false);
					formatMovieData([omdbRes.data.data], imdbResults);
				}
			}
		})();
		return () => {
			isMounted = false;
		};
	}, [imdbResults]);

	const openScanner = () => {
		// uncomment to fake barcode scan in simulator
		// handleBarCodeScanned({ data: '9397810275294' });
		// bttf boxset 5050582788860
		// bourne boxset 5050582710212
		// 1917 9317731158032
		// alien 4k 5039036092432
		// alien boxset 5039036050319
		// akira 704400103612
		setScannerVisible(true);
		if (showRegionExplainer) {
			setShowRegionExplainer(false);
			Alert.alert(
				'Please set your region',
				'For the best results, please select the region in which you bought the disc before scanning it.',
				[
					{
						text: 'Got it',
					},
				]
			);
		}
	};

	const checkPermsOpenScanner = async () => {
		if (!hasPermission) {
			const { status } = await Camera.requestCameraPermissionsAsync();
			const allowed = status === 'granted';
			setHasPermission(allowed);
			if (allowed) openScanner();
		} else {
			openScanner();
		}
	};

	const formatMovieData = async (
		omdbResults,
		imdbResults = null,
		likelyFormat = null,
		barcode = null,
		previous = null
	) => {
		if (!omdbResults && !previous) return;

		const cacheResults = await loadCachedMatches(previous ?? omdbResults);
		const combinedRes = cacheResults.results;

		if (imdbResults) {
			// remove anything which doesn't have a media type (e.g. actors) or year
			imdbResults = imdbResults.filter(
				(imdbItem) => imdbItem.Type && imdbItem.Year
			);
		}

		// use the edit existing item mode if there's only one omdb/cache result which is already in the user's library
		// and either there's nothing found on imdb or the only result is the same ID as we've already got
		if (
			combinedRes.length === 1 &&
			(imdbResults === null ||
				imdbResults.length === 0 ||
				(imdbResults.length === 1 &&
					imdbResults[0].imdbID === combinedRes[0].imdbID)) &&
			combinedRes[0].Prior
		) {
			console.log('edit');
			navigation.navigate('Edit', {
				media: combinedRes[0],
				alternatives: imdbResults,
				mode: 'edit',
				formats: combinedRes[0].Formats,
				barcode: barcode,
			});
		} else {
			console.log('add');
			navigation.navigate('Edit', {
				media: combinedRes[0],
				alternatives: imdbResults,
				mode: 'add',
				likelyFormat: likelyFormat,
				barcode: barcode,
			});
		}
	};

	const handleBarCodeScanned = async ({ data: barcode }) => {
		setScannerVisible(false);

		try {
			setLoading(true);
			const resp = await getFromBarcode(barcode, selectedRegion);
			setLoading(false);

			if (!resp) {
				// TODO
				console.log(resp);
				return setError(
					'Oops! Something went wrong. Please check your connection and try again.'
				);
			} else if (!resp.data.success) {
				setError(null);
				return navigation.navigate('Edit', {
					media: {},
					mode: 'fail',
					barcode: barcode,
				});
			}

			setError(null);
			formatMovieData(
				[resp.data.data],
				resp.data.imdb,
				resp.data.likelyFormat,
				barcode,
				resp.data.previous
			);
		} catch (error) {
			setLoading(false);
			console.log(error);
			setError(
				'Oops! Something went wrong. Please check your connection and try again.'
			);
		}
	};

	return (
		<Screen loading={loading || imdbLoading}>
			{/* SCANNING VIEW */}
			{scannerVisible && (
				<View style={styles.scannerContainer}>
					<Camera
						style={styles.scanWindow}
						onBarCodeScanned={handleBarCodeScanned}
						type={useRearCam ? 'back' : 'front'}></Camera>

					<View style={{ flex: 2 }}>
						<View style={styles.regionPickerContainer}>
							<Text style={styles.regionPickerLabel}>Disc bought in:</Text>
							<Picker
								style={{ minWidth: 200, width: '35%' }}
								selectedValue={selectedRegion}
								onValueChange={(itemValue, itemIndex) => {
									setSelectedRegion(itemValue);
									setString('ebayRegion', itemValue);
								}}>
								{marketplaces.map((mpObj) => (
									<Picker.Item
										label={mpObj.display}
										value={mpObj.region}
										key={mpObj.region}
									/>
								))}
							</Picker>
						</View>

						<Mk_Button
							style={styles.swapCamBtn}
							text={'Swap camera'}
							icon={'camera-flip'}
							onPress={() => setUseRearCam(!useRearCam)}
						/>

						<Mk_Button
							style={styles.closeScanBtn}
							text={'Close Scanner'}
							icon={'barcode-off'}
							onPress={() => setScannerVisible(false)}
						/>
					</View>
				</View>
			)}

			{/* SEARCH OR START SCAN VIEW */}
			{!scannerVisible && (
				<View style={styles.typeOrScanContainer}>
					<Image
						style={styles.logo}
						source={require('../assets/adaptive-icon.png')}
					/>

					{error ||
						(imdbError && (
							<Text style={styles.error}>{error ?? imdbError}</Text>
						))}

					<Mk_TextSearch
						style={{ flex: 1 }}
						onChangeText={(text) => setTitleInput(text)}
						onPress={() =>
							titleInput
								? searchTitle(titleInput)
								: setError('Please enter a movie title')
						}
						placeholder={"Enter a movie or show's title..."}
					/>

					<Text style={styles.or}>or...</Text>

					<View style={styles.lowerButtons}>
						<Mk_Button
							text={'Scan Barcode'}
							icon={'barcode-scan'}
							onPress={() => checkPermsOpenScanner()}
						/>

						{hasPermission === false && (
							<Text style={styles.permissionsWarning}>
								Please allow access to camera
							</Text>
						)}

						<Mk_Button
							style={styles.manualEntryBtn}
							text={'Create Custom'}
							icon={'format-list-bulleted'}
							onPress={() => navigation.navigate('Custom')}
						/>
					</View>
				</View>
			)}
		</Screen>
	);
}

const styles = StyleSheet.create({
	closeScanBtn: {
		position: 'absolute',
		bottom: 20,
	},
	logo: {
		flex: 2,
		width: '100%',
		resizeMode: 'contain',
		paddingTop: 15,
	},
	lowerButtons: {
		flex: 3,
	},
	or: {
		color: colours.medium,
		width: '100%',
		textAlign: 'center',
		marginBottom: 12,
	},
	error: {
		width: '100%',
		textAlign: 'center',
		paddingHorizontal: 10,
		marginBottom: 10,
		color: 'red',
	},
	header: {
		textAlign: 'center',
		fontSize: 18,
		fontWeight: 'bold',
		marginVertical: 10,
	},
	list: {
		flex: 1,
		marginTop: 10,
		borderColor: colours.light_grey,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		paddingTop: 10,
		backgroundColor: colours.light,
	},
	listFooter: {
		height: 100,
	},
	manualEntryBtn: {
		position: 'absolute',
		bottom: 20,
		backgroundColor: colours.secondary,
	},
	modal: {
		width: '100%',
		height: '100%',
		alignContent: 'center',
		justifyContent: 'center',
	},
	permissionsWarning: {
		width: '100%',
		textAlign: 'center',
		marginTop: 7,
		color: 'red',
	},
	regionPickerContainer: {
		flexDirection: 'row',
		width: '100%',
		justifyContent: 'center',
	},
	regionPickerLabel: {
		textAlign: 'right',
		paddingRight: 10,
		textAlignVertical: 'center',
	},
	swapCamBtn: {
		marginTop: 15,
		backgroundColor: colours.secondary,
	},
	scannerContainer: {
		height: '100%',
		textAlignVertical: 'center',
	},
	scanWindow: {
		width: '100%',
		flex: 4,
		marginBottom: 5,
	},
	typeOrScanContainer: {
		height: '100%',
		justifyContent: 'center',
	},
});
