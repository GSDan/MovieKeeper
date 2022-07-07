import { StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'

import Screen from "../components/Mk_Screen";
import colours from '../config/colours';
import libraryItemsApi from '../api/libraryItems';
import Mk_Button from '../components/Mk_Button';
import Mk_RoundButton from '../components/Mk_RoundButton';
import Mk_RottenScore from '../components/Mk_RottenScore';
import Mk_ImdbScore from '../components/Mk_ImdbScore';


export default function EditItemScreen({ navigation, route })
{
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const movie = route.params.movie;
    const mode = route.params.mode;

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

                    <Mk_RoundButton icon={'close'} onPress={() => navigation.pop()} />
                </View>
            }
        </Screen>
    )
}

const styles = StyleSheet.create({
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
        height: '40%'
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
        textAlign: 'center'
    }
})