import { StyleSheet, View, Modal, Text, FlatList, ActivityIndicator } from 'react-native'
import { useEffect, useState } from 'react';

import colours from '../config/colours';
import Mk_Button from './Mk_Button';
import Mk_CardWithAction from './Mk_CardWithAction';
import { useSearchTitle } from '../hooks/searchTitle';
import Mk_TextSearch from './Mk_TextSearch';

const Mk_ModalSearchResults = ({
    show,
    initialData,
    itemButtonAction,
    cancelButtonAction,
    headerText,
    subHeaderText,
    showSearchBtn = false,
    style }) =>
{
    const [searchTitle, resetResults, { imdbLoading, imdbError, imdbResults }] = useSearchTitle();
    const [titleInput, setTitleInput] = useState();
    const [data, setData] = useState(initialData)
    const [error, setError] = useState(null);

    if (imdbResults.length === 0 && data !== initialData)
    {
        setData(initialData);
    }

    useEffect(() => 
    {
        if (imdbResults?.length > 0)
        {
            setData(imdbResults)
        }
    }, [imdbResults])

    return (
        <Modal
            visible={show}
            animationType={'slide'}
            style={style}>
            <View style={styles.modal}>
                <Text style={styles.modalTitle}>{headerText}</Text>
                <Text style={styles.modalSubheader}>{subHeaderText}</Text>
                <FlatList
                    style={styles.modalList}
                    data={data}
                    keyExtractor={(listing) => listing.imdbID}
                    renderItem={({ item }) => (
                        <Mk_CardWithAction
                            movie={item}
                            action={{
                                'icon': 'check-circle-outline',
                                'onPress': () =>
                                {
                                    itemButtonAction(item);
                                },
                                'colour': colours.secondary_light
                            }}
                        />
                    )}
                    contentContainerStyle={{ flexGrow: 1 }}
                />

                {showSearchBtn &&
                    <View style={styles.searchContainer}>
                        {imdbLoading &&
                            <ActivityIndicator animating={true} style={styles.loadingIndicator} size="large" />
                        }
                        {!imdbLoading &&
                            <Mk_TextSearch
                                onChangeText={(text) => setTitleInput(text)}
                                onPress={() =>
                                {
                                    titleInput ? searchTitle(titleInput) : setError('Please enter a movie title');
                                    setTitleInput(null);
                                }}
                                placeholder={"Search for others..."} />
                        }
                        {error || imdbError && <Text style={styles.error}>{error ?? imdbError}</Text>}
                    </View>
                }

                <Mk_Button
                    style={styles.modalClose}
                    text={"Cancel"}
                    onPress={cancelButtonAction} />
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    listFooter: {
        height: 100
    },
    modal: {
        width: '100%',
        height: '100%',
        alignContent: 'center',
        justifyContent: 'center'
    },
    modalTitle: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 15,
    },
    modalSubheader: {
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSearch: {
        backgroundColor: colours.secondary
    },
    modalClose: {
        marginBottom: 15,
        marginTop: 10
    },
    modalList: {
        flex: 1,
        marginTop: 10,
        borderColor: colours.light_grey,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingTop: 10,
        backgroundColor: colours.light
    },
    searchContainer: {
        marginTop: 15
    }
});

export default Mk_ModalSearchResults