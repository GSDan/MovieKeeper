import AsyncStorage from '@react-native-async-storage/async-storage';

export const setString = async (key, value) =>
{
    try
    {
        await AsyncStorage.setItem(key, value)
    }
    catch (e)
    {
        // saving error
        console.log(e)
    }
}

export const getString = async (key) =>
{
    try
    {
        return await AsyncStorage.getItem(key);
    }
    catch (e)
    {
        // error reading value
        console.log(e);
    }
}

export const setData = async (key, value) =>
{
    try
    {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem(key, jsonValue)
    } catch (e)
    {
        // saving error
        console.log(e);
    }
}

export const removeItem = async (key) => 
{
    try
    {
        await AsyncStorage.removeItem(key)
    }
    catch (error)
    {
        console.log(error)
    }
}

export const getData = async (key) =>
{
    try
    {
        const jsonValue = await AsyncStorage.getItem(key)
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e)
    {
        // error reading value
        console.log(e);
    }
}

export const loadCachedMatches = async (mediaItems) =>
{
    try
    {
        let combinedResults = mediaItems;
        const fullLibrary = await getData('library');

        let ratings = {};

        if (fullLibrary)
        {
            for (let i = 0; i < mediaItems.length; i++)
            {
                // search for local copy of this item to pull in user's rating, formats etc
                let existing = fullLibrary.find(mov => mediaItems[i].imdbID === mov.imdbID);
                if (existing)
                {
                    existing.Prior = true;
                    if (existing.UserRating) ratings[existing.imdbID] = existing.UserRating;
                    combinedResults[i] = existing;
                }
                else if (mediaItems[i].Ratings)
                {
                    const rotten = mediaItems[i].Ratings.find(r => r.Source === 'Rotten Tomatoes');
                    if (rotten) combinedResults[i].ScoreRotten = rotten.Value;
                }
            }
        }


        return {
            'results': combinedResults,
            'ratings': ratings
        }

    }
    catch (error)
    {

    }
}