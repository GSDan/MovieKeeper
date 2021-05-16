const functions = require("firebase-functions");
const axios = require('axios');

const toStrip = ['ultra hd', 'ultra-hd', 'uhd', 'blu ray', 'blu-ray', 'bluray', 'dvd', '4k']

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest(async (req, resp) => {
    
    try 
    {
        // https://developer.ebay.com/DevZone/build-test/test-tool/?index=0&env=production&api=browse&call=item_summary_search__GET&variation=json
        //https://api.ebay.com/buy/browse/v1/item_summary/search?gtin=5051892230087

        var barcode = req.query.barcode;    
        var appId = "let's not";
        var lastData = {}

        var ebayResp = await axios.get(`https://open.api.ebay.com/shopping?version=1119&appid=${appId}&callname=FindProducts&ProductID.Value=${barcode}&ProductID.Type=UPC&ResponseEncodingType=JSON`)

        if(!ebayResp || !ebayResp.data.Product || ebayResp.data.Product.length === 0)
        {
            console.log("Trying again...")
            ebayResp = await axios.get(`https://open.api.ebay.com/shopping?version=1119&appid=${appId}&callname=FindProducts&QueryKeywords=${barcode}&ResponseEncodingType=JSON`)
        }

        if(!ebayResp || !ebayResp.data.Product || ebayResp.data.Product.length === 0)
        {
            console.log(ebayResp.data)
            return resp.send("Not found");
        }

        lastData = ebayResp.data.Product[0];

        // strip of extra descriptors in brackets e.g. (4k UHD, 2019)
        var title = ebayResp.data.Product[0].Title.replace(/ *\([^)]*\) */g, "");
        var omdb = 'nice try';

        var omdbResp = await axios.get(`https://www.omdbapi.com/?t=${title}&apikey=${omdb}`)
        
        if(omdbResp && omdbResp.data)
        {
            return resp.send(omdbResp.data);
        }
        return resp.send(lastData);
    } 
    catch (error) {
        console.log(error);
        return resp.send(error);
    }

    //http://open.api.ebay.com/shopping?callname=FindProducts­&responseencoding=XML­&appid=AppID­&siteid=0­&version=663­&ProductID.Type=UPC­&ProductID.Value=711719866824
  });