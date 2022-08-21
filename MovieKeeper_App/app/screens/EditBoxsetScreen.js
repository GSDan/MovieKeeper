import { StyleSheet, Text, FlatList } from 'react-native'
import React, { useState, useLayoutEffect, useEffect } from 'react'
import Toast from 'react-native-root-toast';

import Screen from "../components/Mk_Screen";
import Mk_Button from '../components/Mk_Button';
import Mk_ModalSearch from '../components/Mk_ModalSearch';
import Mk_CardWithAction from '../components/Mk_CardWithAction';
import colours from '../config/colours';
import Mk_FormatSelector from '../components/Mk_FormatSelector';
import { addBoxetToLibrary, getFromId } from '../api/libraryItems';
import Mk_ModalSearchResults from '../components/Mk_ModalSearchResults';

export default function EditBoxsetScreen({ navigation, route })
{
    const barcode = route.params.barcode;
    const mode = route.params.mode;

    const [media, setMedia] = useState([]);
    const [userRatings, setUserRatings] = useState({});
    const [initialFormats, setInitialFormats] = useState([]);
    const [selectedFormats, setSelectedFormats] = useState([]);
    const [formatsChanged, setFormatsChanged] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rerenderList, setRerenderList] = useState(true)
    const [changed, setChanged] = useState(mode !== 'edit');
    const [saveAndClose, setSaveAndClose] = useState(false);

    useLayoutEffect(() =>
    {
        if (route.params.media)
        {
            setMedia(route.params.media.sort((lhs, rhs) =>
            {
                return parseInt(lhs.Year) - parseInt(rhs.Year);;
            }));
        }
        if (route.params.likelyFormat)
        {
            setInitialFormats([route.params.likelyFormat]);
            setSelectedFormats([route.params.likelyFormat]);
        }
        if (route.params.userRatings)
        {
            setUserRatings(route.params.userRatings);
        }
        setRerenderList(!rerenderList);
    }, []);

    const addMedia = async (newMedia) =>
    {
        try
        {
            setLoading(true);
            let omdbRes = await getFromId(newMedia.imdbID);
            setLoading(false);
            const currentMedia = media;
            currentMedia.push(omdbRes.data.data);
            setMedia(currentMedia);
            updateRating(newMedia.imdbID, 0);
        }
        catch (error)
        {
            console.log(error)
        }
    }

    const removeMedia = (toRemove) =>
    {
        setMedia(media.filter(item => item.imdbID !== toRemove.imdbID));
        setChanged(true);
    }

    const updateRating = (id, rating) => 
    {
        let ratingsDict = userRatings;
        ratingsDict[id] = rating;
        setUserRatings(ratingsDict);
        setChanged(true);
        setRerenderList(!rerenderList);
    }

    // check if formats have changed
    useEffect(() =>
    {
        let formatsChanged = initialFormats.length !== selectedFormats.length;
        if (!formatsChanged)
        {
            // this assumes they're in the same order, which they should be
            for (let i = 0; i < selectedFormats.length; i++)
            {
                if (selectedFormats[i] !== initialFormats[i])
                {
                    formatsChanged = true;
                    break;
                }
            }
        }
        setFormatsChanged(formatsChanged);
    }, [selectedFormats])

    // save and close
    useEffect(() => 
    {
        let isMounted = true;

        (async () =>
        {
            if (!saveAndClose || !isMounted) return;
            if (!changed && !formatsChanged) return navigation.popToTop();

            setLoading(true)

            let movies = media;

            movies.forEach(mov =>
            {
                if (userRatings[mov.imdbID])
                {
                    mov.UserRating = userRatings[mov.imdbID];
                }
            });

            addBoxetToLibrary(barcode, movies, selectedFormats);

            Toast.show('Saving boxset...', {
                duration: Toast.durations.SHORT,
            });

            navigation.popToTop();
        })();

        return () => { isMounted = false; }
    }, [saveAndClose])

    return (
        <Screen style={styles.boxsetContainer} loading={loading}>

            <Text style={styles.header}>Add Movie Boxset</Text>

            <Text style={styles.formatSubheader}>This boxset's format(s):</Text>
            <Mk_FormatSelector
                initialFormats={initialFormats}
                onFormatsChange={(formats) =>
                {
                    setSelectedFormats(formats);
                }} />

            <FlatList
                style={styles.list}
                data={media}
                extraData={rerenderList}
                keyExtractor={(listing) => listing.imdbID}
                renderItem={({ item }) => (

                    <Mk_CardWithAction
                        movie={item}
                        rating={userRatings[item.imdbID] ?? 0}
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
                onPress={() => setSaveAndClose(true)} />

            <Mk_ModalSearch
                show={showSearchModal}
                headerText={"Search for a movie"}
                subHeaderText={"Enter the title of the movie or show"}
                onResult={(res) =>
                {
                    setShowSearchModal(false);
                    setSearchResults(res);
                }}
                cancelButtonString={'Cancel'}
                cancelButtonAction={() => setShowSearchModal(false)}
            />

            <Mk_ModalSearchResults
                show={searchResults.length > 0}
                initialData={searchResults}
                headerText={"Here's what we found"}
                subHeaderText={"Select the correct movie or show:"}
                cancelButtonAction={() => setSearchResults([])}
                itemButtonAction={(item) =>
                {
                    setSearchResults([]);
                    addMedia(item);
                }} />
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
        marginVertical: 10,
        backgroundColor: colours.primary_light
    }
})