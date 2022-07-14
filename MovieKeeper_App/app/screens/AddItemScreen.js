import { StyleSheet, Text, View, ActivityIndicator, TextInput, Alert, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Picker } from '@react-native-picker/picker';

import Screen from "../components/Mk_Screen";
import colours from '../config/colours';
import { getFromBarcode, getFromTitle } from '../api/libraryItems';
import Mk_Button from '../components/Mk_Button';
import Mk_RoundButton from '../components/Mk_RoundButton';
import { getString, setString } from '../config/storage';

export default function AddItemScreen({ navigation })
{
    const marketplaces =
        [
            { 'region': 'EBAY_US', 'display': 'United States' },
            { 'region': 'EBAY_AT', 'display': 'Austria' },
            { 'region': 'EBAY_AU', 'display': 'Australia' },
            { 'region': 'EBAY_BE', 'display': 'Belgium' },
            { 'region': 'EBAY_CA', 'display': 'Canada' },
            { 'region': 'EBAY_CH', 'display': 'Switzerland' },
            { 'region': 'EBAY_DE', 'display': 'Germany' },
            { 'region': 'EBAY_ES', 'display': 'Spain' },
            { 'region': 'EBAY_FR', 'display': 'France' },
            { 'region': 'EBAY_GB', 'display': 'Great Britain' },
            { 'region': 'EBAY_HK', 'display': 'Hong Kong' },
            { 'region': 'EBAY_IE', 'display': 'Ireland' },
            { 'region': 'EBAY_IN', 'display': 'India' },
            { 'region': 'EBAY_IT', 'display': 'Italy' },
            { 'region': 'EBAY_MY', 'display': 'Malaysia' },
            { 'region': 'EBAY_NL', 'display': 'Netherlands' },
            { 'region': 'EBAY_PH', 'display': 'Philippines' },
            { 'region': 'EBAY_PL', 'display': 'Poland' },
            { 'region': 'EBAY_SG', 'display': 'Singapore' },
            { 'region': 'EBAY_TH', 'display': 'Thailand' },
            { 'region': 'EBAY_TW', 'display': 'Taiwan' },
            { 'region': 'EBAY_VN', 'display': 'Vietnam' }
        ]

    const [hasPermission, setHasPermission] = useState(null);
    const [scannerVisible, setScannerVisible] = useState(false);
    const [showRegionExplainer, setShowRegionExplainer] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState();
    const [titleInput, setTitleInput] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() =>
    {
        (async () =>
        {
            const storedRegion = await getString('ebayRegion');
            if (storedRegion) 
            {
                setSelectedRegion(storedRegion);
                setShowRegionExplainer(false);
            }
        })();
    }, []);

    const openScanner = () =>
    {
        setScannerVisible(true);
        if (showRegionExplainer)
        {
            setShowRegionExplainer(false);
            Alert.alert(
                'Please set your region',
                'For the best results, please select the region in which you bought the disc before scanning it.',
                [
                    {
                        text: 'Got it'
                    }
                ]);
        }
    }

    const checkPermsOpenScanner = async () =>
    {
        if (!hasPermission)
        {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            const allowed = status === 'granted';
            setHasPermission(allowed);
            if (allowed) openScanner();
        }
        else
        {
            openScanner();
        }
    };

    const formatMovieData = (mediaResults, likelyFormat = null, barcode = null) =>
    {
        mediaResults.forEach(mediaRes =>
        {
            if (mediaRes.Ratings)
            {
                const rotten = mediaRes.Ratings.find(r => r.Source === 'Rotten Tomatoes');
                if (rotten) mediaRes.ScoreRotten = rotten.Value;
            }
        });

        // TODO check if we have this media already in the library
        navigation.navigate("Edit",
            {
                'media': mediaResults,
                'mode': 'add',
                'likelyFormat': likelyFormat,
                'barcode': barcode
            }
        )
    }

    const searchOmdb = async (title) =>
    {
        if (!title) return setError('Please enter a movie title');

        setLoading(true);
        const resp = await getFromTitle(title);

        if (!resp || !resp.data || !resp.data.success)
        {
            setLoading(false);
            return setError(resp && resp.data ? "Couldn't find a movie with that title" : "Something went wrong")
        }

        setError(null);
        formatMovieData([resp.data.data], null);
        setLoading(false);
    }

    const handleBarCodeScanned = async ({ data: barcode }) =>
    {
        setScannerVisible(false);

        setLoading(true);
        const resp = await getFromBarcode(barcode, selectedRegion);
        setLoading(false);

        if (!resp || !resp.data.success)
        {
            console.log(resp)
            return setError(true)
        }

        setError(false);
        formatMovieData(resp.data.data, resp.data.likelyFormat, barcode)
    };

    return (
        <Screen>

            {/* LOADING VIEW */}
            {loading &&
                <ActivityIndicator animating={loading} style={styles.loadingIndicator} size="large" />
            }

            {/* SCANNING VIEW */}
            {scannerVisible && !loading &&
                <View style={styles.scannerContainer}>
                    <BarCodeScanner
                        onBarCodeScanned={handleBarCodeScanned}
                        style={styles.scanWindow}
                    />
                    <View style={styles.regionPickerContainer}>
                        <Text style={styles.regionPickerLabel}>
                            Disc bought in:
                        </Text>
                        <Picker
                            style={{ flex: 6 }}
                            selectedValue={selectedRegion}
                            onValueChange={(itemValue, itemIndex) =>
                            {
                                setSelectedRegion(itemValue);
                                setString('ebayRegion', itemValue);
                            }}>
                            {
                                marketplaces.map((mpObj) =>
                                    <Picker.Item
                                        label={mpObj.display}
                                        value={mpObj.region}
                                        key={mpObj.region} />
                                )
                            }
                        </Picker>
                    </View>

                    <Mk_Button
                        style={styles.barcodeBtn}
                        text={'Close Scanner'}
                        icon={'barcode-off'}
                        onPress={() => setScannerVisible(false)} />
                </View>
            }

            {/* SEARCH OR START SCAN VIEW */}
            {!scannerVisible && !loading &&
                <View style={styles.typeOrScanContainer}>

                    <Image style={styles.logo} source={require("../assets/adaptive-icon.png")} />

                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder='Search for a film title...'
                            onChangeText={setTitleInput}></TextInput>

                        <Mk_RoundButton
                            icon={'magnify'}
                            style={{ marginLeft: 10 }}
                            onPress={() => searchOmdb(titleInput)} />
                    </View>

                    <Text style={{ color: colours.medium, width: '100%', textAlign: 'center', marginTop: 12, marginBottom: 12 }}>
                        or...
                    </Text>

                    <Mk_Button
                        text={'Scan Barcode'}
                        icon={'barcode-scan'}
                        onPress={() => checkPermsOpenScanner()} />

                    {hasPermission === false &&
                        <Text style={styles.permissionsWarning}>
                            Please allow access to camera
                        </Text>
                    }

                </View>

            }
        </Screen>
    )
}

const styles = StyleSheet.create({
    loadingIndicator: {
        height: '100%',
        alignSelf: 'center',
        color: colours.primary
    },
    logo: {
        height: '22%',
        width: '100%',
        marginBottom: 20,
        resizeMode: 'contain'
    },
    permissionsWarning: {
        width: '100%',
        textAlign: 'center',
        marginTop: 7,
        color: 'red'
    },
    regionPickerContainer: {
        flexDirection: "row",
        width: '100%'
    },
    regionPickerLabel: {
        flex: 4,
        textAlign: 'right',
        paddingRight: 10,
        textAlignVertical: 'center'
    },
    scannerContainer: {
        height: '100%',
        textAlignVertical: 'center'
    },
    scanWindow: {
        width: '100%',
        height: '75%',
        marginBottom: 5
    },
    searchContainer: {
        flexDirection: "row",
        justifyContent: 'center',
        width: '100%',
        height: 50,
        alignItems: 'center'
    },
    searchInput: {
        borderColor: colours.secondary,
        borderWidth: 2,
        padding: 8,
        paddingLeft: 12,
        borderRadius: 10,
        width: '70%'
    },
    typeOrScanContainer: {
        height: '100%',
        justifyContent: 'center'
    }
})