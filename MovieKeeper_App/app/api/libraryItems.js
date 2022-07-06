import apiClient from "./client";

const getFromBarcode = (barcode, region) => apiClient.get('/getMovieFromBarcode', {
    'barcode': barcode,
    'region': region
});

const getFromTitle = (title) => apiClient.get('/getMovieFromTitle', { 'title': title });

export default {
    getFromBarcode,
    getFromTitle
}

