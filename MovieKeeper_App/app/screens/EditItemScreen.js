import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';

import Screen from "../components/Mk_Screen";
import colours from '../config/colours';
import libraryItemsApi from '../api/libraryItems';


export default function EditItemScreen()
{
    const [hasPermission, setHasPermission] = useState(null);
    const [scannerVisible, setScannerVisible] = useState(false);

    useEffect(() =>
    {
        (async () =>
        {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = async ({ type, data }) =>
    {
        setScannerVisible(false);

        // alert(`Bar code with type ${type} and data ${data} has been scanned!`);

        const resp = await libraryItemsApi.getFromBarcode(data, 'EBAY_GB');

        if (resp.ok)
        {
            console.log(resp.data)
            if (resp.data.success)
            {
                alert(`Looks like a ${resp.data.likelyFormat} of ${resp.data.data.Title}!`);
            }
            else
            {
                alert(`Couldn't find, closest match: ${resp.data.data}`);
            }

        }
    };

    if (hasPermission === null)
    {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false)
    {
        return <Text>No access to camera</Text>;
    }

    return (
        <Screen>
            {scannerVisible &&
                <BarCodeScanner
                    onBarCodeScanned={handleBarCodeScanned}
                    style={styles.scanWindow}
                />}
            <TouchableOpacity style={styles.barcodeBtnContainer} onPress={() => setScannerVisible(!scannerVisible)}>
                <View style={styles.barcodeBtn}>
                    <Text style={styles.barcodeBtnText}>
                        {scannerVisible ? 'Close Scanner' : 'Scan Barcode'}
                    </Text>
                    <MaterialCommunityIcons
                        style={styles.barcodeBtnIcon}
                        name={scannerVisible ? 'barcode-off' : 'barcode-scan'}
                        size={20} />
                </View>
            </TouchableOpacity>
        </Screen>
    )
}

const styles = StyleSheet.create({
    barcodeBtnContainer: {
        alignSelf: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row'
    },
    barcodeBtn: {
        backgroundColor: colours.primary,
        flexDirection: "row",
        justifyContent: 'center',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 18,
        paddingRight: 18,
        borderRadius: 10
    },
    barcodeBtnText: {
        color: colours.white
    },
    barcodeBtnIcon: {
        color: colours.white,
        marginLeft: 10
    },
    scanWindow: {
        width: '100%',
        height: '50%',
        marginBottom: 10
    }
})