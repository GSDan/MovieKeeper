import { StyleSheet, Text, View, Image, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import Toast from 'react-native-root-toast';

import Screen from "../components/Mk_Screen";
import colours from '../config/colours';
import { addToLibrary, deleteFromLibrary } from '../api/libraryItems';
import Stars from "../components/Mk_Stars";
import Mk_RoundButton from '../components/Mk_RoundButton';
import Mk_RottenScore from '../components/Mk_RottenScore';
import Mk_ImdbScore from '../components/Mk_ImdbScore';
import Mk_FormatCheckbox from '../components/Mk_FormatCheckbox';
import { AuthContext } from '../hooks/userAuthentication';

export default function EditItemScreen({ navigation, route })
{
    const [dvdChecked, setDvdChecked] = useState(false);
    const [bluChecked, setBluChecked] = useState(false);
    const [uhdChecked, setUhdChecked] = useState(false);
    const [userRating, setUserRating] = useState(null);
    const [loading, setLoading] = useState(false);
    const [changed, setChanged] = useState(true);
    const [error, setError] = useState(null);
    const authContext = useContext(AuthContext);

    const mode = route.params.mode;
    const media = route.params.media;
    const barcode = route.params.barcode;
    const movie = mode === 'fail' ? {} : media[0] //TODO
    const isBoxset = media.length > 1;
    const existingFormats = route.params.formats;

    const addFormat = (format) =>
    {
        switch (format)
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
        }
    }

    useEffect(() =>
    {
        (async () =>
        {
            if (mode === 'edit')
            {
                setUserRating(movie.UserRating)

                if (existingFormats)
                {
                    existingFormats.forEach(format =>
                    {
                        addFormat(format);
                    });
                }
                setChanged(false);
            }
            else if (route.params.likelyFormat)
            {
                addFormat(route.params.likelyFormat);
            }
        })();
    }, []);

    const saveToDb = async () =>
    {
        if (!changed) return navigation.pop()

        setLoading(true)

        let formats = [];

        if (dvdChecked) formats.push('DVD');
        if (bluChecked) formats.push('Blu-ray');
        if (uhdChecked) formats.push('4K')

        if (barcode) movie.Barcode = barcode;

        try
        {
            await addToLibrary(movie, userRating, formats);
        }
        catch (error)
        {
            console.log(error)
        }

        setLoading(false);
        authContext.setShouldRefreshContent(true);

        Toast.show((mode === 'edit' ? 'Updated ' : 'Added ') + movie.Title, {
            duration: Toast.durations.LONG,
        });

        navigation.pop()
    }

    const confirmDeletion = async () =>
    {
        Alert.alert(
            'Confirm',
            `Are you sure you want to delete ${movie.Title} from your library?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () =>
                    {
                        try
                        {
                            setLoading(true);
                            await deleteFromLibrary(movie.Type, movie.imdbID)
                            authContext.setShouldRefreshContent(true);
                            Toast.show('Deleted ' + movie.Title, {
                                duration: Toast.durations.LONG,
                            });
                            navigation.pop();
                        } catch (error)
                        {
                            setLoading(false);
                            setError(error);
                        }
                    }
                },
            ],
            {
                cancelable: true
            });
    }

    return (
        <Screen>
            {error && <Text>{error}</Text>}

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
                        onPress={(score) => { setChanged(true); setUserRating(score) }} />

                    <Text style={styles.sectionHeader}>Owned Formats</Text>

                    <View style={styles.ownedFormatsContainer}>
                        <Mk_FormatCheckbox
                            formatName={'DVD'}
                            checked={dvdChecked}
                            onValueChange={(val) =>
                            {
                                setChanged(true);
                                setDvdChecked(val);
                            }} />

                        <Mk_FormatCheckbox
                            formatName={'Blu-ray'}
                            checked={bluChecked}
                            onValueChange={(val) =>
                            {
                                setChanged(true);
                                setBluChecked(val);
                            }} />

                        <Mk_FormatCheckbox
                            formatName={'4K'}
                            checked={uhdChecked}
                            onValueChange={(val) =>
                            {
                                setChanged(true);
                                setUhdChecked(val);
                            }} />
                    </View>

                    <Mk_RoundButton
                        style={styles.cancelButton}
                        icon={mode === 'edit' ? 'delete-forever' : 'close'}
                        onPress={() => mode === 'edit' ? confirmDeletion() : navigation.pop()} />

                    <Mk_RoundButton
                        style={styles.saveButton}
                        icon={mode === 'edit' ? 'content-save' : 'plus-thick'}
                        onPress={() => saveToDb()} />
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