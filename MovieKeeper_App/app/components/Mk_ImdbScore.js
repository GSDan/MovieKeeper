import { StyleSheet, Image, Text } from 'react-native'
import React, { memo } from 'react'

const Mk_ImdbScore = ({ score, style }) =>
{
    return (
        <>
            <Image
                style={[style, styles.imdbIcon]}
                source={require("../assets/imdb.png")} />
            <Text>{score}</Text>
        </>
    )
}

const styles = StyleSheet.create({
    imdbIcon: {
        height: 20,
        width: 20,
        marginRight: 5
    }
});

export default memo(Mk_ImdbScore);