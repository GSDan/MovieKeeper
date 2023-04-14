<p align="center">
	<img src="https://github.com/GSDan/MovieKeeper/blob/main/store/banner.png?raw=true" width="600" align="center">
</p>

<p align="center">
	MovieKeeper makes it easy to scan and organise your collection of physical media. Keep track of your library and browse by ratings, genre, runtime and more!
	<br><br>
	<img src="https://raw.githubusercontent.com/GSDan/MovieKeeper/main/store/screen1.webp" height="500" align="center">
	<img src="https://raw.githubusercontent.com/GSDan/MovieKeeper/main/store/screen2.webp" height="500" align="center">
  <img src="https://raw.githubusercontent.com/GSDan/MovieKeeper/main/store/screen3.webp" height="500" align="center">
  <br>
  <img src="https://raw.githubusercontent.com/GSDan/MovieKeeper/main/store/screen4.webp" height="500" align="center">
</p>

<p align="center">
    <a href="https://play.google.com/store/apps/details?id=me.danrichardson.moviekeeper">
        <img alt="Get it on Google Play" src="https://ourplace.app/Content/img/icons/googlePlayBadge.png" height="50">
    </a>
</p>

## What is MovieKeeper?
MovieKeeper is a React Native smartphone app, designed to make it easy to create and maintain a catalogue of the movies and TV shows you own on physical media. It is a personal project, motivated for two reasons: 1) I wanted to learn React and React Native; 2) I kept nearly buying duplicate copies of movies, and frankly it was getting embarassing. 

Features include:

- Search for items by scanning barcodes or entering titles
- Give items star ratings out of 5
- Note which media format(s) you own items on
- Sort and filter items by runtime, genre, IMDB and Rotten ratings, release date and more
- Smartphone and tablet support

## Project Structure
The project currently has two main components: the smartphone app, and a Firebase Functions API. I plan to build a React website at some point in the future.

### MovieKeeper_App
A React Native project, created using Expo. It is cross-platform, but I don't have an iOS device or Mac. Components and screens are grouped in their own folders, and logic for communicating with the Firebase cloud is stored in the API folder.

### Functions
The app's main logic is kept in the Firebase Functions API, which should make expanding MovieKeeper to other platforms easier. As no expansive and affordable databases of movie barcodes exist, the MovieKeeper API uses a combination of searches of eBay listings and IMDB to try and identify titles based on their barcode. Saved items are stored in a Firebase Firestore database, meaning that later requests don't have to jump through as many hoops.
