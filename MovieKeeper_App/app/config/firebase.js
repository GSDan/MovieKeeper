import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyBUiAjpWXurEMLjs2Rwsl8_m1w1KhP27hk",
    authDomain: "moviekeeper-18688.firebaseapp.com",
    databaseURL: "https://moviekeeper-18688-default-rtdb.firebaseio.com",
    projectId: "moviekeeper-18688",
    storageBucket: "moviekeeper-18688.appspot.com",
    messagingSenderId: "516844614631",
    appId: "1:516844614631:web:8c24faf5bd86e9f6eec342",
    measurementId: "G-5YW2TR1SF8"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

export { app }