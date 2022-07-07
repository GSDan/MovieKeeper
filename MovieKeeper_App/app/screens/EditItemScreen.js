import { StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import Checkbox from 'expo-checkbox';

import Screen from "../components/Mk_Screen";
import colours from '../config/colours';
import libraryItemsApi from '../api/libraryItems';
import Stars from "../components/Mk_Stars";
import Mk_RoundButton from '../components/Mk_RoundButton';
import Mk_RottenScore from '../components/Mk_RottenScore';
import Mk_ImdbScore from '../components/Mk_ImdbScore';


export default function EditItemScreen({ navigation, route })
{
    const [dvdChecked, setDvdChecked] = useState(false);
    const [bluChecked, setBluChecked] = useState(false);
    const [uhdChecked, setUhdChecked] = useState(false);
    const [userRating, setUserRating] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const movie = route.params.movie;
    const mode = route.params.mode;

    useEffect(() =>
    {
        (async () =>
        {
            if (route.params.likelyFormat)
            {
                switch (route.params.likelyFormat)
                {
                    case '4K':
                        setUhdChecked(true);
                        break;
                    case 'Blu-ray':
                        setBluChecked(true);
                        break;
                    case 'DVD':
                        setDvdChecked(true);
                        break;
                    default:
                        console.log('What is this', route.params.likelyFormat)
                }
            }
        })();
    }, []);



    return (
        <Screen>

            {/* LOADING VIEW */}
            {loading &&
                <ActivityIndicator animating={loading} style={styles.loadingIndicator} size="large" />
            }

            {!loading &&
                <View style={styles.movieContainer}>
                    <Image style={styles.movieImage} source={{ uri: movie.Poster }} />
                    <Text
                        numberOfLines={2}
                        style={styles.movieTitle}>
                        {movie.Title}
                    </Text>
                    <Text style={styles.movieDetails} numberOfLines={2}>
                        {movie.Actors}
                    </Text>
                    <Text style={styles.movieDetails} numberOfLines={2}>
                        Directed by {movie.Director}
                    </Text>
                    <Text style={styles.movieDetails}>
                        {movie.Rated} | {movie.Year} | {movie.Runtime}
                    </Text>

                    <View style={styles.movieRatingsContainer}>
                        {movie.ScoreRotten && <Mk_RottenScore score={movie.ScoreRotten} />}
                        {movie.imdbRating &&
                            <Mk_ImdbScore
                                score={movie.imdbRating}
                                style={{ marginLeft: movie.ScoreRotten ? 8 : 0 }} />}
                    </View>

                    <Text style={styles.sectionHeader}>Your Rating</Text>

                    <Stars
                        value={userRating}
                        isTouchable={true}
                        containerStyle={styles.starContainer}
                        starStyle={styles.stars}
                        onPress={(score) => setUserRating(score)} />

                    <Text style={styles.sectionHeader}>Owned Formats</Text>

                    <View style={styles.ownedFormatsContainer}>
                        <View style={styles.ownedFormat}>
                            <Text style={styles.ownedFormatTitle}>DVD</Text>
                            <Checkbox color={colours.secondary} style={styles.ownedFormatCheckbox} value={dvdChecked} onValueChange={setDvdChecked} />
                        </View>
                        <View style={styles.ownedFormat}>
                            <Text style={styles.ownedFormatTitle}>Blu-ray</Text>
                            <Checkbox color={colours.secondary} style={styles.ownedFormatCheckbox} value={bluChecked} onValueChange={setBluChecked} />
                        </View>
                        <View style={styles.ownedFormat}>
                            <Text style={styles.ownedFormatTitle}>4K</Text>
                            <Checkbox color={colours.secondary} style={styles.ownedFormatCheckbox} value={uhdChecked} onValueChange={setUhdChecked} />
                        </View>
                    </View>



                    <Mk_RoundButton
                        style={styles.cancelButton}
                        icon={'close'}
                        onPress={() => navigation.pop()} />

                    <Mk_RoundButton
                        style={styles.saveButton}
                        icon={'check-bold'}
                        onPress={() => navigation.pop()} />
                </View>
            }
        </Screen>
    )
}

const styles = StyleSheet.create({
    cancelButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 50,
        height: 50,
        backgroundColor: colours.primary,
        iconSize: 30
    },
    saveButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 50,
        height: 50,
        backgroundColor: colours.secondary,
        iconSize: 30
    },
    loadingIndicator: {
        height: '100%',
        alignSelf: 'center',
        color: colours.primary
    },
    movieContainer: {
        width: '100%',
        height: '100%',
    },
    movieImage: {
        width: '100%',
        height: '40%',
    },
    movieRatingsContainer: {
        marginTop: 10,
        flexDirection: "row",
        fontSize: 18,
        width: '100%',
        justifyContent: 'center'
    },
    movieTitle: {
        marginTop: 10,
        marginBottom: 10,
        width: '100%',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    movieDetails: {
        textAlign: 'center',
        color: colours.medium
    },
    ownedFormatsContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center'
    },
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
    sectionHeader: {
        width: '100%',
        textAlign: 'center',
        marginVertical: 12,
        fontWeight: 'bold'
    },
    starContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    stars: {
        width: 35,
        height: 35,
        marginHorizontal: 1
    }
})