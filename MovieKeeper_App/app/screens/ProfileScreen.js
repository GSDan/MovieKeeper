import { StyleSheet, Text } from 'react-native'
import React, { useContext } from 'react'

import Screen from "../components/Mk_Screen";
import { useLogout, AuthContext } from '../hooks/userAuthentication';
import Mk_Button from '../components/Mk_Button';

export default function ProfileScreen()
{
    const authContext = useContext(AuthContext);

    const logout = useLogout();

    return (
        <Screen style={styles.screen}>
            <Text style={styles.currentUser}>
                You're logged in as {authContext.currentUser.email}
            </Text>
            <Mk_Button
                text={'Sign Out'}
                style={styles.logoutButton}
                onPress={logout} />
        </Screen>
    )
}

const styles = StyleSheet.create({
    screen: {
        justifyContent: 'center',
        padding: 10
    },
    currentUser: {
        textAlign: 'center',
        marginBottom: 10
    }
});