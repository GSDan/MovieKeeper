import { StyleSheet, Text, View, Image, Alert } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import Toast from 'react-native-root-toast';

import Screen from "../components/Mk_Screen";
import colours from '../config/colours';
import { addSingleToLibrary, deleteFromLibrary } from '../api/libraryItems';
import Stars from "../components/Mk_Stars";
import Mk_RoundButton from '../components/Mk_RoundButton';
import Mk_RottenScore from '../components/Mk_RottenScore';
import Mk_ImdbScore from '../components/Mk_ImdbScore';
import Mk_FormatCheckbox from '../components/Mk_FormatCheckbox';
import { AuthContext } from '../hooks/userAuthentication';
import Mk_ModalSearch from '../components/Mk_ModalSearch';
import Mk_FormatSelector from '../components/Mk_FormatSelector';
import Mk_Button from '../components/Mk_Button';

export default function EditItemScreen({ navigation, route })
{
    const [selectedFormats, setSelectedFormats] = useState([]);
    const [userRating, setUserRating] = useState(null);
    const [showSetTitleModal, setShowSetTitleModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [changed, setChanged] = useState(true);
    const [media, setMedia] = useState({})
    const [error, setError] = useState(null);
    const authContext = useContext(AuthContext);

    const mode = route.params.mode;
    const barcode = route.params.barcode;
    const existingFormats = route.params.formats;

    useEffect(() =>
    {
        (async () =>
        {
            if (mode === 'fail')
            {
                setShowSetTitleModal(true);
            }
            else 
            {
                setMedia(route.params.media);
                if (mode === 'edit')
                {
                    setUserRating(media.UserRating)

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
            }
        })();
    }, []);

    const updateFormats = (formats) => 
    {
        setSelectedFormats(formats);
        setChanged(true);
    }

    const saveToDb = async () =>
    {
        if (!changed) return navigation.pop()

        setLoading(true)

        if (barcode) media.Barcode = barcode;

        try
        {
            await addSingleToLibrary(media, userRating, selectedFormats);
        }
        catch (error)
        {
            console.log(error)
        }

        setLoading(false);
        authContext.setShouldRefreshContent(true);

        Toast.show((mode === 'edit' ? 'Updated ' : 'Added ') + media.Title, {
            duration: Toast.durations.LONG,
        });

        navigation.pop()
    }

    const confirmDeletion = async () =>
    {
        Alert.alert(
            'Confirm',
            `Are you sure you want to delete ${media.Title} from your library?`,
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
                            await deleteFromLibrary(media.Type, media.imdbID)
                            authContext.setShouldRefreshContent(true);
                            Toast.show('Deleted ' + media.Title, {
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
        <Screen loading={loading}>
            {error && <Text>{error}</Text>}

            <View style={styles.movieContainer}>
                <Image style={styles.movieImage} source={{ uri: media.Poster }} />
                <Text
                    numberOfLines={2}
                    style={styles.movieTitle}>
                    {media.Title}
                </Text>
                <Text style={styles.movieDetails} numberOfLines={2}>
                    {media.Actors}
                </Text>
                <Text style={styles.movieDetails} numberOfLines={2}>
                    Directed by {media.Director}
                </Text>

                <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={styles.minorDetails}>
                        {media.Rated} | {media.Year} | {media.Runtime}
                    </Text>

                    <View style={styles.movieRatingsContainer}>
                        {media.ScoreRotten && <Mk_RottenScore score={media.ScoreRotten} />}
                        {media.imdbRating &&
                            <Mk_ImdbScore
                                score={media.imdbRating}
                                style={{ marginLeft: media.ScoreRotten ? 8 : 0 }} />}
                    </View>
                </View>


                <Text style={styles.sectionHeader}>Your Rating</Text>

                <Stars
                    value={userRating}
                    isTouchable={true}
                    containerStyle={styles.starContainer}
                    starStyle={styles.stars}
                    onPress={(score) => { setChanged(true); setUserRating(score) }} />

                <Text style={styles.sectionHeader}>Owned Formats</Text>

                <Mk_FormatSelector onFormatsChange={updateFormats} />

                {/* TODO: give option to change movie associated with barcode, create boxset from recognised movie title */}

                {/* {barcode &&
                    <View>
                        <Mk_Button style={styles.wrongMovieBtn}
                            text={'Wrong movie?'}
                            icon={'alert-circle'}
                            onPress={() => saveToDb()} />

                        <Mk_Button style={styles.boxsetBtn}
                            text={'Add as a boxset'}
                            icon={'plus-box-multiple'}
                            onPress={() => saveToDb()} />
                    </View>
                } */}


                <Mk_RoundButton
                    style={styles.cancelButton}
                    icon={mode === 'edit' ? 'delete-forever' : 'close'}
                    onPress={() => mode === 'edit' ? confirmDeletion() : navigation.pop()} />

                <Mk_RoundButton
                    style={styles.saveButton}
                    icon={mode === 'edit' ? 'content-save' : 'plus-thick'}
                    onPress={() => saveToDb()} />
            </View>

            <Mk_ModalSearch
                show={showSetTitleModal}
                headerText={"Hmm."}
                subHeaderText={"We couldn't find a movie or show with that barcode. Please enter the title to help others find it."}
                onResult={(res) =>
                {
                    setShowSetTitleModal(false);
                    setMedia(res);
                }}
                secondaryButtonText={'This is a boxset of multiple movies'}
                secondaryButtonAction={() => navigation.replace("Boxset",
                    {
                        'media': [],
                        'likelyFormat': existingFormats,
                        'barcode': barcode
                    }
                )}
                cancelButtonString={'Cancel'}
                cancelButtonAction={() => navigation.pop()}
            />
        </Screen>
    )
}

const styles = StyleSheet.create({
    boxsetBtn: {

    },
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
        height: '37%',
    },
    movieRatingsContainer: {
        marginTop: 5,
        flexDirection: "row",
        fontSize: 18,
        width: '40%',
        justifyContent: 'center'
    },
    movieTitle: {
        marginTop: 10,
        marginBottom: 8,
        width: '100%',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    movieDetails: {
        textAlign: 'center',
        color: colours.medium
    },
    minorDetails: {
        textAlign: 'center',
        color: colours.medium,
        width: '40%',
        alignSelf: 'center'
    },
    sectionHeader: {
        width: '100%',
        textAlign: 'center',
        marginVertical: 8,
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