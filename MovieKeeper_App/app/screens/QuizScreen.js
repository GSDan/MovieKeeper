import { StyleSheet, Text } from 'react-native';
import React, { useState, useEffect } from 'react';

import { getTrivia } from '../api/libraryItems';
import Screen from '../components/Mk_Screen';

export default function QuizScreen() {
	const [trivia, setTrivia] = useState(null);

	useEffect(() => {
		getTrivia().then((returned) => {
			setTrivia(returned);
		});
	}, []);

	return (
		<Screen style={styles.screen}>
			{trivia && (
				<>
					<Text>{trivia.triviaQuestion}</Text>
					<Text>{trivia.answer.Title}</Text>
					<Text>{trivia.incorrectOptions}</Text>
				</>
			)}
			{trivia == null && <Text>Loading...</Text>}
		</Screen>
	);
}

const styles = StyleSheet.create({
	screen: {
		justifyContent: 'center',
	},
});
