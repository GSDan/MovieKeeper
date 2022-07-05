import { create } from 'apisauce';

const apiClient = create({
    baseURL: 'https://us-central1-moviekeeper-18688.cloudfunctions.net'
});

export default apiClient;