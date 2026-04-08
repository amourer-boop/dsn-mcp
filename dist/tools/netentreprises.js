"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rechercherCahierDesCharges = exports.getNomenclatureCSV = exports.getActualitesDSN = void 0;

const BASE_URL = "https://www.net-entreprises.fr";

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DSN-MCP/1.0)",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "fr-FR,fr;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} pour ${url}`);
  return res.text();
}

function extractText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

async function getActualitesDSN() {
  try {
    const html = await fetchPage(`${BASE_URL}/tableau-de-bord-dsn/`);
    const text = extractText(html);
    const alertPattern = /(France Travail|URSSAF|Pasrau|TOPAZE|CRM|actualit[eé]|alerte|d[eé]lai|fermeture|ouverture|mise [aà] jour)[^.]{0,300}\./gi;
    const matches = text.match(alertPattern) || [];
    if (matches.length === 0) {
      return "Aucune actualité détectée — consultez https://www.net-entreprises.fr/tableau-de-bord-dsn/";
    }
    return [...new Set(matches)].slice(0, 8).join("\n\n");
  } catch (e) {
    return `Erreur lors de la récupération des actualités : ${e.message}`;
  }
}
exports.getActualitesDSN = getActualitesDSN;

async function getNomenclatureCSV(code) {
  const csvUrls = {
    IDCC: `${BASE_URL}/wp-content/uploads/dsn-tables/IDCC.csv`,
    NAF: `${BASE_URL}/wp-content/uploads/dsn-tables/NAF.csv`,
    PCSESE: `${BASE_URL}/wp-content/uploads/dsn-tables/PCSESE.csv`,
  };
  const url = csvUrls[code.toUpperCase()];
  if (!url) return `Table ${code} — consultez https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/`;
  try {
    const res = await fetch(url);
    if (!res.ok) return `Table ${code} : fichier non accessible (${res.status})`;
    const csv = await res.text();
    return `Table ${code} (50 premières lignes) :\n\n${csv.split("\n").slice(0, 51).join("\n")}`;
  } catch (e) {
    return `Erreur téléchargement table ${code} : ${e.message}`;
  }
}
exports.getNomenclatureCSV = getNomenclatureCSV;

async function rechercherCahierDesCharges(requete) {
  try {
    const html = await fetchPage(`${BASE_URL}/tableau-de-bord-dsn/`);
    const text = extractText(html);
    const mots = requete.toLowerCase().split(/\s+/);
    const phrases = text.split(/[.!?]/).filter(p => mots.some(mot => p.toLowerCase().includes(mot)));
    if (phrases.length === 0) {
      return `Aucun résultat pour "${requete}".\nConsultez : https://www.net-entreprises.fr/tableau-de-bord-dsn/`;
    }
    return phrases.slice(0, 5).join(". ").trim();
  } catch (e) {
    return `Erreur lors de la recherche : ${e.message}`;
  }
}
exports.rechercherCahierDesCharges = rechercherCahierDesCharges;
