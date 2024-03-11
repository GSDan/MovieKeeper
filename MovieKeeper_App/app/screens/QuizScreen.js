import {
	StyleSheet,
	Text,
	FlatList,
	View,
	useWindowDimensions,
	Modal,
	Image,
} from 'react-native';
import React, { useState, useEffect } from 'react';

import { getTrivia } from '../api/libraryItems';
import Screen from '../components/Mk_Screen';
import Card from '../components/Mk_CardMini';
import Mk_Button from '../components/Mk_Button';
import colours from '../config/colours';

export default function QuizScreen() {
	const [question, setQuestion] = useState(null);
	const [err, setErr] = useState(null);
	const [shouldLoad, setShouldLoad] = useState(false);
	const [loading, setLoading] = useState(false);
	const [answers, setAnswers] = useState([]);
	const [answerPosition, setAnswerPosition] = useState(0);
	const [userAnswer, setUserAnswer] = useState(null);

	const numCols = Math.max(Math.floor(useWindowDimensions().width / 190), 1);

	useEffect(() => {
		setShouldLoad(true);
	}, []);

	useEffect(() => {
		if (!shouldLoad || loading) return;

		setShouldLoad(false);
		setLoading(true);
		setQuestion(null);
		setAnswers([]);
		setUserAnswer(null);

		getTrivia().then((ret) => {
			if (ret === undefined) return;
			setLoading(false);
			setErr(ret.err);

			if (ret.result != null) {
				setQuestion(ret.result.triviaQuestion);
				const insertAt = Math.floor(
					Math.random() * ret.result.incorrectOptions.length
				);
				setAnswerPosition(insertAt);
				ret.result.incorrectOptions.splice(insertAt, 0, ret.result.answer);

				setAnswers(ret.result.incorrectOptions);
			}
		});
	}, [shouldLoad]);

	return (
		<Screen style={styles.screen}>
			<FlatList
				style={styles.list}
				data={answers}
				numColumns={numCols}
				// need to also change key when changing numColumns
				key={numCols}
				keyExtractor={(listing) => listing.imdbID + numCols}
				showsVerticalScrollIndicator={false}
				ListHeaderComponentStyle={styles.listHeader}
				ListHeaderComponent={
					<View style={styles.headerContainer}>
						{loading && (
							<>
								<Text style={styles.loading}>Loading...</Text>
							</>
						)}
						{err != null && (
							<>
								<Text style={styles.errTitle}>
									Oops, we couldn't load a trivia question.
								</Text>
								<Text style={styles.errMessage}>{err}</Text>
							</>
						)}
						{question && (
							<>
								<Text style={styles.question}>{question}</Text>
							</>
						)}
					</View>
				}
				renderItem={({ item, index }) => (
					<Card
						style={{ flex: 1 / 2 }}
						movie={item}
						onPress={() => setUserAnswer(index)}
					/>
				)}
			/>

			<Modal visible={userAnswer != null} animationType={'slide'}>
				<View style={styles.modal}>
					<Text style={styles.resultTitle}>Result</Text>

					{userAnswer == answerPosition && (
						<Text style={styles.resultSuccess}>You got it!</Text>
					)}

					{userAnswer != answerPosition && (
						<Text style={styles.resultFail}>Nope! The correct answer was:</Text>
					)}

					{answers[answerPosition] && (
						<Image
							style={styles.fullPoster}
							resizeMode="contain"
							source={{
								uri:
									answers[answerPosition].Thumb ??
									answers[answerPosition].Poster,
							}}
						/>
					)}

					<Mk_Button
						style={styles.modalClose}
						text={'Continue'}
						onPress={() => setShouldLoad(true)}
					/>
				</View>
			</Modal>
		</Screen>
	);
}

const styles = StyleSheet.create({
	screen: {
		justifyContent: 'center',
		paddingHorizontal: 12,
	},
	headerContainer: {
		marginVertical: 20,
	},
	loading: {
		fontWeight: 'bold',
		fontSize: 18,
		minHeight: 30,
		textAlignVertical: 'center',
		textAlign: 'center',
	},
	errTitle: {
		fontWeight: 'bold',
		fontSize: 18,
		textAlignVertical: 'center',
		textAlign: 'center',
		marginBottom: 10,
	},
	errMessage: {
		fontSize: 15,
		textAlignVertical: 'center',
	},
	question: {
		fontWeight: 'bold',
		fontSize: 18,
		textAlignVertical: 'center',
		textAlign: 'center',
		color: colours.primary,
	},
	resultTitle: {
		fontWeight: 'bold',
		fontSize: 18,
		textAlignVertical: 'center',
		textAlign: 'center',
	},
	resultSuccess: {
		fontWeight: 'bold',
		fontSize: 16,
		textAlignVertical: 'center',
		textAlign: 'center',
		color: colours.green,
	},
	resultFail: {
		fontWeight: 'bold',
		fontSize: 16,
		textAlignVertical: 'center',
		textAlign: 'center',
		color: colours.danger,
	},
	modal: {
		width: '100%',
		height: '100%',
		alignContent: 'center',
		justifyContent: 'center',
	},
	fullPoster: {
		marginVertical: 25,
		height: 350,
		alignContent: 'center',
		justifyContent: 'center',
	},
});
