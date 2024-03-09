import {
	StyleSheet,
	FlatList,
	Text,
	RefreshControl,
	View,
	TouchableOpacity,
	Modal,
	useWindowDimensions,
	TextInput,
} from 'react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FAB } from '@rneui/themed';

import Screen from '../components/Mk_Screen';
import Card from '../components/Mk_Card';
import colours from '../config/colours';
import { getLibrary, setLoadLibraryCallback } from '../api/libraryItems';
import Mk_Button from '../components/Mk_Button';
import Mk_RoundButton from '../components/Mk_RoundButton';
import Mk_TextSearch from '../components/Mk_TextSearch';
import { setString, setData, getString, removeItem } from '../config/storage';

const sortFields = [
	{
		Label: 'Title',
		Field: 'Title',
	},
	{
		Label: 'Date Added',
		Field: 'Added',
	},
	{
		Label: 'Your Rating',
		Field: 'UserRating',
	},
	{
		Label: 'IMDB Score',
		Field: 'imdbRating',
	},
	{
		Label: 'Rotten %',
		Field: 'ScoreRotten',
	},
	{
		Label: 'Release Year',
		Field: 'Year',
	},
	{
		Label: 'Runtime',
		Field: 'Runtime',
	},
];

export default function LibraryScreen({ navigation }) {
	const [refreshing, setRefreshing] = useState(false);
	const [libraryData, setLibraryData] = useState([]);
	const [firstScan, setFirstScan] = useState(true);
	const [sortedData, setSortedData] = useState([]);
	const [mediaType, setMediaType] = useState('movie');
	const [sortBy, setSortBy] = useState('Title');
	const [sortAsc, setSortAsc] = useState(false);
	const [filterField, setFilterField] = useState(null);
	const [filterValue, setFilterValue] = useState(null);
	const [filterOptions, setFilterOptions] = useState(null);
	const [showSearchModal, setShowSearchModal] = useState(false);
	const [searchTerm, setSearchTerm] = useState(null);
	const [rerenderList, setRerenderList] = useState(true);
	const [showSortFilterModal, setShowSortFilterModal] = useState(false);

	useEffect(() => {
		setLoadLibraryCallback((val) => {
			if (val) fetch();
		});

		return () => {
			setLoadLibraryCallback(null);
		};
	}, []);

	useEffect(() => {
		if (!refreshing) {
			fetch();
		}
	}, [fetch]);

	useEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<View style={{ flexDirection: 'row' }}>
					<TouchableOpacity
						onPress={() => {
							setShowSearchModal((current) => !current);
						}}>
						<MaterialCommunityIcons
							style={{ color: colours.primary }}
							name={'movie-search'}
							size={30}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => setShowSortFilterModal(true)}>
						<MaterialCommunityIcons
							style={{ color: colours.primary, marginLeft: 12 }}
							name={'sort'}
							size={30}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => setSortAsc(!sortAsc)}>
						<MaterialCommunityIcons
							style={{ color: colours.secondary, marginLeft: 12 }}
							name={sortAsc ? 'arrow-down' : 'arrow-up'}
							size={30}
						/>
					</TouchableOpacity>
				</View>
			),
		});
	}, [navigation, sortAsc]);

	useEffect(() => {
		// Get genres and age ratings for picker
		let genreSet = new Set();
		libraryData.forEach((movie) => {
			const genres = movie.Genre.split(', ');
			genres.forEach((genre) => genreSet.add(genre));
		});

		setFilterOptions({
			None: null,
			Formats: ['DVD', 'Blu-ray', '4K'],
			Rated: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
			Genre: Array.from(genreSet).sort(),
		});
	}, [sortedData]);

	useEffect(() => {
		setString('sortBy', sortBy);
		setString('sortAsc', JSON.stringify(sortAsc));

		const filtered = libraryData.filter((item) => {
			if (item['Type'] !== mediaType) return false;

			if (
				searchTerm != null &&
				searchTerm.trim() !== '' &&
				!item.Title.toLowerCase().includes(searchTerm.toLowerCase()) &&
				!item.Director.toLowerCase().includes(searchTerm.toLowerCase()) &&
				!item.Actors.toLowerCase().includes(searchTerm.toLowerCase())
			) {
				return false;
			}

			if (!filterField || filterField === 'None') return true;

			if (filterField === 'Rated') {
				// If using '.includes()', age ratings match each other
				// (e.g. PG-13 includes PG which includes G)
				return item[filterField] === filterValue;
			}
			return item[filterField].includes(filterValue);
		});

		const sortByPos = sortFields
			.map(function (x) {
				return x.Field;
			})
			.indexOf(sortBy);

		navigation.setOptions({
			title:
				(searchTerm && searchTerm.trim() != ''
					? `"${searchTerm}", `
					: filterField && filterField !== 'None'
					? filterValue + ', '
					: '') +
				'Sorted by ' +
				sortFields[sortByPos].Label,
		});

		const sorted = filtered.sort((lhs, rhs) => {
			const first = sortAsc ? lhs : rhs;
			const second = sortAsc ? rhs : lhs;
			switch (sortBy) {
				case 'UserRating':
				case 'Added':
					// ints stored as numbers
					return first[sortBy] ?? 0 - second[sortBy] ?? 0;
				case 'imdbRating':
					// floats stored as strings
					return (
						parseFloat(first[sortBy] ?? '0') - parseFloat(second[sortBy] ?? '0')
					);
				case 'Runtime':
				case 'ScoreRotten':
				case 'Year':
					// strings parsable as ints
					return (
						parseInt(first[sortBy] ?? '0') - parseInt(second[sortBy] ?? '0')
					);
				default:
					// titles without articles (a, the, an)
					return removeArticles(second['Title'].toLowerCase()).localeCompare(
						removeArticles(first['Title'].toLowerCase())
					);
			}
		});

		// console.log('Title,Year,Rotten Score,IMDB Score')
		// for (let i = 0; i < sorted.length; i++)
		// {
		//     console.log(`"${sorted[i].Title}",${sorted[i].Year},${sorted[i].ScoreRotten ?? '??'},${sorted[i].imdbRating ?? '??'}`)
		// }

		setSortedData(sorted);
		setRerenderList(!rerenderList);
	}, [
		sortBy,
		sortAsc,
		mediaType,
		filterField,
		filterValue,
		libraryData,
		searchTerm,
	]);

	useFocusEffect(
		React.useCallback(() => {
			getString('fetch').then((val) => {
				if (val) fetch();
			});
		}, [fetch])
	);

	const fetch = useCallback(async () => {
		removeItem('fetch');
		setRefreshing(true);
		const result = await getLibrary();
		if (result.data) {
			setLibraryData(result.data);
			setData('library', result.data);
		}
		setRefreshing(false);
	}, []);

	// https://stackoverflow.com/a/34347138/1377099
	function removeArticles(str) {
		const words = str.split(' ');
		if (words.length <= 1) return str;
		if (words[0] == 'a' || words[0] == 'the' || words[0] == 'an') {
			return words.splice(1).join(' ');
		}
		return str;
	}

	const openForEditing = (mediaItem) => {
		navigation.navigate('Edit', {
			media: mediaItem,
			mode: 'edit',
			formats: mediaItem.Formats,
		});
	};

	const openAdd = () => {
		navigation.navigate('Add');
	};

	const numCols = Math.max(Math.floor(useWindowDimensions().width / 400), 1);

	return (
		<Screen style={styles.screen}>
			<FlatList
				style={styles.list}
				data={sortedData}
				extraData={rerenderList}
				numColumns={numCols}
				// need to also change key when changing numColumns
				key={numCols}
				keyExtractor={(listing) => listing.imdbID + numCols}
				initialNumToRender={numCols * 5}
				removeClippedSubviews={true}
				renderItem={({ item }) => (
					<Card
						style={{ flex: 1 / numCols }}
						movie={item}
						onPress={() => openForEditing(item)}
					/>
				)}
				contentContainerStyle={{ flexGrow: 1 }}
				ListEmptyComponent={
					<View style={styles.listEmptyContainer}>
						{refreshing ? (
							<Text>Loading...</Text>
						) : (
							<View>
								<Text>Nothing to see here.</Text>
								<Text>...yet.</Text>

								{firstScan && (
									<Text style={{ marginTop: 40 }}>
										Tap 'Add' below to get started!
									</Text>
								)}
							</View>
						)}
					</View>
				}
				ListHeaderComponent={
					<View
						style={{
							flexDirection: 'row',
							marginVertical: 15,
							width: '70%',
							alignItems: 'center',
							alignSelf: 'center',
						}}>
						<View style={{ flex: 1, marginRight: 5 }}>
							<Mk_RoundButton
								icon={'movie-open'}
								style={{
									alignSelf: 'center',
									width: 130,
									backgroundColor:
										mediaType === 'movie'
											? colours.secondary
											: colours.secondary_light,
								}}
								iconStyle={{
									color: mediaType === 'movie' ? colours.white : colours.light,
								}}
								onPress={() => setMediaType('movie')}
							/>
						</View>

						<View style={{ flex: 1, marginLeft: 5 }}>
							<Mk_RoundButton
								icon={'television-classic'}
								style={{
									alignSelf: 'center',
									width: 130,
									backgroundColor:
										mediaType === 'series'
											? colours.secondary
											: colours.secondary_light,
								}}
								iconStyle={{
									color: mediaType === 'series' ? colours.white : colours.light,
								}}
								onPress={() => setMediaType('series')}
							/>
						</View>
					</View>
				}
				ListFooterComponentStyle={styles.listFooter}
				ListFooterComponent={
					<>
						{sortedData.length > 0 && (
							<Text style={styles.legal} numberOfLines={2}>
								The Fresh Tomato® and Rotten Splat® logos are registered
								trademarks of Fandango Media LLC.
							</Text>
						)}
					</>
				}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={() => fetch()} />
				}
			/>

			<FAB
				placement="right"
				visible={!showSearchModal}
				icon={{ name: 'add', color: 'white' }}
				color={colours.primary}
				onPress={() => openAdd()}
			/>

			{showSearchModal && (
				<View style={styles.searchModal}>
					<Mk_TextSearch
						style={{ flex: 1 }}
						onChangeText={(text) => setSearchTerm(text)}
						onPress={() => {
							setShowSearchModal(false);
							setSearchTerm(null);
						}}
						value={searchTerm}
						icon={'cancel'}
						placeholder={'Search for title, actor, or director...'}
						btnColour={colours.danger}
						shouldAutoFocus={showSearchModal}
					/>
				</View>
			)}

			<Modal visible={showSortFilterModal} animationType={'slide'}>
				<View style={styles.filtersModal}>
					<Text style={styles.filtersTitle}>Filters and Sorting</Text>

					<Text style={styles.filtersSectionTitle}>Sort items by</Text>
					<Picker
						style={styles.filtersPicker}
						selectedValue={sortBy}
						onValueChange={(itemValue, itemIndex) => {
							setSortBy(itemValue);
						}}>
						{sortFields.map((mpObj) => (
							<Picker.Item
								label={mpObj.Label}
								value={mpObj.Field}
								key={mpObj.Field}
							/>
						))}
					</Picker>

					{filterOptions && (
						<>
							<Text style={styles.filtersSectionTitle}>Filter items by</Text>
							<Picker
								style={styles.filtersPicker}
								selectedValue={filterField}
								onValueChange={(itemValue, itemIndex) => {
									setFilterField(itemValue);
									setFilterValue(
										itemValue === 'None' ||
											filterOptions[itemValue].length === 0
											? null
											: filterOptions[itemValue][0]
									);
								}}>
								{Object.keys(filterOptions).map((key) => (
									<Picker.Item label={key} value={key} key={key} />
								))}
							</Picker>
						</>
					)}

					{filterField && filterField != 'None' && (
						<Picker
							style={styles.filtersPicker}
							selectedValue={filterValue}
							onValueChange={(itemValue, itemIndex) => {
								setFilterValue(itemValue);
							}}>
							{filterOptions[filterField].map((key) => (
								<Picker.Item label={key} value={key} key={key} />
							))}
						</Picker>
					)}
					<Mk_Button
						style={styles.filtersClose}
						text={'Close'}
						onPress={() => setShowSortFilterModal(false)}
					/>
				</View>
			</Modal>
		</Screen>
	);
}

const styles = StyleSheet.create({
	listEmptyContainer: {
		height: '80%',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	fab: {
		color: colours.primary,
	},
	filtersModal: {
		width: '100%',
		height: '100%',
		padding: 20,
	},
	searchModal: {
		width: '100%',
		maxWidth: 800,
		alignSelf: 'center',
		zIndex: 1,
		position: 'absolute',
		bottom: 15,
	},
	searchTitle: {
		marginTop: 20,
		width: '80%',
		marginHorizontal: '10%',
		textAlign: 'center',
		fontSize: 20,
	},
	searchClose: {
		marginTop: 10,
	},
	filtersPicker: {
		marginTop: 5,
		backgroundColor: colours.light,
	},
	filtersTitle: {
		marginVertical: 10,
		width: '100%',
		textAlign: 'center',
		fontSize: 20,
	},
	filtersSectionTitle: {
		width: '100%',
		marginTop: 20,
		textAlign: 'center',
	},
	filtersClose: {
		position: 'absolute',
		bottom: 25,
	},
	screen: {
		paddingTop: 0,
		backgroundColor: colours.light,
	},
	listFooter: {
		marginBottom: 7,
	},
	legal: {
		textAlign: 'center',
		color: colours.medium,
		fontSize: 8,
	},
	navButton: {
		marginHorizontal: 3,
	},
});
