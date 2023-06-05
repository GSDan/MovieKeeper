import React, { useState } from 'react';
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: "",
});
const openai = new OpenAIApi(configuration);

export const useGetTrivia = () =>
{
    const [state, setState] = useState({
        aiLoading: false,
        aiError: null,
        aiResult: null
    })

    const resetResults = () =>
    {
        return setState(
        {
            aiLoading: false,
            aiError: null,
            aiResult: null
        });
    }

    const getTrivia = async (title, imdbID) =>
    {
        setState(
            {
                aiLoading: true,
                aiResult: null,
                imdbError: null
            });

        try
        {
            console.log(`${title} ${imdbID}`)

            const result = await openai.createChatCompletion({
                "model": "gpt-3.5-turbo",
                "temperature": 0,
                "messages": [
                    {
                        "role": "system", 
                        "content": "You create one piece of movie trivia when "+
                                    "given a movie's title and its IMDB ID.  The "+ 
                                    "trivia you return must not include the movie's "+
                                    "title or the name of any of its characters. "+
                                    "Instead of the title, say 'this movie'."
                    },
                    {"role": "user", "content": `${title} ${imdbID}`}
                ]
              });

              console.log(result.data.choices[0].message.content);

            setState(
                {
                    imdbLoading: false,
                    imdbError: null,
                    imdbResults: result.data.choices[0].text
                });

        } catch (error)
        {
            console.log('AI error')
            console.log(error);
            setState({
                aiLoading: false,
                aiResult: null,
                aiError: "Oops, something went wrong."
            })
        }
    }

    return [getTrivia, resetResults, { ...state }]
}