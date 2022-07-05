import apiClient from "./client";

const getFromBarcode = (barcode, region) => apiClient.get('/getMovieFromBarcode', {
    'barcode': barcode,
    'region': region
});

export default {
    getFromBarcode
}

