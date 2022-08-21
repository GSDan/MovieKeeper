import { StyleSheet, View, SafeAreaView, ActivityIndicator, StatusBar } from 'react-native'

import colours from '../config/colours';

export default function Mk_Screen({ children, loading, style })
{

    return (
        <SafeAreaView style={[{ flex: 1 }, style]}>
            <StatusBar
                animated={true}
                backgroundColor={colours.primary}
                barStyle={'light-content'}
                showHideTransition={'fade'}
                hidden={false}
            />
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
    view: {
        flex: 1,
    },
});