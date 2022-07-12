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