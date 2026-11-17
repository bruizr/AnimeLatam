const fuzzysort = require("fuzzysort");
const animeAV1API = require("./animeav1.js");
const henaojaraAPI = require("./henaojara.js");
const latanimeAPI = require("./latanime.js");

const MAL_API = "https://api.myanimelist.net/v2";
const TVDB_API = "https://api4.thetvdb.com/v4";
const CACHE_TTL = 3 * 60 * 60 * 1000;
let memoryCache;
let memoryCacheAt = 0;
let tvdbToken;
let tvdbTokenExpiresAt = 0;

function getCurrentSeason() {
  const month = new Date().getUTCMonth() + 1;
  const season = month <= 3 ? "winter" : month <= 6 ? "spring" : month <= 9 ? "summer" : "fall";
  return { year: new Date().getUTCFullYear(), season };
}

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error("HTTP " + response.status + " requesting " + url);
  return response.json();
}

function normalizeTitle(value) {
  return String(value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(latino|latina|castellano|espanol|sub esp|sub español|doblado)\b/g, " ")
    .replace(/\b(temporada|season|parte|part|episodio|episode|capitulo|cap)\s*\d+\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function titleMatches(a, b) {
  const left = normalizeTitle(a);
  const right = normalizeTitle(b);
  if (!left || !right) return false;
  if (left === right) return true;
  const tokensA = new Set(left.split(" "));
  const tokensB = new Set(right.split(" "));
  const common = [...tokensA].filter((token) => tokensB.has(token)).length;
  return common / Math.max(tokensA.size, tokensB.size) >= 0.72;
}

function getMalNames(node) {
  const alternatives = node.alternative_titles || {};
  return [node.title, alternatives.en, alternatives.ja, ...(alternatives.synonyms || [])].filter(Boolean);
}

async function getMALSeason() {
  const clientId = process.env.MAL_CLIENT_ID;
  if (!clientId) throw new Error("Missing MAL_CLIENT_ID environment variable");
  const current = getCurrentSeason();
  const url = new URL(MAL_API + "/anime/season/" + current.year + "/" + current.season);
  url.searchParams.set("sort", "anime_num_list_users");
  url.searchParams.set("limit", "500");
  url.searchParams.set("fields", "alternative_titles,start_date,end_date,synopsis,mean,num_episodes,status,genres,media_type");
  const response = await fetchJSON(url, { headers: { "X-MAL-CLIENT-ID": clientId, "Accept": "application/json" } });
  return (response.data || []).map((entry) => entry.node || entry)
    .filter((node) => node && node.id && node.media_type === "tv" && (!node.status || node.status === "currently_airing"));
}

async function getTVDBToken() {
  if (tvdbToken && Date.now() < tvdbTokenExpiresAt) return tvdbToken;
  const apiKey = process.env.TVDB_API_KEY;
  if (!apiKey) throw new Error("Missing TVDB_API_KEY environment variable");
  const payload = { apikey: apiKey };
  if (process.env.TVDB_PIN) payload.pin = process.env.TVDB_PIN;
  const response = await fetchJSON(TVDB_API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response || !response.data || !response.data.token) throw new Error("TVDB authentication did not return a token");
  tvdbToken = response.data.token;
  tvdbTokenExpiresAt = Date.now() + 28 * 24 * 60 * 60 * 1000;
  return tvdbToken;
}

async function searchTVDB(node) {
  const token = await getTVDBToken();
  const url = new URL(TVDB_API + "/search");
  url.searchParams.set("query", node.title);
  url.searchParams.set("type", "series");
  const year = node.start_date ? node.start_date.slice(0, 4) : "";
  if (/^\d{4}$/.test(year)) url.searchParams.set("year", year);
  const response = await fetchJSON(url, { headers: { "Authorization": "Bearer " + token, "Accept": "application/json" } });
  const results = response.data || [];
  const names = getMalNames(node);
  return results.find((result) => names.some((name) => titleMatches(name, result.name))) || null;
}

async function mapWithLimit(items, limit, mapper) {
  const output = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      try { output[index] = await mapper(items[index], index); }
      catch (error) {
        console.warn("Latino airing item enrichment failed:", error.message);
        output[index] = null;
      }
    }
  });
  await Promise.all(workers);
  return output.filter(Boolean);
}

async function getVerifiedSourceTitles() {
  const results = await Promise.allSettled([
    animeAV1API.GetAiringAnime(),
    henaojaraAPI.GetAiringAnime(),
    latanimeAPI.GetAiringAnime()
  ]);
  const sourceTitles = [];
  const labels = ["animeav1", "henaojara", "latanime"];
  results.forEach((result, index) => {
    if (result.status !== "fulfilled" || !Array.isArray(result.value)) {
      if (result.status === "rejected") console.warn("Airing source " + labels[index] + " unavailable:", result.reason && result.reason.message || result.reason);
      return;
    }
    result.value.forEach((anime) => {
      if (!anime || !anime.slug || !anime.title) return;
      sourceTitles.push({ ...anime, id: labels[index] + ":" + anime.slug, provider: labels[index] });
    });
  });
  return sourceTitles;
}

function findSourceForMalAnime(node, sourceTitles) {
  const names = getMalNames(node);
  for (const name of names) {
    const exact = sourceTitles.find((source) => titleMatches(name, source.title));
    if (exact) return exact;
  }
  for (const name of names) {
    const result = fuzzysort.go(name, sourceTitles, { key: "title", limit: 1, threshold: 0.35 })[0];
    if (result && result.obj && titleMatches(name, result.obj.title)) return result.obj;
  }
  return null;
}

async function buildCatalog() {
  if (!process.env.MAL_CLIENT_ID || !process.env.TVDB_API_KEY) {
    throw new Error("Configure MAL_CLIENT_ID and TVDB_API_KEY in Vercel to enable the Latino airing catalog");
  }
  const [malTitles, sourceTitles] = await Promise.all([getMALSeason(), getVerifiedSourceTitles()]);
  if (!malTitles.length || !sourceTitles.length) return [];
  const matched = malTitles.map((node) => ({ node, source: findSourceForMalAnime(node, sourceTitles) })).filter((entry) => entry.source);
  return mapWithLimit(matched, 3, async ({ node, source }) => {
    let tvdb = null;
    try { tvdb = await searchTVDB(node); }
    catch (error) { console.warn("TVDB lookup failed for " + node.title + ":", error.message); }
    return {
      id: "mal:" + node.id,
      type: "anime",
      name: node.title || source.title,
      poster: (tvdb && tvdb.image_url) || (node.main_picture && (node.main_picture.large || node.main_picture.medium)) || source.poster,
      description: (tvdb && tvdb.overview) || node.synopsis || source.overview,
      genres: (node.genres || []).map((genre) => genre.name).filter(Boolean),
      releaseInfo: node.start_date ? node.start_date.slice(0, 4) : undefined
    };
  });
}

exports.GetLatinoAiringAnime = async function () {
  if (memoryCache && Date.now() - memoryCacheAt < CACHE_TTL) return memoryCache;
  memoryCache = await buildCatalog();
  memoryCacheAt = Date.now();
  return memoryCache;
};
