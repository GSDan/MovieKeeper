import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'

import colours from "../config/colours";
import Mk_RoundButton from './Mk_RoundButton';
import Mk_Stars from './Mk_Stars';

export default function Mk_CardWithAction({ movie, action, rating, onRating, style })
{

    return (
        <View style={[styles.card, style]}>
            <Image style={styles.image} source={{ uri: movie.Poster }} />
            <View style={styles.detailsContainer}>
                <Text style={styles.title} numberOfLines={1}>
                    {movie.Title}
                </Text>
                <Mk_Stars
                    value={rating}
                    isTouchable={true}
                    containerStyle={styles.starContainer}
                    starStyle={styles.stars}
                    onPress={(score) => { onRating(movie.imdbID, score) }} />
                <Text style={styles.subTitle}>
                    {movie.Rated} | {movie.Year} | {movie.Runtime}
                </Text>
            </View>
            <View style={styles.actionContainer}>
                <Mk_RoundButton
                    icon={action.icon}
                    onPress={action.onPress}
                    style={{ backgroundColor: action.colour }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    actionContainer: {
        justifyContent: 'center',
        marginRight: 15
    },
    card: {
        borderRadius: 15,
        backgroundColor: colours.white,
        marginHorizontal: 12,
        marginBottom: 20,
        overflow: "hidden",
        flexDirection: "row",
        flexGrow: 10,
        minHeight: 80,
        borderColor: colours.light,
        borderWidth: 1
    },
    detailsContainer: {
        padding: 15,
        flex: 6
    },
    image: {
        flex: 2,
        height: "100%",
    },
    subTitle: {
        color: colours.dark,
        fontSize: 11
    },
    title: {
        marginBottom: 7,
        marginRight: 15,
        fontWeight: "bold",
        fontSize: 18,
        minHeight: 20,
        textAlignVertical: 'center'
    },
    stars: {
        marginBottom: 10
    }
})