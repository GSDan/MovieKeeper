import { StyleSheet, FlatList, Text } from 'react-native'
import React from 'react'

import Screen from "../components/Mk_Screen";
import Card from "../components/Mk_Card";
import colours from "../config/colours";

const listings = [
    {
        "Title": "Shrek",
        "UserRating": 3,
        "Format": "VHS",
        "Year": "2001",
        "Rated": "PG",
        "Runtime": "90 min",
        "Genre": "Animation, Adventure, Comedy",
        "Director": "Andrew Adamson, Vicky Jenson",
        "Poster": "https://m.media-amazon.com/images/M/MV5BOGZhM2FhNTItODAzNi00YjA0LWEyN2UtNjJlYWQzYzU1MDg5L2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
        "Score_IMDB": "7.9",
        "Score_Rotten": "88%",
        "imdbID": "tt0126029",
        "Type": "movie",
        "Response": "True"
    },
    {
        "Title": "Star Wars Episode IV: A New Hope",
        "Format": "4K",
        "UserRating": 4,
        "Year": "1977",
        "Rated": "PG",
        "Runtime": "121 min",
        "Genre": "Action, Adventure, Fantasy",
        "Director": "George Lucas",
        "Poster": "https://m.media-amazon.com/images/M/MV5BNzg4MjQxNTQtZmI5My00YjMwLWJlMjUtMmJlY2U2ZWFlNzY1XkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
        "Score_Rotten": "93%",
        "Score_IMDB": "8.6",
        "imdbID": "tt0076759",
        "Type": "movie",
        "Response": "True"
    },
    {
        "Title": "Morbius", "Year": "2022", "Rated": "PG-13", "Released": "01 Apr 2022", "Runtime": "104 min",
        "Format": "4K",
        "UserRating": 1,
        "Genre": "Action, Adventure, Horror", "Director": "Daniel Espinosa",
        "Poster": "https://m.media-amazon.com/images/M/MV5BNTA3N2Q0ZTAtODJjNy00MmQzLWJlMmItOGFmNDI0ODgxN2QwXkEyXkFqcGdeQXVyMTM0NTUzNDIy._V1_SX300.jpg",
        "Score_Rotten": "16%",
        "Score_IMDB": "5.1",
        "imdbID": "tt5108870", "Type": "movie", "DVD": "N/A", "BoxOffice": "$73,858,303", "Production": "N/A", "Website": "N/A", "Response": "True"
    }
];

export default function LibraryScreen()
{
    return (
        <Screen style={styles.screen}>
            <FlatList
                style={styles.list}
                data={listings}
                keyExtractor={(listing) => listing.imdbID.toString()}
                renderItem={({ item }) => (
                    <Card
                        title={item.Title}
                        rated={item.Rated}
                        year={item.Year}
                        image={item.Poster}
                        userRating={item.UserRating}
                        format={item.Format}
                        runtime={item.Runtime}
                        rotten={item.Score_Rotten}
                        imdbRating={item.Score_IMDB}
                    />
                )}
                ListFooterComponentStyle={styles.listFooter}
                ListFooterComponent={<Text style={styles.legal} numberOfLines={2}>
                    The Fresh Tomato® and Rotten Splat® logos are registered trademarks of Fandango Media LLC.
                </Text>}
            />

        </Screen>
    )
}

const styles = StyleSheet.create({
    screen: {
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: colours.light,
    },
    list: {

    },
    listFooter: {
        marginBottom: 7
    },
    legal: {
        textAlign: 'center',
        color: colours.medium,
        fontSize: 8
    }
})