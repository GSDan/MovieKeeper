import { StyleSheet, Text, FlatList } from 'react-native'
import React, { useState, useContext } from 'react'
import Toast from 'react-native-root-toast';

import Screen from "../components/Mk_Screen";
import Mk_Button from '../components/Mk_Button';
import Mk_ModalSearch from '../components/Mk_ModalSearch';
import Mk_CardWithAction from '../components/Mk_CardWithAction';
import colours from '../config/colours';
import Mk_FormatSelector from '../components/Mk_FormatSelector';
import { AuthContext } from '../hooks/userAuthentication';
import { addBoxetToLibrary } from '../api/libraryItems';

export default function EditBoxsetScreen({ navigation, route })
{
    const [media, setMedia] = useState([])
    const [userRatings, setUserRatings] = useState([])
    const [selectedFormats, setSelectedFormats] = useState([]);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rerenderList, setRerenderList] = useState(true)
    const authContext = useContext(AuthContext);

    const barcode = route.params.barcode;

    const addMedia = (newMedia) =>
    {
        const currentMedia = media;
        currentMedia.push(newMedia);
        setMedia(currentMedia);
        setRerenderList(!rerenderList);
    }

    const removeMedia = (toRemove) =>
    {
        setMedia(media.filter(item => item.imdbID !== toRemove.imdbID))
    }

    const updateRating = (id, rating) => 
    {
        let ratingsDict = userRatings;
        ratingsDict[id] = rating;
        setUserRatings(ratingsDict);
        setRerenderList(!rerenderList);
    }

    const saveToDb = async () =>
    {
        setLoading(true)

        let movies = media;

        movies.forEach(mov =>
        {
            if (userRatings[mov.imdbID])
            {
                mov.UserRating = userRatings[mov.imdbID];
            }
        });

        try
        {
            await addBoxetToLibrary(barcode, movies, selectedFormats);
        }
        catch (error)
        {
            setLoading(false);
            console.log(error)
            return;
        }

        setLoading(false);
        authContext.setShouldRefreshContent(true);

        Toast.show('Added boxset', {
            duration: Toast.durations.LONG,
        });

        navigation.pop()
    }

    return (
        <Screen style={styles.boxsetContainer} loading={loading}>

            <Text style={styles.header}>Create Movie Boxset</Text>

            <Text style={styles.formatSubheader}>This boxset's format(s):</Text>
            <Mk_FormatSelector
                onFormatsChange={setSelectedFormats} />

            <FlatList
                style={styles.list}
                data={media}
                extraData={rerenderList}
                keyExtractor={(listing) => listing.imdbID}
                renderItem={({ item }) => (

                    <Mk_CardWithAction
                        movie={item}
                        rating={userRatings[item.imdbID]}
                        onRating={updateRating}
                        action={{
                            'icon': 'delete-forever',
                            'onPress': () => removeMedia(item),
                            'colour': colours.primary
                        }}
                    />
                )}
                contentContainerStyle={{ flexGrow: 1 }}
                ListEmptyComponent={<Text style={styles.listEmpty}>Add a movie to the boxset to get started.</Text>}
                ListFooterComponentStyle={styles.listFooter}
                ListFooterComponent={<Mk_Button
                    style={styles.addMovie}
                    icon={'plus'}
                    text={media.length > 0 ? 'Add Another Movie' : 'Add Movie'}
                    onPress={() => setShowSearchModal(true)} />}
            />

            <Mk_Button style={media.length < 2 ? styles.finishBtnLocked : styles.finishBtn}
                text={media.length < 2 ? 'Add at least 2 movies' : 'Finish'}
                icon={media.length < 2 ? 'upload-lock' : 'upload'}
                disabled={media.length < 2}
                onPress={() => saveToDb()} />

            <Mk_ModalSearch
                show={showSearchModal}
                headerText={"Search for a movie"}
                subHeaderText={"Please enter the movie's title as accurately as possible."}
                onResult={(res) =>
                {
                    setShowSearchModal(false);
                    addMedia(res);
                }}
                cancelButtonString={'Cancel'}
                cancelButtonAction={() => setShowSearchModal(false)}
            />
        </Screen>
    )
}

const styles = StyleSheet.create({
    boxsetContainer: {
    },
    header: {
        textAlign: 'center',
        marginVertical: 20,
        fontSize: 20
    },
    listEmpty: {
        textAlign: 'center',
        marginVertical: 20
    },
    addMovie: {
        marginTop: 10,
        backgroundColor: colours.secondary
    },
    formatSubheader: {
        textAlign: 'center',
        marginBottom: 5
    },
    list: {
        marginTop: 10,
        paddingTop: 10,
        paddingBottom: 50,
        backgroundColor: colours.light
    },
    listFooter: {
        height: 100
    },
    finishBtn: {
        marginVertical: 10
    },
    finishBtnLocked: {
        marginTop: 10,
        backgroundColor: colours.primary_light
    }
})