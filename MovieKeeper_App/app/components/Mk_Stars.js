import { StyleSheet, View, TouchableOpacity, Image } from 'react-native'
import React from 'react'

export default function Mk_Stars({ value, isTouchable, onPress })
{
    const img_star = require("../assets/star_filled.png");
    const img_starEmpty = require("../assets/star_empty.png");

    const constructStars = () =>
    {
        let React_Native_Rating_Bar = [];
        //Array to hold the filled or empty Stars
        for (let i = 1; i <= 5; i++)
        {
            React_Native_Rating_Bar.push(
                <TouchableOpacity
                    activeOpacity={0.7}
                    key={i}
                    onPress={() =>
                    {
                        if (isTouchable)
                        {
                            console.log(i)
                            onPress(i);
                        }
                    }}>
                    <Image
                        style={styles.StarImage}
                        source={
                            i <= value
                                ? img_star
                                : img_starEmpty
                        }
                    />
                </TouchableOpacity>
            );
        }

        return React_Native_Rating_Bar;
    };

    return (
        <View style={styles.MainContainer}>
            {/*View to hold our Stars*/}
            <View style={styles.childView}>{constructStars()}</View>
        </View>
    )
}

const styles = StyleSheet.create({
    MainContainer: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 20 : 0,
    },
    childView: {
        flexDirection: 'row',
        marginTop: 10,
    },
    StarImage: {
        width: 18,
        height: 18,
        resizeMode: 'cover',
    },
});