import { StyleSheet, FlatList, Text, RefreshControl, View, TouchableOpacity, Modal, Button } from 'react-native'
import React, { useState, useContext, useLayoutEffect, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Screen from "../components/Mk_Screen";
import Card from "../components/Mk_Card";
import colours from "../config/colours";
import { getMovieLibrary } from '../api/libraryItems';
import { AuthContext } from '../hooks/userAuthentication';
import Mk_Button from '../components/Mk_Button';
import { setString, getString } from '../config/storage';

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
    const [filterField, setFilterField] = useState(null);
    const [filterValue, setFilterValue] = useState(null);
    const [filterOptions, setFilterOptions] = useState(null);
    const [rerenderList, setRerenderList] = useState(true)
    const [showSortFilterModal, setShowSortFilterModal] = useState(false);
    const authContext = useContext(AuthContext);

    useEffect(() =>
    {
        async function loadConf()
        {
            const previousSortBy = await getString('sortBy');
            const previousSortAsc = await getString('sortAsc');

            if (previousSortBy)
            {
                setSortBy(previousSortBy);
                setSortAsc(JSON.parse(previousSortAsc));
            }
        }
        loadConf();
    }, [])

    useLayoutEffect(() =>
    {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity onPress={() => setShowSortFilterModal(true)}>
                        <MaterialCommunityIcons
                            style={{ color: colours.primary }}
                            name={'sort'}
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
    }, [sortAsc]);

    useLayoutEffect(() =>
    {
        // Get genres and age ratings for picker
        let genreSet = new Set();
        libraryData.forEach(movie =>
        {
            const genres = movie.Genre.split(", ");
            genres.forEach((genre => genreSet.add(genre)));
        });


        setFilterOptions({
            'None': null,
            'Formats': ['DVD', 'Blu-ray', '4K'],
            'Rated': ['G', 'PG', 'PG-13', 'R', 'NC-17'],
            'Genre': Array.from(genreSet).sort()
        })

    }, [libraryData])


    useEffect(() =>
    {
        setString('sortBy', sortBy);
        setString('sortAsc', JSON.stringify(sortAsc));

        const filtered = !filterField || filterField === 'None' ?
            libraryData :
            libraryData.filter(movie =>
            {

                if (filterField === 'Rated')
                {
                    // If using '.includes()', age ratings match each other 
                    // (e.g. PG-13 includes PG which includes G)
                    return movie[filterField] === filterValue;
                }
                return movie[filterField].includes(filterValue);
            })

        const sortByPos = sortFields.map(function (x) { return x.Field; }).indexOf(sortBy);
        navigation.setOptions({
            title:
                ((filterField && filterField !== 'None') ?
                    filterValue + ", " : "")
                + 'Sorted by ' + sortFields[sortByPos].Label
        });

        const sorted = filtered.sort((lhs, rhs) =>
        {
            const first = sortAsc ? lhs : rhs;
            const second = sortAsc ? rhs : lhs;
            switch (sortBy)
            {
                case 'UserRating':
                case 'Added':
                    // ints stored as numbers
                    return first[sortBy] - second[sortBy];
                case 'imdbRating':
                    // floats stored as strings
                    return parseFloat(first[sortBy]) - parseFloat(second[sortBy]);
                case 'Runtime':
                case 'ScoreRotten':
                case 'Year':
                    // strings parsable as ints
                    return parseInt(first[sortBy]) - parseInt(second[sortBy]);
                default:
                    // titles without articles (a, the, an)
                    return removeArticles(first['Title'].toLowerCase())
                        .localeCompare(removeArticles(second['Title'].toLowerCase()));
            }
        });

        setSortedData(sorted);
        setRerenderList(!rerenderList);
    }, [sortBy, sortAsc, filterField, filterValue, libraryData])

    useFocusEffect(
        () => { if (authContext.shouldRefreshContent) fetchLibraryData(); }
    ), [];

    // https://stackoverflow.com/a/34347138/1377099
    function removeArticles(str)
    {
        const words = str.split(" ");
        if (words.length <= 1) return str;
        if (words[0] == 'a' || words[0] == 'the' || words[0] == 'an')
        {
            return words.splice(1).join(" ");
        }
        return str;
    }

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

            <Modal
                visible={showSortFilterModal}
                animationType={'slide'}>
                <View style={styles.filtersModal}>
                    <Text style={styles.filtersTitle}>Filters and Sorting</Text>

                    <Text style={styles.filtersSectionTitle}>Sort items by</Text>
                    <Picker
                        style={styles.filtersPicker}
                        selectedValue={sortBy}
                        onValueChange={(itemValue, itemIndex) =>
                        {
                            setSortBy(itemValue);
                        }}>
                        {
                            sortFields.map((mpObj) =>
                                <Picker.Item
                                    label={mpObj.Label}
                                    value={mpObj.Field}
                                    key={mpObj.Field} />
                            )
                        }
                    </Picker>

                    {filterOptions &&
                        <>
                            <Text style={styles.filtersSectionTitle}>Filter items by</Text>
                            <Picker
                                style={styles.filtersPicker}
                                selectedValue={filterField}
                                onValueChange={(itemValue, itemIndex) =>
                                {
                                    setFilterField(itemValue);
                                }}>
                                {
                                    Object.keys(filterOptions).map((key) =>
                                        <Picker.Item
                                            label={key}
                                            value={key}
                                            key={key} />
                                    )
                                }
                            </Picker>
                        </>

                    }


                    {filterField && filterField != 'None' &&

                        <Picker
                            style={styles.filtersPicker}
                            selectedValue={filterValue}
                            onValueChange={(itemValue, itemIndex) =>
                            {
                                setFilterValue(itemValue);
                            }}>
                            {
                                filterOptions[filterField].map((key) =>
                                    <Picker.Item
                                        label={key}
                                        value={key}
                                        key={key} />
                                )
                            }
                        </Picker>

                    }
                    <Mk_Button
                        style={styles.filtersClose}
                        text={'Close'}
                        onPress={() => setShowSortFilterModal(false)} />
                </View>
            </Modal>

        </Screen>
    )
}

const styles = StyleSheet.create({
    filtersModal: {
        width: '100%',
        height: '100%',
        padding: 20
    },
    filtersPicker: {
        marginTop: 5,
        backgroundColor: colours.light
    },
    filtersTitle: {
        marginVertical: 10,
        width: '100%',
        textAlign: 'center',
        fontSize: 20
    },
    filtersSectionTitle: {
        width: '100%',
        marginTop: 20,
        textAlign: 'center'
    },
    filtersClose: {
        position: 'absolute',
        bottom: 25
    },
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