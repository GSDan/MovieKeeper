import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { memo } from 'react';

import colours from '../config/colours';

function Mk_CardMini({ movie, onPress, style }) {
	return (
		<TouchableOpacity onPress={onPress} style={style}>
			<View style={styles.card}>
				{movie.Thumb || movie.Poster ? (
					<Image
						style={styles.image}
						source={{ uri: movie.Thumb ?? movie.Poster }}
					/>
				) : null}
				{!movie.Thumb && !movie.Poster ? (
					<Image
						style={styles.image}
						source={require('../assets/adaptive-icon.png')}
					/>
				) : null}
				<View style={styles.detailsContainer}>
					<Text style={styles.title} numberOfLines={2}>
						{movie.Title}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 15,
		backgroundColor: colours.white,
		marginHorizontal: 12,
		marginBottom: 10,
		overflow: 'hidden',
		borderColor: colours.secondary_light,
		borderStyle: 'solid',
		borderWidth: 1,
	},
	detailsContainer: {
		height: 70,
	},
	image: {
		height: 200,
	},
	title: {
		margin: 10,
		fontWeight: 'bold',
		fontSize: 18,
		minHeight: 30,
		textAlignVertical: 'center',
		textAlign: 'center',
	},
});

// memo does a shallow compare by default, so will always rerender due to our movie prop
function arePropsEqual(lhs, rhs) {
	if (
		lhs.movie.imdbID === rhs.movie.imdbID &&
		lhs.movie.UserRating === rhs.movie.UserRating
	) {
		// check if formats have changed
		if (lhs.movie.Formats === rhs.movie.Formats) return true; // same ref

		if (lhs.movie.Formats.length !== rhs.movie.Formats.length) return false;

		if (lhs.movie.Formats == null || rhs.movie.Formats == null) return false;

		for (let i = 0; i < lhs.movie.Formats.length; i++) {
			if (lhs.movie.Formats[i] !== rhs.movie.Formats[i]) return false;
		}
		return true;
	}

	return false;
}

export default memo(Mk_CardMini, arePropsEqual);
