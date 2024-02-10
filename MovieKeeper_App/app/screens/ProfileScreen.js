import { StyleSheet, Text, View, Dimensions, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PieChart from 'react-native-pie-chart';
import randomColor from 'randomcolor';

import Screen from '../components/Mk_Screen';
import { useLogout } from '../hooks/userAuthentication';
import Mk_Button from '../components/Mk_Button';
import { getData } from '../config/storage';
import colours from '../config/colours';

export default function ProfileScreen() {
	const [libraryData, setLibraryData] = useState([]);
	const [libraryStats, setLibraryStats] = useState([]);
	const logout = useLogout();

	useEffect(() => {
		let genres = {};

		let toRet = {
			count: 0,
			runtime: 0,
			movies: 0,
			shows: 0,
			withScore: 0,
			runningScore: 0,
		};

		libraryData.forEach((item) => {
			toRet.count++;

			if (item.Type === 'movie') {
				toRet.movies++;
				if (item.Runtime) toRet.runtime += parseInt(item.Runtime);
			} else toRet.shows++;

			if (item.imdbRating) {
				toRet.withScore++;
				toRet.runningScore += parseFloat(item.imdbRating);
			}

			if (item.Genre) {
				let thisGenres = item.Genre.split(',');
				thisGenres.forEach((g) => {
					g = g.trim();
					if (!genres[g]) genres[g] = { count: 1, colour: randomColor() };
					else genres[g].count++;
				});
			}
		});

		toRet.genres = genres;
		toRet.genresOrdered = Object.keys(genres);

		toRet.genresOrdered.sort(function (a, b) {
			return genres[b].count - genres[a].count;
		});

		toRet.coloursOrdered = [];

		toRet.genresOrdered.forEach((g) => {
			toRet.coloursOrdered.push(genres[g].colour);
		});

		setLibraryStats(toRet);
	}, [libraryData]);

	const getCountString = () => {
		return (
			`You have ${libraryStats.count} item${
				libraryStats.count != 1 ? 's' : ''
			} in your library, ` +
			`with ${libraryStats.movies} movie${
				libraryStats.movies != 1 ? 's' : ''
			} ` +
			`and ${libraryStats.shows} TV show${libraryStats.shows != 1 ? 's' : ''}.`
		);
	};

	const getTimeString = () => {
		if (libraryStats.runtime === 0) return 'Add some movies to get some stats!';

		const mins = libraryStats.runtime;
		const toRet = 'Watching all of your movies would take ';
		if (mins < 180) return `${toRet} ${mins} minutes.`;
		if (mins < 48 * 60)
			return `${toRet} ${(mins / parseFloat(60)).toFixed(1)} hours.`;
		return `${toRet} ${(mins / parseFloat(60) / 24).toFixed(1)} days!`;
	};

	const getScoreString = () => {
		if (libraryStats.withScore === 0)
			return 'You must have some movies kicking around somewhere?';
		return `Your library's average IMDB score is ${(
			libraryStats.runningScore / libraryStats.withScore
		).toFixed(2)}.`;
	};

	const getPieSeries = () => {
		if (
			libraryStats.genresOrdered === undefined ||
			libraryStats.genresOrdered.length === 0
		)
			return [1];

		return libraryStats.genresOrdered.map((g) => {
			return libraryStats.genres[g].count;
		});
	};

	const getPieColours = () => {
		if (
			libraryStats.genresOrdered === undefined ||
			libraryStats.genresOrdered.length === 0
		)
			return ['red'];

		return libraryStats.genresOrdered.map((g) => {
			return libraryStats.genres[g].colour;
		});
	};

	const deviceWidth = Dimensions.get('window').width;

	useFocusEffect(
		React.useCallback(() => {
			getData('library').then((data) => setLibraryData(data));
		}, [])
	);

	return (
		<Screen style={styles.screen}>
			<FlatList
				style={styles.list}
				data={libraryStats.genresOrdered}
				keyExtractor={(g) => g}
				ListHeaderComponentStyle={styles.listHeader}
				ListHeaderComponent={
					<>
						<View style={styles.headerContainer}>
							<Text style={styles.header}>Thanks for using MovieKeeper!</Text>
							<MaterialCommunityIcons
								style={{ color: colours.white, textAlign: 'center' }}
								name={'code-braces-box'}
								size={30}
							/>
							<Text style={styles.subheader}>
								Found some bugs or want new features?
							</Text>
							<Text style={styles.subheader}>
								The codebase is free and open source! Suggest changes at
								github.com/GSDan/MovieKeeper
							</Text>
						</View>

						<View style={{ flex: 4, paddingTop: 20, marginBottom: 7 }}>
							<MaterialCommunityIcons
								style={{ color: colours.primary, textAlign: 'center' }}
								name={'alert-octagram'}
								size={30}
							/>

							<Text style={styles.fact}>{getCountString()}</Text>
							<Text style={styles.fact}>{getTimeString()}</Text>
							<Text style={styles.fact}>{getScoreString()}</Text>
						</View>

						{Object.keys(libraryStats.genres ?? {}).length === 0 ? (
							<Text style={[{ flex: 7 }, styles.fact]}>
								I'm pretty sure I saw a disc under the couch...
							</Text>
						) : (
							<View>
								<View style={{ flex: 7, alignItems: 'center' }}>
									<Text style={styles.pieHeader}>Your owned movie genres:</Text>

									<View style={styles.pie}>
										<PieChart
											widthAndHeight={200}
											series={getPieSeries()}
											sliceColor={getPieColours()}
											coverRadius={0.45}
											coverFill={'#FFF'}
										/>
									</View>
								</View>
							</View>
						)}
					</>
				}
				renderItem={({ item }) => (
					<Text style={styles.pieHeader}>
						<Text
							style={{
								color: libraryStats.genres[item].colour,
							}}>
							{'\u2B24 '}
						</Text>
						<Text>
							{item}: {libraryStats.genres[item].count}
						</Text>
					</Text>
				)}
				ListFooterComponentStyle={styles.listFooter}
				ListFooterComponent={
					<View style={styles.logoutContainer}>
						<Mk_Button
							text={'Sign Out'}
							style={styles.logoutButton}
							onPress={logout}
						/>
					</View>
				}
			/>
		</Screen>
	);
}

const styles = StyleSheet.create({
	currentUser: {
		textAlign: 'center',
		marginBottom: 13,
		color: colours.secondary,
	},
	fact: {
		marginVertical: 5,
		textAlign: 'center',
		fontSize: 16,
		marginHorizontal: 15,
		color: colours.medium,
	},
	header: {
		textAlign: 'center',
		fontSize: 24,
		color: colours.white,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	headerContainer: {
		width: '100%',
		backgroundColor: colours.primary,
		paddingHorizontal: 20,
		paddingBottom: 10,
		paddingTop: 8,
		flex: 3,
	},
	logoutContainer: {
		flex: 1,
		width: '100%',
	},
	pieHeader: {
		textAlignVertical: 'bottom',
		textAlign: 'center',
		flex: 1,
		fontSize: 16,
		color: colours.medium,
	},
	pie: {
		marginTop: 15,
		height: 200,
	},
	screen: {
		justifyContent: 'center',
	},
	subheader: {
		textAlign: 'center',
		fontSize: 14,
		color: colours.white,
	},
	listHeader: {
		marginBottom: 10,
	},
	listFooter: {
		marginTop: 17,
		marginBottom: 17,
	},
});
