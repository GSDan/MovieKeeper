import { StyleSheet, TextInput, View } from 'react-native'
import React from 'react'
import Mk_RoundButton from './Mk_RoundButton';

import colours from '../config/colours';

const Mk_TextSearch = ({ placeholder, onPress, onChangeText, style }) =>
{
    return (
        <View style={[styles.searchContainer, style]}>
            <TextInput
                style={styles.searchInput}
                placeholder={placeholder}
                onChangeText={onChangeText}></TextInput>

            <Mk_RoundButton
                icon={'magnify'}
                style={{ marginLeft: 10 }}
                onPress={onPress} />
        </View>
    )
}

const styles = StyleSheet.create({
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
});

export default Mk_TextSearch