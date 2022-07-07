import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'

import colours from "../config/colours";
import Stars from "../components/Mk_Stars";
import Mk_RottenScore from './Mk_RottenScore';
import Mk_ImdbScore from './Mk_ImdbScore';

export default function Mk_Card({ title, rated, year, image, format, runtime, rotten, imdbRating, userRating })
{
    return (
        <View>
            <View style={styles.card}>
                <Image style={styles.image} source={{ uri: image }} />
                <View style={styles.detailsContainer}>
                    <Text style={styles.title} numberOfLines={2}>
                        {title}
                    </Text>
                    <Text style={styles.subTitle} numberOfLines={2}>
                        {rated} | {year} | {runtime} | {format}
                    </Text>
                    <Stars
                        value={userRating}
                        isTouchable={false}
                        containerStyle={{ marginTop: 8 }}
                        onPress={(score) => console.log(score)} />
                    <View style={styles.ratingsContainer}>
                        <Mk_RottenScore score={rotten} />
                        <Mk_ImdbScore score={imdbRating} style={{ marginLeft: 8 }} />
                    </View>

                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 15,
        backgroundColor: colours.white,
        marginBottom: 20,
        overflow: "hidden",
        flexDirection: "row",
        flexGrow: 10
    },
    detailsContainer: {
        padding: 15,
        flex: 6
    },
    image: {
        flex: 4,
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
        minHeight: 40,
        textAlignVertical: 'center'
    },
    ratingsContainer: {
        marginTop: 10,
        flexDirection: "row",
        fontSize: 16
    },
    tomatoIcon: {
        height: 18,
        width: 18,
        marginRight: 4
    },
    imdbIcon: {
        height: 18,
        width: 18,
        marginLeft: 7,
        marginRight: 4
    }
})