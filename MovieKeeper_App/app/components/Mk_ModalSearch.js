import { StyleSheet, ActivityIndicator, View, Modal, Text } from 'react-native'
import React, { useState } from 'react'

import { getFromTitle } from '../api/libraryItems';
import colours from '../config/colours';
import Mk_TextSearch from './Mk_TextSearch';
import Mk_Button from './Mk_Button';

const Mk_ModalSearch = ({
    onResult,
    show,
    secondaryButtonText,
    secondaryButtonAction,
    cancelButtonString,
    cancelButtonAction,
    headerText,
    subHeaderText,
    style }) =>
{
    const [searchError, setSearchError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");

    const searchOmdb = async (title) =>
    {
        if (!title) return setSearchError('Please enter a movie title');

        setLoading(true);
        const resp = await getFromTitle(title);

        if (!resp || !resp.data || !resp.data.success)
        {
            setLoading(false);
            return setSearchError(resp && resp.data ? "Couldn't find a movie with that title" : "Something went wrong")
        }

        setSearchError(null);
        let data = resp.data.data;

        if (data.Ratings)
        {
            const rotten = data.Ratings.find(r => r.Source === 'Rotten Tomatoes');
            if (rotten) data.ScoreRotten = rotten.Value;
        }

        setLoading(false);
        onResult(data);
    }


    return (
        <Modal
            visible={show}
            animationType={'slide'}
            style={style}>

            {loading &&
                <ActivityIndicator animating={loading} style={styles.loadingIndicator} size="large" />
            }

            {!loading &&
                <View style={styles.titleModal}>
                    <Text style={styles.titleModalheader}>{headerText}</Text>
                    <Text style={styles.titleModalText}>{subHeaderText}</Text>

                    {searchError &&
                        <Text style={styles.error}>
                            {searchError}
                        </Text>
                    }

                    <Mk_TextSearch
                        onChangeText={(text) => setSearchText(text)}
                        onPress={() => searchOmdb(searchText)}
                        placeholder={"Enter a movie or show's title..."} />

                    {secondaryButtonAction &&
                        <Mk_Button
                            style={styles.titleModalBoxset}
                            text={secondaryButtonText}
                            onPress={secondaryButtonAction} />
                    }

                    {cancelButtonAction &&
                        <Mk_Button
                            style={styles.titleModalClose}
                            text={cancelButtonString}
                            onPress={cancelButtonAction} />
                    }
                </View>
            }

        </Modal>
    )
}

const styles = StyleSheet.create({
    error: {
        width: '100%',
        textAlign: 'center',
        paddingHorizontal: 10,
        marginBottom: 10,
        color: 'red'
    },
    loadingIndicator: {
        height: '100%',
        alignSelf: 'center',
        color: colours.primary
    },
    titleModal: {
        width: '100%',
        height: '100%',
        padding: 20,
        alignContent: 'center',
        justifyContent: 'center'
    },
    titleModalheader: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
        marginVertical: 10
    },
    titleModalText: {
        textAlign: 'center',
        marginBottom: 15
    },
    titleModalBoxset: {
        position: 'absolute',
        backgroundColor: colours.secondary,
        bottom: 90
    },
    titleModalClose: {
        position: 'absolute',
        bottom: 25
    },
});

export default Mk_ModalSearch