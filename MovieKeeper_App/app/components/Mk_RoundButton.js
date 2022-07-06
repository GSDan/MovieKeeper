import { StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';

import colours from '../config/colours';

const Mk_RoundButton = ({ icon, onPress }) =>
{
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <MaterialCommunityIcons
                style={styles.buttonIcon}
                name={icon}
                size={20} />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        width: 40,
        height: 40,
        borderRadius: 40,
        justifyContent: 'center',
        marginLeft: 10,
        backgroundColor: colours.secondary
    },
    buttonIcon: {
        color: colours.white,
        textAlign: 'center',
        textAlignVertical: 'center'
    }
});

export default Mk_RoundButton