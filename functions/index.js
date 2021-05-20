const functions = require("firebase-functions");
const EbayAuthToken = require("ebay-oauth-nodejs-client");
const axios = require("axios");
const CircularJSON = require('circular-json');
const env = functions.config();

const ebayScopes = ["https://api.ebay.com/oauth/api_scope", "https://api.ebay.com/oauth/api_scope/sell.inventory"];

const ebayAuthToken = new EbayAuthToken({
  clientId: env.ebay.appid,
  clientSecret: env.ebay.certid,
  redirectUri: env.ebay.runame
});

const toStrip = ["ultra hd", "ultra-hd", "uhd", "blu ray", "blu-ray", "bluray", "dvd", "4k"];

// https://stackoverflow.com/a/7313467
String.prototype.replaceAll = function(strReplace, strWith)
{
  const esc = strReplace.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const reg = new RegExp(esc, 'ig');
  return this.replace(reg, strWith);
};

exports.helloWorld = functions.https.onRequest(async (req, resp) =>
{
  try
  {
    const barcode = req.query.barcode;
    const tokenResp = await ebayAuthToken.getApplicationToken('PRODUCTION', ['https://api.ebay.com/oauth/api_scope']);
    const headers = {
      'Authorization': `Bearer ${CircularJSON.parse(tokenResp).access_token}`,
      'X-EBAY-C-MARKETPLACE-ID' : req.query.region ? req.query.region : 'EBAY_US'
    };

    let ebayResp = await axios.get(`https://api.ebay.com/buy/browse/v1/item_summary/search?gtin=${barcode}`, {'headers':headers});

    if (!ebayResp || !ebayResp.data || ebayResp.data.total == 0)
    {
      console.log("Trying again...");
      ebayResp = await axios.get(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${barcode}`, {'headers':headers});
    }

    if (!ebayResp || !ebayResp.data || ebayResp.data.total == 0)
    {
      return resp.send("Not found");
    }

    const lastData = ebayResp.data.itemSummaries[0];

    // strip of extra descriptors in brackets e.g. (4k UHD, 2019)
    lastData.title = lastData.title.replace(/ *\([^)]*\) */g, " ");
    // strip stuff in asterisks e.g. *NEW - SEALED*
    lastData.title = lastData.title.replace(/ *\*[^)]*\* */g, " ");
    // strip format names
    toStrip.forEach((s) =>
    {
      lastData.title = lastData.title.replaceAll(s, ' ');
    });

    lastData.title.trim();

    const omdbResp = await axios.get(`https://www.omdbapi.com/?t=${lastData.title}&apikey=${env.omdb.key}`);

    if (omdbResp && omdbResp.data && omdbResp.data.Response)
    {
      return resp.send({"success" : true, "data" : omdbResp.data});
    }

    return resp.send({"success" : false, "data" : lastData});
  }
  catch (error)
  {
    console.log(error);
    return resp.send(error);
  }
});

// Currently unused
exports.ebayOauthGetUrl = functions.https.onRequest(async (req, resp) =>
{
  try
  {
    const authUrl = ebayAuthToken.generateUserAuthorizationUrl("PRODUCTION", ebayScopes);
    resp.send(authUrl);
  }
  catch (err)
  {
    return resp.status(500).send(err);
  }
});

// Currently unused
exports.ebayOauthGetTokens = functions.https.onRequest(async (req, resp) =>
{
  try
  {
    if (!req.query.ebaycode)
    {
      return resp.status(400).send("Ebay code required");
    }

    const accessToken = await ebayAuthToken.exchangeCodeForAccessToken("PRODUCTION", req.query.ebaycode);
    resp.send(accessToken);
  }
  catch (err)
  {
    return resp.status(500).send(err);
  }
});

exports.ebayOathRefreshToken = functions.https.onRequest(async (req, resp) =>
{
  try
  {
    if (!req.query.refreshToken)
    {
      return resp.status(400).send("Ebay refresh token required");
    }

    const accessToken = await ebayAuthToken.getAccessToken("PRODUCTION", req.query.refreshToken, ebayScopes);
    resp.send(accessToken);
  }
  catch (err)
  {
    return resp.status(500).send(err);
  }
});
