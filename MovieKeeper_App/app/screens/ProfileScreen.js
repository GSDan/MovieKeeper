import { StyleSheet, Text, View, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart } from 'react-native-svg-charts'
import randomColor from "randomcolor";

import Screen from "../components/Mk_Screen";
import { useLogout, AuthContext } from '../hooks/userAuthentication';
import Mk_Button from '../components/Mk_Button';
import { getData } from '../config/storage';
import colours from '../config/colours';

export default function ProfileScreen()
{
    const [libraryData, setLibraryData] = useState([]);
    const [libraryStats, setLibraryStats] = useState([]);
    const [labelWidth, setLabelWidth] = useState(100);
    const [selectedSlice, setSelectedSlice] = useState(null);
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
                    g = g.trim();
                    if (!genres[g]) genres[g] = { count: 1, colour: randomColor() };
                    else genres[g].count++;
                })
            }
        });

        toRet.genres = genres;

        let most = 0;
        let top = null;

        for (const g in genres)
        {
            if (genres[g].count > most) 
            {
                top = g;
                most = genres[g].count;
            }
        }

        setSelectedSlice(top);

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
        return `${toRet} ${(mins / parseFloat(60) / 24).toFixed(1)} days!`
    }

    const getScoreString = () => 
    {
        if (libraryStats.withScore === 0) return "You must have some movies kicking around somewhere?"
        return `Your library's average IMDB score is ${(libraryStats.runningScore / libraryStats.withScore).toFixed(2)}.`;
    }

    const getPieData = () =>
    {
        let genres = Object.keys(libraryStats.genres ?? {});
        if (genres.length === 0) return [];

        return genres.map(g =>
        {
            let selected = selectedSlice === g;
            return {
                key: g,
                value: libraryStats.genres[g].count,
                svg: { fill: libraryStats.genres[g].colour },
                arc: { outerRadius: selected ? 100 : 90, innerRadius: 65, padAngle: selected ? 0.075 : 0 },
                onPress: () =>
                {
                    setSelectedSlice(g);
                }
            }
        });
    }

    const getTopGenre = () =>
    {
        if (!libraryStats.topGenre) return "I'm pretty sure I saw a disk under the couch..."
        return `Your top genre is ${libraryStats.topGenre}, with ${libraryStats.topGenreCount} entries!`
    }

    const deviceWidth = Dimensions.get('window').width

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

            <View style={{ flex: 4, paddingTop: 20 }}>
                <MaterialCommunityIcons
                    style={{ color: colours.primary, textAlign: 'center' }}
                    name={'alert-octagram'}
                    size={30} />

                <Text style={styles.fact}>{getCountString()}</Text>
                <Text style={styles.fact}>{getTimeString()}</Text>
                <Text style={styles.fact}>{getScoreString()}</Text>
            </View>

            {Object.keys(libraryStats.genres).length === 0 ?

                <Text style={[{ flex: 7 }, styles.fact]}>I'm pretty sure I saw a disk under the couch...</Text> :

                <View style={{ flex: 7 }}>
                    <Text style={styles.pieHeader}>Your owned movie genres:</Text>

                    <View style={{ justifyContent: 'center', flex: 6 }}>
                        <PieChart
                            style={{ height: '100%' }}
                            data={getPieData()}
                        />

                        {selectedSlice ?
                            <Text
                                onLayout={({ nativeEvent: { layout: { width } } }) =>
                                {
                                    setLabelWidth(width);
                                }}
                                style={{
                                    position: 'absolute',
                                    left: deviceWidth / 2 - labelWidth / 2,
                                    textAlign: 'center'
                                }}>{selectedSlice}: {libraryStats.genres[selectedSlice].count}</Text>
                            : null}
                    </View>
                </View>

            }




            <View style={styles.logoutContainer}>
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
        marginVertical: 8,
        textAlign: 'center',
        fontSize: 16,
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
        width: '100%',
        backgroundColor: colours.primary,
        paddingHorizontal: 20,
        paddingBottom: 10,
        paddingTop: 8,
        flex: 3
    },
    logoutContainer: {
        flex: 1,
        width: '100%'
    },
    pieHeader: {
        textAlignVertical: 'bottom',
        textAlign: 'center',
        flex: 1,
        fontSize: 16,
        color: colours.medium
    },
    screen: {
        justifyContent: 'center'
    },
    subheader: {
        textAlign: 'center',
        fontSize: 14,
        color: colours.white
    }
});