import { StyleSheet, Image, Text } from 'react-native'
import React, { memo } from 'react'

const Mk_RottenScore = ({ score }) =>
{
    return (
        <>
            <Image style={styles.tomatoIcon} source={parseInt(score) > 59 ?
                require("../assets/tomatometer-fresh.png") :
                require("../assets/tomatometer-rotten.png")} />
            <Text>{score}</Text>
        </>
    )
}

const styles = StyleSheet.create({
    tomatoIcon: {
        height: 20,
        width: 20,
        marginRight: 5
    }
});

export default memo(Mk_RottenScore);