import React, { useState } from 'react'

export const useSearchTitle = () =>
{
    const [state, setState] = useState({
        imdbLoading: false,
        imdbError: null,
        imdbResults: [],
    })

    const resetResults = () =>
    {
        return setState(
            {
                imdbLoading: false,
                imdbResults: [],
                imdbError: null
            });
    }

    const searchTitle = async (title) =>
    {
        setState(
            {
                imdbLoading: true,
                imdbResults: [],
                imdbError: null
            });

        try
        {
            const url = `https://sg.media-imdb.com/suggests/${title.charAt().toLowerCase()}/${encodeURIComponent(title)}.json`;
            const resp = await fetch(url);
            const parsedResults = JSON.parse((await resp.text()).match(/{.*}/g)).d;

            if (parsedResults.length === 0)
            {
                return setState(
                    {
                        imdbLoading: false,
                        imdbResults: [],
                        imdbError: "Couldn't find a movie with that title"
                    });
            }

            setState(
                {
                    imdbLoading: false,
                    imdbError: null,
                    imdbResults: parsedResults.map(imdbRes => 
                    {
                        return {
                            imdbID: imdbRes.id,
                            Title: imdbRes.l,
                            Year: imdbRes.y,
                            Type: imdbRes.q === 'feature' ? 'Movie' : imdbRes.q === 'video' ? 'Video' : imdbRes.q,
                            Poster: imdbRes.i ? imdbRes.i[0] : undefined,
                            Actors: imdbRes.s
                        }
                    })

                });

        } catch (error)
        {
            console.log(error);
            setState({
                imdbLoading: false,
                imdbResults: [],
                imdbError: "Oops, something went wrong."
            })
        }
    }

    return [searchTitle, resetResults, { ...state }]
}