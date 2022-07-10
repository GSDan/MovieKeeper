import { StyleSheet, FlatList, Text, RefreshControl, View, TouchableOpacity, Modal, Button } from 'react-native'
import React, { useState, useContext, useLayoutEffect, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Screen from "../components/Mk_Screen";
import Card from "../components/Mk_Card";
import colours from "../config/colours";
import { getMovieLibrary } from '../api/libraryItems';
import { AuthContext } from '../hooks/userAuthentication';

const sortFields = [
    {
        'Label': 'Title',
        'Field': 'Title'
    },
    {
        'Label': 'Date Added',
        'Field': 'Added'
    },
    {
        'Label': 'Your Rating',
        'Field': 'UserRating'
    },
    {
        'Label': 'IMDB Score',
        'Field': 'imdbRating'
    },
    {
        'Label': 'Rotten %',
        'Field': 'ScoreRotten'
    },
    {
        'Label': 'Release Year',
        'Field': 'Year'
    },
    {
        'Label': 'Runtime',
        'Field': 'Runtime'
    },
];

export default function LibraryScreen({ navigation })
{
    const [refreshing, setRefreshing] = useState(false);
    const [libraryData, setLibraryData] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [sortBy, setSortBy] = useState('Title');
    const [sortAsc, setSortAsc] = useState(true);
    const [rerenderList, setRerenderList] = useState(true)
    const [showSortFilterModal, setShowSortFilterModal] = useState(false);
    const authContext = useContext(AuthContext);

    useLayoutEffect(() =>
    {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity onPress={() => setShowSortFilterModal(true)}>
                        <MaterialCommunityIcons
                            style={{ color: colours.primary }}
                            name={'filter'}
                            size={30} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSortAsc(!sortAsc)}>
                        <MaterialCommunityIcons
                            style={{ color: colours.secondary, marginLeft: 15 }}
                            name={sortAsc ? 'arrow-down' : 'arrow-up'}
                            size={30} />
                    </TouchableOpacity>
                </View>
            ),

        });
    }, [navigation, sortAsc]);

    useEffect(() =>
    {
        const sorted = libraryData.sort((lhs, rhs) =>
        {
            if (sortAsc) return lhs[sortBy].localeCompare(rhs[sortBy])
            return rhs[sortBy].localeCompare(lhs[sortBy]);
        });

        setSortedData(sorted);
        setRerenderList(!rerenderList);
    }, [sortBy, sortAsc, libraryData])

    useFocusEffect(
        () => { if (authContext.shouldRefreshContent) fetchLibraryData(); }
    ), [];

    const fetchLibraryData = async () =>
    {
        try
        {
            if (refreshing) return;

            setRefreshing(true);
            const result = await getMovieLibrary();
            setLibraryData(result.data);
            authContext.setShouldRefreshContent(false);
            setRefreshing(false);
        }
        catch (error)
        {
            setRefreshing(false);
            console.log(error);
        }
    }

    const openForEditing = (movieData) =>
    {
        navigation.navigate("Edit", { 'movie': movieData, 'mode': 'edit', 'formats': movieData.Formats })
    }

    return (
        <Screen style={styles.screen}>
            <FlatList
                style={styles.list}
                data={sortedData}
                extraData={rerenderList}
                keyExtractor={(listing) => listing.imdbID}
                renderItem={({ item }) => (
                    <Card
                        movie={item}
                        onPress={() => openForEditing(item)} />
                )}
                ListHeaderComponent={<View />}
                ListHeaderComponentStyle={{ height: 20 }}
                ListFooterComponentStyle={styles.listFooter}
                ListFooterComponent={<Text style={styles.legal} numberOfLines={2}>
                    The Fresh Tomato® and Rotten Splat® logos are registered trademarks of Fandango Media LLC.
                </Text>}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchLibraryData} />
                }
            />

            <Modal visible={showSortFilterModal} animationType={'slide'}>
                <Button title='Boop' onPress={() => setShowSortFilterModal(false)} />
            </Modal>

        </Screen>
    )
}

const styles = StyleSheet.create({
    screen: {
        paddingTop: 0,
        backgroundColor: colours.light,
    },
    listFooter: {
        marginBottom: 7
    },
    legal: {
        textAlign: 'center',
        color: colours.medium,
        fontSize: 8
    },
    navButton: {
        marginHorizontal: 3
    }
})