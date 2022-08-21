import { app } from '../config/firebase'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { setString } from '../config/storage';
import Toast from 'react-native-root-toast';

const functions = getFunctions(app);

let loadLibraryCb = null
export function setLoadLibraryCallback(setter)
{
    loadLibraryCb = setter
    return () => loadLibraryCb = null
}

export function callLoadLibraryCallback(value)
{
    if (loadLibraryCb !== null) loadLibraryCb(value)
}

export const getFromBarcode = async (barcode, region) =>
{
    const getMovieFromBarcode = httpsCallable(functions, 'getMovieFromBarcode');
    return await getMovieFromBarcode({ 'barcode': barcode, 'region': region });
};

export const getFromTitle = async (title) =>
{
    const getMovieFromTitle = httpsCallable(functions, 'getMovieFromTitle');
    return await getMovieFromTitle({ title });
};

export const getFromId = async (id) =>
{
    const getMovieFromId = httpsCallable(functions, 'getMovieFromImdbId');
    return await getMovieFromId({ id });
};

export const getLibrary = async () =>
{
    const getLibrary = httpsCallable(functions, 'getLibrary');
    return await getLibrary();
};

export const addSingleToLibrary = async (movieData, userRating, ownedFormats) =>
{
    try
    {
        const addMovieToLibrary = httpsCallable(functions, 'addMovieToLibrary');
        await addMovieToLibrary({
            ...movieData,
            'UserRating': userRating,
            'OwnedFormats': ownedFormats
        });

        Toast.show(`Saved`, {
            duration: Toast.durations.SHORT,
        });

        setString('fetch', 'do it');
        return callLoadLibraryCallback(true);
    }
    catch (error)
    {
        Toast.show(`Error`, {
            duration: Toast.durations.SHORT,
        });
        console.log(error)
    }
};

export const addCustomToLibrary = async (customData, userRating, ownedFormats) =>
{
    try
    {
        const addCustomToLibrary = httpsCallable(functions, 'addCustomToLibrary');
        await addCustomToLibrary({
            ...customData,
            'UserRating': userRating,
            'OwnedFormats': ownedFormats
        });

        Toast.show(`Saved`, {
            duration: Toast.durations.SHORT,
        });

        setString('fetch', 'do it');
        return callLoadLibraryCallback(true);
    }
    catch (error)
    {
        Toast.show(`Error`, {
            duration: Toast.durations.SHORT,
        });
        console.log(error)
    }
};

export const addBoxetToLibrary = async (barcode, mediaItems, ownedFormats) =>
{
    try
    {
        const addBoxetToLibrary = httpsCallable(functions, 'addBoxsetToLibrary');
        await addBoxetToLibrary({
            'Barcode': barcode,
            'MediaItems': mediaItems,
            'OwnedFormats': ownedFormats
        });

        Toast.show(`Saved`, {
            duration: Toast.durations.SHORT,
        });

        setString('fetch', 'do it');
        return callLoadLibraryCallback(true);
    }
    catch (error)
    {
        Toast.show(`Error`, {
            duration: Toast.durations.SHORT,
        });
        console.log(error)
    }
}

export const deleteFromLibrary = async (Type, id) =>
{
    const deleteFromLibrary = httpsCallable(functions, 'deleteFromLibrary');
    return await deleteFromLibrary({ Type, id });
};