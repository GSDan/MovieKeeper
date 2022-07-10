import { StyleSheet, View } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';

import colours from '../config/colours';

export default function Mk_Logo({ style })
{
    return (
        <View style={[styles.circleContainer, style]}>
            <View style={styles.circleOuter}>
                <View style={styles.circleInner}>
                    <MaterialCommunityIcons
                        style={{ color: colours.primary }}
                        name={'movie-search'}
                        size={100} />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    circleContainer: {
        width: '100%',
        alignItems: 'center'
    },
    circleInner: {
        width: 150,
        height: 150,
        backgroundColor: colours.white,
        borderRadius: 150,
        justifyContent: 'center',
        alignItems: 'center'
    },
    circleOuter: {
        width: 170,
        height: 170,
        backgroundColor: colours.secondary,
        borderRadius: 170,
        justifyContent: 'center',
        alignItems: 'center'
    }
});