import { StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Screen from "../components/Mk_Screen";
import { useLogout, AuthContext } from '../hooks/userAuthentication';
import Mk_Button from '../components/Mk_Button';
import { useFocusEffect } from '@react-navigation/native';
import { getData } from '../config/storage';
import colours from '../config/colours';

export default function ProfileScreen()
{
    const [libraryData, setLibraryData] = useState([]);
    const [libraryStats, setLibraryStats] = useState([]);
    const authContext = useContext(AuthContext);
    const logout = useLogout();

    useEffect(() =>
    {
        let genres = {}

        let toRet = {
            'count': 0,
            'runtime': 0,
            'movies': 0,
            'shows': 0,
            'withScore': 0,
            'runningScore': 0
        };

        libraryData.forEach(item =>
        {
            toRet.count++;

            if (item.Type === 'movie') 
            {
                toRet.movies++
                if (item.Runtime) toRet.runtime += parseInt(item.Runtime)
            }
            else toRet.shows++;

            if (item.imdbRating)
            {
                toRet.withScore++;
                toRet.runningScore += parseFloat(item.imdbRating);
            }

            if (item.Genre)
            {
                let thisGenres = item.Genre.split(',');
                thisGenres.forEach(g =>
                {
                    if (!genres[g]) genres[g] = 1;
                    else genres[g]++;
                })
            }
        });

        if (Object.keys(genres).length > 0)
        {
            toRet.topGenreCount = 0;
            for (const g in genres)
            {
                if (genres[g] > toRet.topGenreCount)
                {
                    toRet.topGenreCount = genres[g];
                    toRet.topGenre = g;
                }
            }
        }

        setLibraryStats(toRet);
    }, [libraryData]);

    const getCountString = () =>
    {
        return `You have ${libraryStats.count} item${libraryStats.count != 1 ? 's' : ''} in your library, ` +
            `with ${libraryStats.movies} movie${libraryStats.movies != 1 ? 's' : ''} ` +
            `and ${libraryStats.shows} TV show${libraryStats.shows != 1 ? 's' : ''}.`
    }

    const getTimeString = () =>
    {
        if (libraryStats.runtime === 0) return "Add some movies to get some stats!"

        const mins = libraryStats.runtime;
        const toRet = "Watching all of your movies would take ";
        if (mins < 180) return `${toRet} ${mins} minutes.`
        if (mins < 48 * 60) return `${toRet} ${(mins / parseFloat(60)).toFixed(1)} hours.`
        return `${toRet} ${(mins / parseFloat(60) / 24 * 10).toFixed(1)} days!`
    }

    const getScoreString = () => 
    {
        if (libraryStats.withScore === 0) return "You must have some movies kicking around somewhere?"
        return `Your library's average IMDB score is ${(libraryStats.runningScore / libraryStats.withScore).toFixed(2)}.`;
    }

    const getTopGenre = () =>
    {
        if (!libraryStats.topGenre) return "I'm pretty sure I saw a disk under the couch..."
        return `Your top genre is ${libraryStats.topGenre}, with ${libraryStats.topGenreCount} entries!`
    }

    useFocusEffect(
        React.useCallback(() =>
        {
            getData('library').then(data => setLibraryData(data));
        }, [])
    );

    return (
        <Screen style={styles.screen}>

            <View style={styles.headerContainer}>
                <Text style={styles.header}>Thanks for using MovieKeeper!</Text>
                <MaterialCommunityIcons
                    style={{ color: colours.white, textAlign: 'center' }}
                    name={'code-braces-box'}
                    size={30} />
                <Text style={styles.subheader}>Found some bugs or want new features?</Text>
                <Text style={styles.subheader}>The codebase is free and open source! Suggest changes at github.com/GSDan/MovieKeeper</Text>
            </View>

            <MaterialCommunityIcons
                style={{ color: colours.primary, textAlign: 'center' }}
                name={'alert-octagram'}
                size={30} />

            <Text style={styles.fact}>{getCountString()}</Text>
            <Text style={styles.fact}>{getTimeString()}</Text>
            <Text style={styles.fact}>{getScoreString()}</Text>
            <Text style={styles.fact}>{getTopGenre()}</Text>

            <View style={styles.logoutContainer}>
                <Text style={styles.currentUser}>
                    You're logged in as {authContext.currentUser.email}
                </Text>
                <Mk_Button
                    text={'Sign Out'}
                    style={styles.logoutButton}
                    onPress={logout} />
            </View>

        </Screen>
    )
}

const styles = StyleSheet.create({
    currentUser: {
        textAlign: 'center',
        marginBottom: 13,
        color: colours.secondary
    },
    fact: {
        marginVertical: 10,
        textAlign: 'center',
        fontSize: 18,
        marginHorizontal: 15,
        color: colours.medium
    },
    header: {
        textAlign: 'center',
        fontSize: 24,
        color: colours.white,
        fontWeight: 'bold',
        marginBottom: 8
    },
    headerContainer: {
        position: 'absolute',
        top: 30,
        width: '100%',
        marginBottom: 40,
        backgroundColor: colours.primary,
        padding: 20
    },
    logoutContainer: {
        position: 'absolute',
        bottom: 10,
        width: '100%'
    },
    screen: {
        justifyContent: 'center'
    },
    subheader: {
        textAlign: 'center',
        fontSize: 16,
        color: colours.white
    }
});