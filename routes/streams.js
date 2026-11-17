const express = require("express")
const stream = express.Router()

require('dotenv').config()//process.env.var

const Metadata = require('./metadata_copy.js')
const relationsAPI = require('./relations.js')
const CLIENT_CACHE = require('../lib/clientCache.js')
// const animeFLVAPI = require('./animeFLV.js')
const animeAV1API = require('./animeav1.js')
const henaojaraAPI = require('./henaojara.js')
// const animejaraAPI = require('./animejara.js')
// const jkanimeAPI = require('./jkanime.js')
const latanimeAPI = require('./latanime.js')
const apotoxinAPI = require('./apotoxin.js')
const fuzzysort = require('fuzzysort')

/**
 * Tipical express middleware callback.
 * @callback subRequestMiddleware
 * @param req - Request sent to our router, containing all relevant info
 * @param res - Our response
 * @param {function} [next] - The next middleware function in the chain, should end the response at some point
 */
/** 
 * Handles requests to /stream that contain extra parameters, we should append them to the request for future middleware, see {@link SearchParamsRegex} to see how these are handled
 * @param req - Request sent to our router, containing all relevant info
 * @param res - Our response, we don't end it because this function/middleware doesn't handle the full request!
 * @param {subRequestMiddleware} next - REQUIRED: The next middleware function in the chain, should end the response at some point
 */
function HandleLongStreamRequest(req, res, next) {
  console.log(`\x1b[96mEntered HandleLongStreamRequest with\x1b[39m ${req.originalUrl}`)
  res.locals.extraParams = SearchParamsRegex(req.params[0])
  next()
}
/** 
 * Handles requests to /stream whether they contain extra parameters (see {@link HandleLongSubRequest} for details on this) or just the type and videoID.
 * @param req - Request sent to our router, containing all relevant info
 * @param res - Our response, note we use next() just in case we need to add middleware, but the response is handled by sending an empty stream Object.
 * @param {subRequestMiddleware} [next] - The next middleware function in the chain, can be empty because we already responded with this middleware
 */
function HandleStreamRequest(req, res, next) {
  console.log(`\x1b[96mEntered HandleStreamRequest with\x1b[39m ${req.originalUrl}`)
  const onlyInternal = (res.locals.config?.get("externalStreams") != 'true')
  let streams = []
  const idDetails = req.params.videoId.split(':')
  const videoID = idDetails[0] //We only want the first part of the videoID, which is the IMDB ID, the rest would be the season and episode
  if (/*(videoID?.startsWith("animeflv")) || */(videoID?.startsWith("animeav1")) || (videoID?.startsWith("henaojara")) /*|| (videoID?.startsWith("jkanime"))*/ || (videoID?.startsWith("latanime"))) { //If we got an AnimeFLV or AnimeAV1 specific ID
    const ID = idDetails[1] //We want the second part of the videoID
    let episode = idDetails[2] //undefined if we don't get an episode number in the query, which is fine
    let season
    console.log(`\x1b[33mGot a ${req.params.type} with ${videoID} ID:\x1b[39m ${ID}`)
    console.log('Extra parameters:', res.locals.extraParams)
    const sourcePromises = {}
    if (configuredProviders.includes("animeav1") && videoID === "animeav1") sourcePromises.AnimeAV1 = animeAV1API.GetItemStreams(ID, onlyInternal, episode)
    if (configuredProviders.includes("henaojara") && videoID === "henaojara") sourcePromises.Henaojara = henaojaraAPI.GetItemStreams(ID, onlyInternal, episode)
    if (configuredProviders.includes("latanime") && videoID === "latanime") sourcePromises.Latanime = latanimeAPI.GetItemStreams(ID, onlyInternal, episode)
    CombineStreams(sourcePromises).then((combinedStreams)=>{
      if (combinedStreams.length > 0) {
        console.log(`\x1b[36mGot ${combinedStreams.length} streams\x1b[39m`)
        res.header('Cache-Control', CLIENT_CACHE.streams)
        res.json({ streams: combinedStreams, message: "Got streams!" })
        next()
      } else {
        if (!res.headersSent) {
          res.header('Cache-Control', CLIENT_CACHE.failure)
          res.json({ streams, message: "Failed getting streams" });
          next()
        }
      }
    })
  } else {
    let episode, season, animeIMDBIDPromise, romajiPromise

    if (videoID?.startsWith("tt")) { //If we got an IMDB ID/TMDB ID
      const ID = videoID //We want the IMDB ID as is
      season = idDetails[1] //undefined if we don't get a season number in the query, which is fine
      episode = idDetails[2] //undefined if we don't get an episode number in the query, which is fine
      console.log(`\x1b[33mGot a ${req.params.type} with IMDB ID:\x1b[39m ${ID}`)
      animeIMDBIDPromise = Promise.resolve(ID)
      romajiPromise = relationsAPI.GetRomajiTitle("imdb", ID)
    } else if (videoID?.startsWith("tmdb")) {
      const ID = idDetails[1] //We want the second part of the videoID, which is the kitsu ID
      season = idDetails[2] //undefined if we don't get a season number in the query, which is fine
      episode = idDetails[3] //undefined if we don't get an episode number in the query, which is fine
      console.log(`\x1b[33mGot a ${req.params.type} with TMDB ID:\x1b[39m ${ID}`)
      animeIMDBIDPromise = Metadata.GetIMDBIDFromTMDBID(ID, req.params.type)
      romajiPromise = relationsAPI.GetRomajiTitle("themoviedb", ID)
    } else if (videoID.match(/^(?:kitsu|mal|anidb|anilist)$/)) { //If we got a kitsu, mal, anilist or anidb ID
      const ID = idDetails[1] //We want the second part of the videoID, which is the kitsu ID
      episode = idDetails[2] //undefined if we don't get an episode number in the query, which is fine
      console.log(`\x1b[33mGot a ${req.params.type} with ${videoID} ID:\x1b[39m ${ID}`)
      const mappings = relationsAPI.GetAniZipMappings(videoID, ID) //one ani.zip call for both the IMDB ID and the romaji title
      animeIMDBIDPromise = relationsAPI.GetIMDBIDFromANIMEID(videoID, ID, mappings)
      romajiPromise = relationsAPI.GetRomajiTitle(videoID, ID, mappings)
    } else {
      if (!res.headersSent) {
        res.header('Cache-Control', "max-age=86400, stale-while-revalidate=86400, stale-if-error=259200")
        res.json({ streams, message: "Wrong ID format, check manifest for errors" }); next()
      }
      return //nothing else to do, and there's no promise to continue with
    }

    console.log('Extra parameters:', res.locals.extraParams)
    romajiPromise = romajiPromise?.catch((err) => console.error('\x1b[31mFailed getting romaji title:\x1b[39m ' + err))
    //a special (season 0) is searched by its own title (from Cinemeta): the romaji would be the main series' title
    if (parseInt(season) === 0) romajiPromise = Promise.resolve()
    animeIMDBIDPromise.then((imdbID) => {
      if (!imdbID || imdbID === "null") throw Error("No IMDB ID")
      let metaProm
      if ((season) && (parseInt(season) === 0) && (req.params.type==="series")){
        console.log(`\x1b[33mGot a "special", searching Cinemeta with:`, imdbID, "to get the special's title:\x1b[39m")
        metaProm=Metadata.GetSpecialMeta(imdbID,episode)
      } else {
        console.log(`\x1b[33mGetting TMDB metadata for IMDB ID:\x1b[39m`, imdbID)
        metaProm=Metadata.GetTMDBMeta(imdbID).then((TMDBmeta) => {
          console.log('\x1b[36mGot TMDB metadata:\x1b[39m', TMDBmeta.shortPrint())
          return TMDBmeta
        }).catch((reason) => {
          console.error("\x1b[31mDidn't get TMDB metadata because:\x1b[39m " + reason + ", \x1b[33mtrying Cinemeta...\x1b[39m")
          return Metadata.GetCinemetaMeta(imdbID, req.params.type).then((Cinemeta) => {
            console.log('\x1b[36mGot Cinemeta metadata:\x1b[39m', Cinemeta.shortPrint())
            return Cinemeta
          })
        })
      }
      
      return metaProm.catch((err) => { //only catches error from TMDB or Cinemeta API calls, which we want
        console.error('\x1b[31mFailed on metadata:\x1b[39m ' + err)
        if (!res.headersSent) {
          res.header('Cache-Control', CLIENT_CACHE.failure)
          res.json({ streams, message: "Failed getting media info" })
          next()
        }
        throw err //We throw the error so we can catch it later
      })
    }).then((metadata) => Promise.resolve(romajiPromise).then((romaji) => {
      //Sites list anime by their romaji title: try it first, then the provider's (usually English) title, since the
      //romaji sometimes doesn't match a site's naming (e.g. AniList's "SPY×FAMILY" vs the sites' "Spy x Family")
      const searchTerms = [...new Set([romaji, metadata.title].filter(Boolean))].map((title) => ((season) && (parseInt(season) !== 1) && (parseInt(season) !== 0)) ? `${title} ${season}` : title)
      console.log('Search terms:', searchTerms)
      //Runs a source's search/match/streams chain with each search term until one succeeds
      const firstMatch = async (searchFn) => {
        let lastError = Error('No search terms!')
        for (const searchTerm of searchTerms) {
          try {
            return await searchFn(searchTerm)
          } catch (err) {
            lastError = err //this term found nothing on this site, try the next one
          }
        }
        throw lastError
      }
      //Regular-season episodes must not match a site's separate "Specials"/OVA entry (#55)
      const notSpecial = (items) => (req.params.type === "series" && parseInt(season) !== 0) ? items.filter((i) => !/\b(specials?|especial(es)?|ova)\b/i.test(i.title)) : items
      // const animeFLVp = animeFLVAPI.SearchAnimeFLV(searchTerm).then((animeFLVitem) => {
      //   const result = fuzzysort.go(searchTerm, animeFLVitem, {key: 'title', limit: 1})[0]?.obj || animeFLVitem.sort((a,b)=>(a.type === req.params.type && b.type !== req.params.type)?-1:0)[0];//Sort by type to enhance matching
      //   console.log('\x1b[36mGot AnimeFLV entry:\x1b[39m', result.title)
      //   return animeFLVAPI.GetItemStreams(result.slug, onlyInternal, episode)
      // })
      const animeAV1p = configuredProviders.includes("animeav1") ? firstMatch((searchTerm) => animeAV1API.SearchAnimeAV1(searchTerm, req.params.type).then(notSpecial).then((animeFLVitem) => {
        const result = fuzzysort.go(searchTerm, animeFLVitem, {key: 'title', limit: 1, threshold: .5})[0]?.obj;
        if (!result) throw Error('No search results!')
        console.log('\x1b[36mGot AnimeAV1 entry:\x1b[39m', result.title)
        return animeAV1API.GetItemStreams(result.slug, onlyInternal, episode)
      })) : Promise.resolve([])
      //Henaojara lists every season, movie and dub as its own entry: keep only the ones that can be the requested one
      //(same type, no "Season/Part N" of another season), fuzzy match among them, and don't fall back to the first result
      const sameSeason = (title) => { const n = title.match(/\b(?:season|temporada|part|parte)\s*(\d+)/i)?.[1]; return !n || parseInt(n) === (parseInt(season) || 1) }
      const henaojarap = configuredProviders.includes("henaojara") ? firstMatch((searchTerm) => henaojaraAPI.SearchHenaojara(searchTerm).then(notSpecial).then((animeFLVitem) => {
        const candidates = animeFLVitem.filter((i) => (!i.type || i.type === req.params.type) && sameSeason(i.title))
        const result = fuzzysort.go(searchTerm, candidates, {key: 'title', limit: 1, threshold: .5})[0]?.obj;
        if (!result) throw Error('No search results!')
        console.log('\x1b[36mGot Henaojara entry:\x1b[39m', result.title)
        return henaojaraAPI.GetItemStreams(result.slug, onlyInternal, episode)
      })) : Promise.resolve([])
      return Promise.allSettled([animeAV1p, henaojarap]).then((results) => results.flatMap((result) => result.status === "fulfilled" ? result.value : []))
    })).then((foundStreams) => {
      if (!res.headersSent) {
        res.header('Cache-Control', foundStreams.length ? CLIENT_CACHE.streams : CLIENT_CACHE.failure)
        res.json({ streams: foundStreams, message: foundStreams.length ? "Got streams!" : "Failed getting streams" })
        next()
      }
    }).catch((err) => {
      console.error('\x1b[31mFailed on metadata search because:\x1b[39m ' + err)
      if (!res.headersSent) {
        res.header('Cache-Control', CLIENT_CACHE.failure)
        res.json({ streams, message: "Failed getting media info" })
        next()
      }
    })
  }
}
/** 
 * Parses the extra config parameter we can get when the addon is configured
 * @param req - Request sent to our router, containing all relevant info
 * @param res - Our response, note we use next() just in case we need to add middleware
 * @param {subRequestMiddleware} [next] - The next middleware function in the chain
 */
function ParseConfig(req, res, next) {
  //console.log(`\x1b[96mEntered ParseConfig with\x1b[39m ${req.originalUrl}`)
  res.locals.config = new URLSearchParams(decodeURIComponent(req.params.config))
  console.log('Config parameters:', res.locals.config)
  next()
}
//Configured requests
stream.get("/:config/stream/:type/:videoId/*.json", ParseConfig, HandleLongStreamRequest, HandleStreamRequest)
stream.get("/:config/stream/:type/:videoId.json", ParseConfig, HandleStreamRequest)
//Unconfigured requests
stream.get("/stream/:type/:videoId/*.json", HandleLongStreamRequest, HandleStreamRequest)
stream.get("/stream/:type/:videoId.json", HandleStreamRequest)
/** 
 * Parses the capture group corresponding to URL parameters that stremio might send with its request. Tipical extra info is a dot separated title, the video hash or even file size
 * @param {string} extraParams - The string captured by express in req.params[0] in route {@link stream.get("/:type/:videoId/*.json", HandleLongSubRequest, HandleSubRequest)}
 * @return {Object} Empty if we passed undefined, populated with key/value pairs corresponding to parameters otherwise
 */
function SearchParamsRegex(extraParams) {
  //console.log(`\x1b[33mfull extra params were:\x1b[39m ${extraParams}`)
  if (extraParams !== undefined) {
    const paramMap = new Map()
    const keyVals = extraParams.split('&');
    for (let keyVal of keyVals) {
      const keyValArr = keyVal.split('=')
      const param = keyValArr[0]; const val = keyValArr[1];
      paramMap.set(param, val)
    }
    const paramJSON = Object.fromEntries(paramMap)
    //console.log(paramJSON)
    return paramJSON
  } else return {}
}

//Internal streams (they play inside Stremio: direct links and torrents) go first: each source's go after the previous
//sources' internal ones, and its external ones at the end
const isInternal = (stream) => stream.url !== undefined || stream.infoHash !== undefined

/**
 * @param {Object<string, Promise<Array>>} sources - each source's streams promise, by its name, in priority order
 * @return {Promise<Array>} the streams of the sources that got them
 */
function CombineStreams(sources) {
  const names = Object.keys(sources)
  return Promise.allSettled(Object.values(sources)).then((results) => results.reduce((combined, result, i) => {
    if (!result.value) {
      console.error(`\x1b[31mFailed on ${names[i]} stream search because:\x1b[39m ` + result.reason)
      return combined
    }
    console.log(`\x1b[36mGot ${result.value.length} ${names[i]} streams\x1b[39m`)
    const lastInternal = combined.findLastIndex(isInternal), lastNewInternal = result.value.findLastIndex(isInternal)
    if (lastNewInternal === -1) return combined.concat(result.value) //it has only external links, append them at the end
    if (lastInternal === -1) return result.value.concat(combined) //the previous ones are only external, prepend it at the start
    return [...combined.slice(0, lastInternal + 1), ...result.value.slice(0, lastNewInternal + 1), //its internal links after the previous ones
      ...combined.slice(lastInternal + 1), ...result.value.slice(lastNewInternal + 1)] //and its external links at the end
  }, []))
}

module.exports = stream;
