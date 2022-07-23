import { StyleSheet, Text, View, Image, Alert, Modal, FlatList, useWindowDimensions } from 'react-native'
import React, { useState, useContext, useLayoutEffect } from 'react'
import Toast from 'react-native-root-toast';

import Screen from "../components/Mk_Screen";
import colours from '../config/colours';
import { addSingleToLibrary, deleteFromLibrary } from '../api/libraryItems';
import Stars from "../components/Mk_Stars";
import Mk_RoundButton from '../components/Mk_RoundButton';
import Mk_RottenScore from '../components/Mk_RottenScore';
import Mk_ImdbScore from '../components/Mk_ImdbScore';
import { AuthContext } from '../hooks/userAuthentication';
import Mk_ModalSearch from '../components/Mk_ModalSearch';
import Mk_FormatSelector from '../components/Mk_FormatSelector';
import Mk_Button from '../components/Mk_Button';
import Checkbox from 'expo-checkbox';

export default function EditItemScreen({ navigation, route })
{
    const defaultModalMessage = "We couldn't find a movie or show with that barcode. Please enter the title to help others find it.";

    const [userRating, setUserRating] = useState(null);
    const [showSetTitleModal, setShowSetTitleModal] = useState(false);
    const [modalMessage, setModalMessage] = useState(defaultModalMessage);
    const [initialFormats, setInitialFormats] = useState([]);
    const [selectedFormats, setSelectedFormats] = useState([]);
    const [showSelectSeasonsModal, setShowSelectSeasonsModal] = useState(false);
    const [ownedSeasons, setOwnedSeasons] = useState([]);
    const [rerenderList, setRerenderList] = useState(true)
    const [loading, setLoading] = useState(false);
    const [changed, setChanged] = useState(true);
    const [media, setMedia] = useState({})
    const [error, setError] = useState(null);
    const authContext = useContext(AuthContext);

    const mode = route.params.mode;
    const barcode = route.params.barcode;
    const existingFormats = route.params.formats;

    const getSeasonsString = () =>
    {
        const numSeasons = ownedSeasons.filter((s) => s.owned).length;

        return `${numSeasons} season${numSeasons != 1 ? 's' : ''} selected`
    }

    const initialiseSeasons = (num) =>
    {
        let seasons = []
        for (let i = 0; i < num; i++)
        {
            seasons.push({ 'num': i + 1, 'owned': true })
        }
        setOwnedSeasons(seasons);
    }

    const changeSeasonOwned = (seasonIndex, owned) =>
    {
        let toChange = ownedSeasons;
        toChange[seasonIndex].owned = owned;
        setOwnedSeasons(toChange);
        setChanged(true);
        setRerenderList(!rerenderList);
    }

    const dimensions = useWindowDimensions();
    const landscape = dimensions.width > dimensions.height;

    useLayoutEffect(() =>
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
                    setUserRating(route.params.media.UserRating)

                    if (existingFormats)
                    {
                        setInitialFormats(existingFormats);
                        setSelectedFormats(existingFormats)
                    }

                    if (route.params.media.OwnedSeasons)
                    {
                        setOwnedSeasons(route.params.media.OwnedSeasons);
                    }

                    setChanged(false);
                }
                else
                {
                    if (route.params.likelyFormat)
                    {
                        setInitialFormats([route.params.likelyFormat]);
                        setSelectedFormats([route.params.likelyFormat])
                    }
                    if (route.params.media.Type === 'series')
                    {
                        initialiseSeasons(parseInt(route.params.media.totalSeasons));
                    }
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

        if (ownedSeasons) media.OwnedSeasons = ownedSeasons;

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

            <View style={landscape ? styles.landscapeContainer : styles.portraitContainer}>
                <Image style={landscape ? styles.movieImageLandscape : styles.movieImagePortrait}
                    source={{ uri: media.Poster }}
                    resizeMode={landscape ? 'contain' : 'cover'} />
                <View style={landscape ? styles.landscapeDetailsContainer : styles.portraitDetailsContainer}>
                    <Text
                        numberOfLines={2}
                        style={styles.movieTitle}>
                        {media.Title}
                    </Text>
                    <Text style={styles.movieDetails} numberOfLines={2}>
                        {media.Actors}
                    </Text>
                    {media.Director !== "N/A" &&
                        <Text style={styles.movieDetails} numberOfLines={2}>
                            Directed by {media.Director}
                        </Text>
                    }
                    <View style={styles.movieDetailsRow}>
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

                    <Mk_FormatSelector
                        initialFormats={initialFormats}
                        onFormatsChange={updateFormats} />

                    {barcode && media.Type === 'movie' &&
                        <View style={styles.barcodeBtnsContainer}>
                            <Mk_Button style={styles.wrongMovieBtn}
                                text={'Wrong movie?'}
                                icon={'magnify'}
                                onPress={() =>
                                {
                                    setModalMessage("We got the wrong movie? Oops! Enter the correct title below and tap search.");
                                    setShowSetTitleModal(true);
                                }} />

                            <Mk_Button style={styles.boxsetBtn}
                                text={'Add as a boxset'}
                                icon={'plus-box-multiple'}
                                onPress={() =>
                                {
                                    navigation.navigate("Boxset",
                                        {
                                            'media': [media],
                                            'likelyFormat': selectedFormats,
                                            'userRatings': {
                                                [media.imdbID]: userRating
                                            },
                                            'barcode': barcode
                                        }
                                    )
                                }
                                }
                            />
                        </View>
                    }

                    {media.Type === 'series' &&
                        <Mk_Button style={styles.seasonsBtn}
                            text={getSeasonsString()}
                            icon={'television-classic'}
                            onPress={() =>
                            {
                                setShowSelectSeasonsModal(true);
                            }} />
                    }


                    <Mk_RoundButton
                        style={styles.cancelButton}
                        icon={mode === 'edit' ? 'delete-forever' : 'close'}
                        onPress={() => mode === 'edit' ? confirmDeletion() : navigation.pop()} />

                    <Mk_RoundButton
                        style={styles.saveButton}
                        icon={'content-save'}
                        onPress={() => saveToDb()} />
                </View>

            </View>

            <Mk_ModalSearch
                show={showSetTitleModal}
                headerText={"Hmm."}
                subHeaderText={modalMessage}
                onResult={(res) =>
                {
                    setShowSetTitleModal(false);
                    setMedia(res);
                    setModalMessage(defaultModalMessage);
                    if (res.Type === 'series')
                    {
                        initialiseSeasons(parseInt(res.totalSeasons));
                    }
                }}
                secondaryButtonText={'This is a boxset of multiple movies'}
                secondaryButtonAction={() => navigation.replace("Boxset",
                    {
                        'media': [],
                        'likelyFormat': selectedFormats,
                        'barcode': barcode
                    }
                )}
                cancelButtonString={'Cancel'}
                cancelButtonAction={() =>
                {
                    setShowSetTitleModal(false);
                    if (Object.keys(media).length === 0)
                    {
                        navigation.pop();
                    }
                }}
            />

            <Modal
                visible={showSelectSeasonsModal}
                animationType={'slide'}>
                <View style={styles.seasonsModal}>
                    <Text style={styles.seasonsModalTitle}>Select the seasons you own:</Text>
                    <FlatList
                        style={styles.seasonsModalList}
                        data={ownedSeasons}
                        keyExtractor={(season) => season.num}
                        extraData={rerenderList}
                        contentContainerStyle={{ alignItems: 'center' }}
                        renderItem={({ item }) => (

                            <View style={styles.seasonsModalRow}>
                                <Text style={styles.seasonsModalNum}>{item.num}</Text>
                                <Checkbox
                                    style={styles.seasonsModalCheckbox}
                                    value={item.owned}
                                    color={colours.secondary}
                                    onValueChange={(val) => changeSeasonOwned(item.num - 1, val)} />
                            </View>
                        )}
                    />
                    <Mk_Button
                        style={styles.seasonsModalClose}
                        text={"Close"}
                        onPress={() => setShowSelectSeasonsModal(false)} />
                </View>
            </Modal>
        </Screen>
    )
}

const styles = StyleSheet.create({
    barcodeBtnsContainer: {
        position: 'absolute',
        bottom: 10,
        width: '100%',
        alignItems: 'center'
    },
    boxsetBtn: {
        marginTop: 10,
        backgroundColor: colours.secondary
    },
    cancelButton: {
        position: 'absolute',
        bottom: '3%',
        left: '3%',
        width: 50,
        height: 50,
        backgroundColor: colours.primary,
        iconSize: 30
    },
    saveButton: {
        position: 'absolute',
        bottom: '3%',
        right: '3%',
        width: 50,
        height: 50,
        backgroundColor: colours.save,
        iconSize: 30
    },
    seasonsModal: {
        width: '100%',
        height: '100%',
        padding: 20,
        alignContent: 'center',
        justifyContent: 'center'
    },
    seasonsModalTitle: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold'
    },
    seasonsModalClose: {
        marginTop: 15,
    },
    seasonsModalList: {
        flex: 1,
        marginTop: 10,
        borderColor: colours.light_grey,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingTop: 10
    },
    seasonsModalRow: {
        flexDirection: "row",
        width: '100%',
        maxWidth: 400,
        marginVertical: 3,
        backgroundColor: colours.very_light_grey,
        padding: 5
    },
    seasonsModalNum: {
        flex: 1
    },
    landscapeDetailsContainer: {
        flex: 1,
        padding: '3%',
        marginHorizontal: '5%'
    },
    loadingIndicator: {
        height: '100%',
        alignSelf: 'center',
        color: colours.primary
    },
    portraitContainer: {
        width: '100%',
        height: '100%',
    },
    portraitDetailsContainer: {
        flex: 1,
        marginHorizontal: '5%'
    },
    movieImagePortrait: {
        width: '100%',
        height: '37%',
    },
    movieImageLandscape: {
        height: '100%',
        width: '50%',
        backgroundColor: colours.dark
    },
    movieRatingsContainer: {
        flexDirection: "row",
        fontSize: 18,
        width: '40%',
        justifyContent: 'center',
        marginVertical: '1%'
    },
    movieTitle: {
        marginTop: '1%',
        marginBottom: '1%',
        width: '100%',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    movieDetails: {
        textAlign: 'center',
        color: colours.medium
    },
    movieDetailsRow: {
        marginTop: '1%',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    minorDetails: {
        textAlign: 'center',
        color: colours.medium,
        width: '40%',
        alignSelf: 'center'
    },
    landscapeContainer: {
        flexDirection: 'row',
        height: '100%'
    },
    seasonsBtn: {
        backgroundColor: colours.secondary,
        position: 'absolute',
        bottom: 25
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
        width: 27,
        height: 27,
        marginHorizontal: 1
    }
})