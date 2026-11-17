//npm run devStart
const express = require("express")
const path = require("path")
const app = express()

require("./lib/http.js").Install() //shared cache, per-site limits and a browser User-Agent for every request to the sites

//const { addonBuilder, serveHTTP, publishToCentral } = require('stremio-addon-sdk')

function setCORS(_req, res, next) {
  res.header(`Access-Control-Allow-Origin`, `*`);
  res.header(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
  res.header(`Access-Control-Allow-Headers`, `Content-Type`);
  next();
}
app.use(setCORS);

app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const fsPromises = require("fs/promises")
//Read once at startup: deploys upload files one by one, so reading package.json on every request could catch it
//half-written (JSON.parse failed, and the host's proxy kept serving that 500)
const PACKAGE_JSON = require('./package.json')
function ReadManifest() {
  return Promise.resolve(PACKAGE_JSON).then((packageJSON) => {

    let manifest = {
      "id": 'com.' + packageJSON.name.replaceAll('-', '.'),
      "version": packageJSON.version,
      "name": "AnimeLatam",
      "logo": "https://raw.githubusercontent.com/bruizr/AnimeLatam/main/views/AnimeLatam.svg",
      "background": "https://images6.alphacoders.com/113/1135890.jpg",
      "description": packageJSON.description,
      "catalogs": [],
      "resources": [
        "stream",
        { name: "meta", types: ["movie", "series", "anime", "other"], idPrefixes: ["animeav1:", "henaojara:", "latanime:", "anilist:", "mal:", "anidb:"] }
      ],
      "types": [
        "movie",
        "series",
        "anime",
        "other"
      ],
      "idPrefixes": [
        "tt",
        // "animeflv:",
        "animeav1:",
        "henaojara:",
        // "animejara:",
        // "jkanime:", //JKAnime answers 403 to the server (#61)
        "latanime:",
        "tmdb:",
        "anilist:",
        "kitsu:",
        "mal:",
        "anidb:"
      ],
      "stremioAddonsConfig": {
        "issuer": "https://stremio-addons.net",
        "signature": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..0XN39hJS4zjNV5ES2brUeQ.sjRgcAHGPIUA0GXXbZI2BZLuKUOiT3jfI8ALp-QlUcWNuW_9qcVjARUxKCE6ncTE1rdK9yCma3IlgdCbI8-3ZV1E5WsKdS3LncHDeqlXThTZ9V7Znc1rATu7kJE_NDxE.Y8gIKpiHqAVypGGOvEXVqw"
      },
      "behaviorHints": {
        "configurable": true,
        "newEpisodeNotifications": true
      }
    }
    return manifest;
  })
}

app.get("/manifest.json", (_req, res) => {
  ReadManifest().then((manif) => {
    res.header("Cache-Control", "max-age=86400, stale-while-revalidate=86400, stale-if-error=259200");
    res.json(manif);
  }).catch((err) => {
    if (!res.headersSent) res.status(500).header("Cache-Control", "no-store").send("Error reading file: " + err);
  });
});

app.get("/configure", (req, res) => {
  ReadManifest().then((manif) => {
    res.render('config', {
      config: undefined,
      manifest: manif
    })
  }).catch((err) => {
    if(!res.headersSent) res.status(500).header("Cache-Control", "no-store").send("Error reading file: " + err) //errors must not be cached by proxies;
  })
})
//WIP
app.get("/:config/configure", (req, res) => {
  ReadManifest().then((manif) => {
    res.render('config', {
      config: new URLSearchParams(decodeURIComponent(req.params.config)),
      manifest: manif
    })
  }).catch((err) => {
    if(!res.headersSent) res.status(500).header("Cache-Control", "no-store").send("Error reading file: " + err) //errors must not be cached by proxies;
  })
})

const streams = require("./routes/streams");
app.use(streams);

const meta = require("./routes/meta");
app.use(meta);


function startLocalServer() {
  const port = process.env.PORT || 3000
  app.listen(port, () => {
  console.log(`\x1b[32mAnimeLatam is listening on port ${port}\x1b[39m`)
  if (process.argv.includes('--launch')) {
    const OSC = '\u001B]';
    const BEL = '\u0007';
    const url = `${OSC}8;;stremio://127.0.0.1:${process.env.PORT || 3000}/manifest.json${BEL}Open this link to install the running addon on the Stremio app${OSC}8;;${BEL}`
    console.log(url)
  } else if (process.argv.includes('--webLaunch')) {
    const url = `http://127.0.0.1:${process.env.PORT || 3000}/manifest.json`
    console.log('Open the following for a developement web Stremio session:', `https://staging.strem.io#?addonOpen=${encodeURIComponent(url)}`)
  }
  const animeAV1API = require('./routes/animeav1.js')
  const henaojaraAPI = require('./routes/henaojara.js')
  const latanimeAPI = require('./routes/latanime.js')
  const imports = [animeAV1API, henaojaraAPI, latanimeAPI]
  const REFRESH = 6 * 3600000 //newly airing shows appear within hours
  //When the code is newer than a saved list (a deploy), that list was built by the old code: refresh it right away
  const codeTime = Promise.all(["routes", "lib"].map((dir) => fsPromises.readdir(dir).then((files) =>
    Promise.all(files.map((f) => fsPromises.stat(`${dir}/${f}`).then((st) => st.mtimeMs)))))).then((times) => Math.max(...times.flat()))
  imports.forEach((api) => {
    //After a plain restart, wait until the saved list is due instead of refreshing every source at once (hundreds
    //of requests on each restart)
    Promise.all([fsPromises.stat(api.AiringCacheFile), codeTime]).then(([file, code]) =>
      (file.mtimeMs < code) ? 0 : Math.max(0, REFRESH - (Date.now() - file.mtimeMs))).catch(() => 0).then((wait) => {
      setTimeout(() => {
        api.UpdateAiringAnimeFile().then(() => setInterval(api.UpdateAiringAnimeFile.bind(api), REFRESH))
      }, wait)
    })
  })
  })
}

// Vercel imports this Express app as a serverless function. Background refresh timers
// are intentionally started only for a persistent local server.
if (require.main === module) startLocalServer()

module.exports = app
