import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Checkbox from 'expo-checkbox';

import colours from '../config/colours';

const Mk_FormatCheckbox = ({ formatName, checked, onValueChange }) =>
{
    return (
        <View style={styles.ownedFormat}>
            <Text style={styles.ownedFormatTitle}>{formatName}</Text>
            <Checkbox
                color={colours.secondary}
                style={styles.ownedFormatCheckbox}
                value={checked}
                onValueChange={onValueChange} />
        </View>
    )
}

const styles = StyleSheet.create({
    ownedFormat: {
        width: '25%',
        borderColor: colours.primary,
        borderWidth: 2,
        marginHorizontal: 4,
    },
    ownedFormatTitle: {
        textAlign: 'center',
        backgroundColor: colours.primary,
        color: colours.white,
        paddingBottom: 3
    },
    ownedFormatCheckbox: {
        alignSelf: 'center',
        marginVertical: 4
    },
});

export default Mk_FormatCheckbox;