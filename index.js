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
      "catalogs": [
        // {
        //   id: "animeflv", type: "AnimeFLV", name: "search results",
        //   extra: [{ name: "search", isRequired: true },
        //   {
        //     name: "genre",
        //     options: ["accion", "artes-marciales", "aventura", "carreras", "ciencia-ficcion", "comedia",
        //       "demencia", "demonios", "deportes", "drama", "ecchi", "escolares", "espacial", "fantasia",
        //       "harem", "historico", "infantil", "josei", "juegos", "magia", "mecha", "militar", "misterio",
        //       "musica", "parodia", "policia", "psicologico", "recuentos-de-la-vida", "romance", "samurai",
        //       "seinen", "shoujo", "shounen", "sobrenatural", "superpoderes", "suspenso", "terror", "vampiros",
        //       "yaoi", "yuri"],
        //     optionsLimit: 1, isRequired: false
        //   },
        //   { name: "skip", isRequired: false }
        //   ]
        // },
        {
          id: "animeav1", type: "anime", name: "search results",
          extra: [{ name: "search", isRequired: true },
          {
            name: "genre",
            options: ["accion", "artes-marciales", "aventura", "carreras", "ciencia-ficcion", "comedia",
              "demencia", "demonios", "deportes", "drama", "ecchi", "escolares", "espacial", "fantasia",
              "harem", "historico", "infantil", "josei", "juegos", "magia", "mecha", "militar", "misterio",
              "musica", "parodia", "policia", "psicologico", "recuentos-de-la-vida", "romance", "samurai",
              "seinen", "shoujo", "shounen", "sobrenatural", "superpoderes", "suspenso", "terror", "vampiros",
              "yaoi", "yuri"],
            optionsLimit: 1, isRequired: false
          },
          { name: "skip", isRequired: false }
          ]
        },
        {
          id: "henaojara", type: "anime", name: "search results",
          extra: [{ name: "search", isRequired: true },
          {
            name: "genre",
            options: ["accion", "aenime", "anime-latino", "artes-marciales", "aventura", "aventuras", "blu-ray",
              "carreras", "castellano", "ciencia-ficcion", "comedia", "comida", "cyberpunk", "demencia", "dementia",
              "demonios", "deportes", "drama", "ecchi", "escolares", "escuela", "espacial", "fantasia", "gore",
              "harem", "historia-paralela", "historico", "horror", "infantil", "josei", "juegos", "latino", "lucha",
              "magia", "mecha", "militar", "misterio", "monogatari", "musica", "parodia", "parodias", "policia",
              "psicologico", "recuentos-de-la-vida", "recuerdos-de-la-vida", "romance", "samurai", "seinen", "shojo",
              "shonen", "shoujo", "shounen", "shounen-ai", "sobrenatural", "superpoderes", "suspenso", "terror", "vampiros", "yaoi", "yuri"],
            optionsLimit: 1, isRequired: false
          },
          { name: "skip", isRequired: false }
          ]
        },
        {
          id: "latanime", type: "anime", name: "search results",
          extra: [{ name: "search", isRequired: true },
          {
            name: "genre",
            options: ["accion", "aventura", "carreras", "ciencia-ficcion", "comedia", "cyberpunk", "deportes", "drama",
              "ecchi", "escolares", "fantasia", "gore", "harem", "horror", "josei", "lucha", "magia", "mecha", "militar",
              "misterio", "musica", "parodias", "psicologico", "recuerdos-de-la-vida", "seinen", "shojo", "shonen",
              "sobrenatural", "vampiros", "yaoi", "yuri", "latino", "espacial", "historico", "samurai", "artes-marciales",
              "demonios", "romance", "dementia", "policia", "castellano", "historia-paralela", "donghua", "suspenso", "isekai"],
            optionsLimit: 1, isRequired: false
          },
          { name: "skip", isRequired: false }
          ]
        },
        // {
        //   id: "animejara", type: "AnimeJara", name: "search results",
        //   extra: [{ name: "search", isRequired: true },
        //   {
        //     name: "genre",
        //     options: ["Accion", "Amor", "Artes marciales", "Aventura", "Carreras", "Ciencia ficcion",
        //       "Comedia", "Crimen", "Demonios", "Deportes", "Drama", "Ecchi", "Escolar", "Espacial", "Espadachin",
        //       "Familia", "Fantasia", "Gore", "Harem", "Historico", "Isekai", "Josei", "Juegos", "Magia", "Mecha",
        //       "Militar", "Misterio", "Musica", "Parodia", "Psicologico", "Recuerdos", "Robots", "Romance",
        //       "Samurai", "Seinen", "Shoujo", "Shounen", "Sobrenatural", "Studio ghibli", "Superpoderes",
        //       "Suspenso", "Terror", "Vampiros", "Yaoi", "Yuri", "Zombies"
        //     ],
        //     optionsLimit: 1, isRequired: false
        //   },
        //   { name: "skip", isRequired: false }
        //   ]
        // },
        // {
        //   id: "jkanime", type: "JKAnime", name: "search results",
        //   extra: [{ name: "search", isRequired: true },
        //   {
        //     name: "genre",
        //     options: ["accion", "aventura", "autos", "comedia", "dementia", "demonios", "misterio", "drama",
        //       "ecchi", "fantasia", "juegos", "hentai", "historico", "terror", "nios", "magia", "artes-marciales",
        //       "mecha", "musica", "parodia", "samurai", "romance", "colegial", "sci-fi", "shoujo", "shoujo-ai",
        //       "shounen", "shounen-ai", "space", "deportes", "super-poderes", "vampiros", "yaoi", "yuri", "harem",
        //       "cosas-de-la-vida", "sobrenatural", "militar", "policial", "psicologico", "thriller", "seinen", "josei", "latino", "isekai"],
        //     optionsLimit: 1, isRequired: false
        //   },
        //   { name: "skip", isRequired: false }
        //   ]
        // },
        // {
        //   id: "animeflv|genres", type: "anime", name: "AnimeFLV",
        //   extra: [
        //     {
        //       name: "genre",
        //       options: ["accion", "artes-marciales", "aventura", "carreras", "ciencia-ficcion", "comedia",
        //         "demencia", "demonios", "deportes", "drama", "ecchi", "escolares", "espacial", "fantasia",
        //         "harem", "historico", "infantil", "josei", "juegos", "magia", "mecha", "militar", "misterio",
        //         "musica", "parodia", "policia", "psicologico", "recuentos-de-la-vida", "romance", "samurai",
        //         "seinen", "shoujo", "shounen", "sobrenatural", "superpoderes", "suspenso", "terror", "vampiros",
        //         "yaoi", "yuri"],
        //       optionsLimit: 1, isRequired: true
        //     },
        //     { name: "skip", isRequired: false }
        //   ]
        // },
        {
          id: "animeav1|genres", type: "anime", name: "AnimeAV1",
          extra: [
            {
              name: "genre",
              options: ["accion", "artes-marciales", "aventura", "carreras", "ciencia-ficcion", "comedia",
                "demencia", "demonios", "deportes", "drama", "ecchi", "escolares", "espacial", "fantasia",
                "harem", "historico", "infantil", "josei", "juegos", "magia", "mecha", "militar", "misterio",
                "musica", "parodia", "policia", "psicologico", "recuentos-de-la-vida", "romance", "samurai",
                "seinen", "shoujo", "shounen", "sobrenatural", "superpoderes", "suspenso", "terror", "vampiros",
                "yaoi", "yuri"],
              optionsLimit: 1, isRequired: true
            },
            { name: "skip", isRequired: false }
          ]
        },
        {
          id: "henaojara|genres", type: "anime", name: "Henaojara",
          extra: [
            {
              name: "genre",
              options: ["accion", "aenime", "anime-latino", "artes-marciales", "aventura", "aventuras", "blu-ray",
                "carreras", "castellano", "ciencia-ficcion", "comedia", "comida", "cyberpunk", "demencia", "dementia",
                "demonios", "deportes", "drama", "ecchi", "escolares", "escuela", "espacial", "fantasia", "gore",
                "harem", "historia-paralela", "historico", "horror", "infantil", "josei", "juegos", "latino", "lucha",
                "magia", "mecha", "militar", "misterio", "monogatari", "musica", "parodia", "parodias", "policia",
                "psicologico", "recuentos-de-la-vida", "recuerdos-de-la-vida", "romance", "samurai", "seinen", "shojo",
                "shonen", "shoujo", "shounen", "shounen-ai", "sobrenatural", "superpoderes", "suspenso", "terror", "vampiros", "yaoi", "yuri"],
              optionsLimit: 1, isRequired: true
            },
            { name: "skip", isRequired: false }
          ]
        },
        {
          id: "latanime|genres", type: "anime", name: "Latanime",
          extra: [
            {
              name: "genre",
              options: ["accion", "aventura", "carreras", "ciencia-ficcion", "comedia", "cyberpunk", "deportes", "drama",
                "ecchi", "escolares", "fantasia", "gore", "harem", "horror", "josei", "lucha", "magia", "mecha", "militar",
                "misterio", "musica", "parodias", "psicologico", "recuerdos-de-la-vida", "seinen", "shojo", "shonen",
                "sobrenatural", "vampiros", "yaoi", "yuri", "latino", "espacial", "historico", "samurai", "artes-marciales",
                "demonios", "romance", "dementia", "policia", "castellano", "historia-paralela", "donghua", "suspenso", "isekai"],
              optionsLimit: 1, isRequired: true
            },
            { name: "skip", isRequired: false }
          ]
        },
        // {
        //   id: "animejara|genres", type: "anime", name: "AnimeJara",
        //   extra: [
        //     {
        //       name: "genre",
        //       options: ["Accion", "Amor", "Artes marciales", "Aventura", "Carreras", "Ciencia ficcion",
        //         "Comedia", "Crimen", "Demonios", "Deportes", "Drama", "Ecchi", "Escolar", "Espacial", "Espadachin",
        //         "Familia", "Fantasia", "Gore", "Harem", "Historico", "Isekai", "Josei", "Juegos", "Magia", "Mecha",
        //         "Militar", "Misterio", "Musica", "Parodia", "Psicologico", "Recuerdos", "Robots", "Romance",
        //         "Samurai", "Seinen", "Shoujo", "Shounen", "Sobrenatural", "Studio ghibli", "Superpoderes",
        //         "Suspenso", "Terror", "Vampiros", "Yaoi", "Yuri", "Zombies"
        //       ],
        //       optionsLimit: 1, isRequired: true
        //     },
        //     { name: "skip", isRequired: false }
        //   ]
        // },
        // {
        //   id: "jkanime|genres", type: "anime", name: "JKAnime",
        //   extra: [
        //     {
        //       name: "genre",
        //       options: ["accion", "aventura", "autos", "comedia", "dementia", "demonios", "misterio", "drama",
        //         "ecchi", "fantasia", "juegos", "hentai", "historico", "terror", "nios", "magia", "artes-marciales",
        //         "mecha", "musica", "parodia", "samurai", "romance", "colegial", "sci-fi", "shoujo", "shoujo-ai",
        //         "shounen", "shounen-ai", "space", "deportes", "super-poderes", "vampiros", "yaoi", "yuri", "harem",
        //         "cosas-de-la-vida", "sobrenatural", "militar", "policial", "psicologico", "thriller", "seinen", "josei", "latino", "isekai"],
        //       optionsLimit: 1, isRequired: true
        //     },
        //     { name: "skip", isRequired: false }
        //   ]
        // },
        // {
        //   id: "animeflv|onair", type: "AnimeFLV", name: "On Air"
        // },
        {
          id: "animeav1|onair", type: "anime", name: "On Air"
        },
        {
          id: "henaojara|onair", type: "anime", name: "On Air"
        },
        {
          id: "latanime|onair", type: "anime", name: "On Air"
        },
        // {
        //   id: "animejara|onair", type: "AnimeJara", name: "On Air"
        // },
        // {
        //   id: "jkanime|onair", type: "JKAnime", name: "On Air"
        // },
        {
          type: "series",
          id: "calendar-videos",
          extra: [
            {
              name: "calendarVideosIds",
              isRequired: true,
              optionsLimit: 15
            }
          ],
          extraSupported: [
            "calendarVideosIds"
          ],
          extraRequired: [
            "calendarVideosIds"
          ],
          name: "Calendar videos"
        }
      ],
      "resources": [
        "stream",
        { name: 'meta', types: ['movie', 'series', 'anime', 'other'], idPrefixes: [ /*"animeflv:",*/"animeav1:","henaojara:",/*"animejara:",*/ /*"jkanime:",*/"latanime:","anilist:","mal:","anidb:"] },
        "catalog"
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
    manif.catalogs = manif.catalogs.filter((cat) => {
      return (!cat.id.includes("onair")) ? true : false
    })
    res.header('Cache-Control', "max-age=86400, stale-while-revalidate=86400, stale-if-error=259200")
    res.json(manif);
  }).catch((err) => {
    if(!res.headersSent) res.status(500).header("Cache-Control", "no-store").send("Error reading file: " + err) //errors must not be cached by proxies;
  })
})

app.get("/:config/manifest.json", (req, res) => {
  ReadManifest().then((manif) => {
    const config = new URLSearchParams(decodeURIComponent(req.params.config))
    const catalogProviders = config.has("catalogProviders")
      ? config.get("catalogProviders").split(',').filter(Boolean)
      : ["animeav1", "henaojara", "latanime"]
    const onAirProviders = config.get("onAirCatalogs")?.split(',').filter(Boolean) || []
    manif.catalogs = manif.catalogs.filter((cat) => {
      const provider = cat.id.split("|")[0]
      if (["animeav1", "henaojara", "latanime"].includes(provider) && !catalogProviders.includes(provider)) return false
      if (cat.id.includes("onair")) return onAirProviders.includes(provider)
      return true
    })
    res.header('Cache-Control', "max-age=86400, stale-while-revalidate=86400, stale-if-error=259200")
    res.json(manif);
  }).catch((err) => {
    if(!res.headersSent) res.status(500).header("Cache-Control", "no-store").send("Error reading file: " + err) //errors must not be cached by proxies;
  })
})

app.get('/', (req, res) => {
  res.redirect('/configure')
})

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

const catalog = require("./routes/catalog");
app.use(catalog);

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
