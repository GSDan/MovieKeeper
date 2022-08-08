import { StyleSheet, View, SafeAreaView, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import Constants from "expo-constants";

import colours from '../config/colours';

export default function Mk_Screen({ children, loading, style })
{
    const [media, setMedia] = useState({})

    return (
        <SafeAreaView style={[styles.screen, style]}>
            {/* LOADING VIEW */}
            {loading &&
                <ActivityIndicator animating={loading} style={styles.loadingIndicator} size="large" />
            }
            {!loading &&
                <View style={[styles.view, style]}>{children}</View>
            }
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    loadingIndicator: {
        height: '100%',
        alignSelf: 'center',
        color: colours.primary
    },
    screen: {
        paddingTop: Constants.statusBarHeight,
        flex: 1,
    },
    view: {
        flex: 1,
    },
});