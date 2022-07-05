const functions = require("firebase-functions");
const EbayAuthToken = require("ebay-oauth-nodejs-client");
const axios = require("axios");
const CircularJSON = require('circular-json');

const ebayScopes = ["https://api.ebay.com/oauth/api_scope", "https://api.ebay.com/oauth/api_scope/sell.inventory"];

const ebayAuthToken = new EbayAuthToken({
  clientId: process.env.EBAY_APPID,
  clientSecret: process.env.EBAY_CERTID,
  redirectUri: process.env.EBAY_RUNAME
});

const toStrip4k = ["ultra hd", "ultra-hd", "uhd", "4k", "hdr"];
const toStripBr = ["+ blu-ray", "blu-ray +", "blu ray", "blu-ray", "bluray", " blu ", "3d"];
const toStripMisc = ["dvd", "P&P free", "free P&P", "brand new", "& sealed", "and sealed", "region free", "slipcover", "fast dispatch"]

// https://stackoverflow.com/a/7313467
String.prototype.replaceAll = function (strReplace, strWith)
{
  const esc = strReplace.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const reg = new RegExp(esc, 'ig');
  return this.replace(reg, strWith);
};

exports.getMovieFromBarcode = functions.https.onRequest(async (req, resp) =>
{
  try
  {
    console.log(req.query)

    const barcode = req.query.barcode;
    const tokenResp = await ebayAuthToken.getApplicationToken('PRODUCTION', ['https://api.ebay.com/oauth/api_scope']);
    const headers = {
      'Authorization': `Bearer ${CircularJSON.parse(tokenResp).access_token}`,
      'X-EBAY-C-MARKETPLACE-ID': req.query.region ? req.query.region : 'EBAY_US'
    };

    let ebayResp = await axios.get(`https://api.ebay.com/buy/browse/v1/item_summary/search?gtin=${barcode}`, { 'headers': headers });

    if (!ebayResp || !ebayResp.data || ebayResp.data.total == 0)
    {
      ebayResp = await axios.get(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${barcode}`, { 'headers': headers });
    }

    if (!ebayResp || !ebayResp.data || ebayResp.data.total == 0)
    {
      return resp.send("Not found");
    }

    let titles = [];

    if (ebayResp.data.itemSummaries.length > 1)
    {
      // try to get a common sequence of words between the first 2 results
      let commonWords = "";
      const wordsInFirstRes = ebayResp.data.itemSummaries[0].title.split(" ");
      const wordsInSecondRes = ebayResp.data.itemSummaries[1].title.split(" ");
      for (let i = 0; i < wordsInFirstRes.length; i++)
      {
        if (wordsInFirstRes[i] === "") continue;

        for (let j = 0; j < wordsInSecondRes.length; j++)
        {
          if (wordsInFirstRes[i].toLowerCase() == wordsInSecondRes[j].toLowerCase())
          {
            commonWords = `${commonWords} ${wordsInFirstRes[i]}`;
            break;
          }
        }
      }

      if (commonWords.length > 0)
      {
        console.log("Common:", commonWords)
        titles.push(commonWords)
      }
    }

    for (let i = 0; i < ebayResp.data.itemSummaries.length; i++)
    {
      titles.push(ebayResp.data.itemSummaries[i].title);
    }

    let likelyFormat = "DVD";
    let lastTitle = null;

    for (let i = 0; i < titles.length && i < 5; i++)
    {
      lastTitle = titles[i];
      lastTitle = lastTitle.toLowerCase();

      // strip format names, saving any matches as the potential format
      // Once set as 4K it can't be overridden, as something could be listed as '4K Blu Ray'
      toStrip4k.forEach((s) =>
      {
        if (lastTitle.includes(s))
        {
          likelyFormat = "4K";
          lastTitle = lastTitle.replaceAll(s, '');
        }
      });
      toStripBr.forEach((s) =>
      {
        if (lastTitle.includes(s))
        {
          if (likelyFormat === "DVD")
          {
            likelyFormat = "Blu-ray";
          }
          lastTitle = lastTitle.replaceAll(s, '');
        }
      });
      toStripMisc.forEach((s) =>
      {
        lastTitle = lastTitle.replaceAll(s, '');
      });

      // strip of extra descriptors in brackets e.g. (4k UHD, 2019)
      lastTitle = lastTitle.replace(/\([^)]*\)*/g, "");
      // strip stuff in asterisks e.g. *NEW - SEALED*
      lastTitle = lastTitle.replace(/\*([^,*]+)\*/g, "");
      // strip stuff in square brackets e.g. [2D - 3D]
      lastTitle = lastTitle.replace(/\[(.*?)\]/g, "");
      // strip the region detail (e.g. 'region 4', 'region b')
      lastTitle = lastTitle.replace(/region . /g, "");
      // strip everything after a hyphen 
      lastTitle = lastTitle.replace(/\-(.*)/g, "");

      // strip NEW from the end if it's there
      if (lastTitle.endsWith(' new'))
      {
        lastTitle = lastTitle.substring(0, lastTitle.length - 3);
      }

      titles[i] = lastTitle.trim();
    }

    for (const title of titles) 
    {
      const omdbResp = await axios.get(`https://www.omdbapi.com/?t=${title}&apikey=${process.env.OMDB_KEY}`);
      if (omdbResp && omdbResp.data && omdbResp.data.Response === "True")
      {
        console.log("Found!", omdbResp.data.Title)
        return resp.send({ "success": true, "likelyFormat": likelyFormat, "data": omdbResp.data });
      }
      else
      {
        console.log("Failed to find", title);
      }
    }

    return resp.send({ "success": false, "likelyFormat": likelyFormat, "data": titles[0] });
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
