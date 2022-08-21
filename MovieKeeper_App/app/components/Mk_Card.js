import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { memo } from 'react'

import colours from "../config/colours";
import Stars from "../components/Mk_Stars";
import Mk_RottenScore from './Mk_RottenScore';
import Mk_ImdbScore from './Mk_ImdbScore';


function Mk_Card({ movie, onPress, style })
{
    return (
        <TouchableOpacity onPress={onPress} style={style}>
            <View style={styles.card}>
                {movie.Poster && <Image style={styles.image} source={{ uri: movie.Poster }} />}
                {!movie.Poster && <Image style={styles.image} source={require("../assets/adaptive-icon.png")} />}
                <View style={styles.detailsContainer}>
                    <Text style={styles.title} numberOfLines={2}>
                        {movie.Title}
                    </Text>
                    <Text style={styles.subTitle} numberOfLines={2}>
                        {movie.imdbID.startsWith("custom") && "Custom | "}
                        {movie.Rated && movie.Rated + " | "}
                        {movie.Year && movie.Year + " | "}
                        {movie.Runtime && movie.Runtime + " | "}
                        {(movie.Formats.join(', '))}
                    </Text>
                    <Stars
                        value={movie.UserRating}
                        isTouchable={false}
                        containerStyle={{ marginTop: 8 }} />
                    <View style={styles.ratingsContainer}>
                        {movie.ScoreRotten && <Mk_RottenScore score={movie.ScoreRotten} />}
                        {movie.imdbRating && <Mk_ImdbScore score={movie.imdbRating} style={{ marginLeft: movie.ScoreRotten ? 8 : 0 }} />}
                    </View>

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
        marginBottom: 20,
        overflow: "hidden",
        flexDirection: "row",
        flexGrow: 10,
        minHeight: 150
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
        minHeight: 30,
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

// memo does a shallow compare by default, so will always rerender due to our movie prop
function arePropsEqual(lhs, rhs)
{
    if (lhs.movie.imdbID === rhs.movie.imdbID &&
        lhs.movie.UserRating === rhs.movie.UserRating)
    {
        // check if formats have changed
        if (lhs.movie.Formats === rhs.movie.Formats)
            return true; // same ref

        if (lhs.movie.Formats.length !== rhs.movie.Formats.length)
            return false

        if (lhs.movie.Formats == null || rhs.movie.Formats == null)
            return false

        for (let i = 0; i < lhs.movie.Formats.length; i++) 
        {
            if (lhs.movie.Formats[i] !== rhs.movie.Formats[i])
                return false;
        }
        return true;
    }

    return false;
}

export default memo(Mk_Card, arePropsEqual);