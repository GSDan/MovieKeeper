import { app } from '../config/firebase'
import { getFunctions, httpsCallable } from 'firebase/functions'

const functions = getFunctions(app);

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
        return await addMovieToLibrary({
            ...movieData,
            'UserRating': userRating,
            'OwnedFormats': ownedFormats
        });
    } catch (error)
    {
        console.log(error)
    }
};

export const addBoxetToLibrary = async (barcode, mediaItems, ownedFormats) =>
{
    try
    {
        const addBoxetToLibrary = httpsCallable(functions, 'addBoxsetToLibrary');
        return await addBoxetToLibrary({
            'Barcode': barcode,
            'MediaItems': mediaItems,
            'OwnedFormats': ownedFormats
        });
    } catch (error)
    {
        console.log(error)
    }
}

export const deleteFromLibrary = async (Type, id) =>
{
    const deleteFromLibrary = httpsCallable(functions, 'deleteFromLibrary');
    return await deleteFromLibrary({ Type, id });
};