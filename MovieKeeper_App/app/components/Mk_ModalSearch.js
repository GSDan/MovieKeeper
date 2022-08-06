import { StyleSheet, ActivityIndicator, View, Modal, Text } from 'react-native'
import React, { useEffect, useState } from 'react'

import colours from '../config/colours';
import Mk_TextSearch from './Mk_TextSearch';
import Mk_Button from './Mk_Button';
import { useSearchTitle } from '../hooks/searchTitle';

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
    const [searchTitle, resetResults, { imdbLoading, imdbError, imdbResults }] = useSearchTitle();

    useEffect(() =>
    {
        if (imdbResults && imdbResults.length > 0)
        {
            onResult(imdbResults);
        }
    }, [imdbResults])

    return (
        <Modal
            visible={show}
            animationType={'slide'}
            style={style}>

            {loading || imdbLoading &&
                <ActivityIndicator animating={true} style={styles.loadingIndicator} size="large" />
            }

            {!loading &&
                <View style={styles.titleModal}>
                    <Text style={styles.titleModalheader}>{headerText}</Text>
                    <Text style={styles.titleModalText}>{subHeaderText}</Text>

                    {searchError || imdbError &&
                        <Text style={styles.error}>
                            {searchError ?? imdbError}
                        </Text>
                    }

                    <Mk_TextSearch
                        onChangeText={(text) => setSearchText(text)}
                        onPress={() => searchText ? searchTitle(searchText) : setSearchError('Please enter a movie title')}
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