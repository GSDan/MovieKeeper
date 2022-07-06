import { StyleSheet, TouchableOpacity, Text } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';

import colours from '../config/colours';

const Mk_Button = ({ text, icon, onPress }) =>
{
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>
                {text}
            </Text>
            <MaterialCommunityIcons
                style={styles.buttonIcon}
                name={icon}
                size={20} />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: colours.primary,
        flexDirection: "row",
        alignSelf: 'center',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 18,
        paddingRight: 18,
        borderRadius: 10
    },
    buttonText: {
        color: colours.white
    },
    buttonIcon: {
        color: colours.white,
        marginLeft: 10
    }
});

export default Mk_Button