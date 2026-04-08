import { createRequire } from "module";

const BASE_URL = "https://www.net-entreprises.fr";
const URSSAF_BASE = "https://www.urssaf.fr";

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DSN-MCP/1.0; +https://github.com/amourer-boop/dsn-mcp)",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "fr-FR,fr;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} pour ${url}`);
  return res.text();
}

function extractText(html: string): string {
  // Supprime les balises HTML, scripts, styles
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
    .replace(/&#39;/g, "'")
    .trim();
}

export async function getActualitesDSN(): Promise<string> {
  try {
    const html = await fetchPage(`${BASE_URL}/tableau-de-bord-dsn/`);
    const text = extractText(html);

    // Extraire les alertes et actualités
    const alertPattern = /(France Travail|URSSAF|Pasrau|TOPAZE|CRM|actualit[eé]|alerte|d[eé]lai|fermeture|ouverture|mise [aà] jour)[^.]{0,300}\./gi;
    const matches = text.match(alertPattern) || [];

    if (matches.length === 0) {
      return "Aucune actualité détectée — vérifiez directement sur https://www.net-entreprises.fr/tableau-de-bord-dsn/";
    }

    return [...new Set(matches)].slice(0, 10).join("\n\n");
  } catch (e: any) {
    return `Erreur lors de la récupération des actualités : ${e.message}`;
  }
}

export async function getNomenclatureCSV(code: string): Promise<string> {
  // Les tables CSV sont accessibles directement
  const csvUrls: Record<string, string> = {
    IDCC: `${BASE_URL}/wp-content/uploads/dsn-tables/IDCC.csv`,
    NAF: `${BASE_URL}/wp-content/uploads/dsn-tables/NAF.csv`,
    PCSESE: `${BASE_URL}/wp-content/uploads/dsn-tables/PCSESE.csv`,
    PAYS: `${BASE_URL}/wp-content/uploads/dsn-tables/PAYS.csv`,
    OPCO: `${BASE_URL}/wp-content/uploads/dsn-tables/OPCO.csv`,
  };

  const url = csvUrls[code.toUpperCase()];
  if (!url) {
    return `Table ${code} non disponible en téléchargement direct. Consultez https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) return `Table ${code} : fichier non accessible (${res.status})`;
    const csv = await res.text();
    // Retourner les 50 premières lignes max pour éviter les réponses trop longues
    const lines = csv.split("\n").slice(0, 51);
    return `Table ${code} (50 premières entrées) :\n\n${lines.join("\n")}`;
  } catch (e: any) {
    return `Erreur téléchargement table ${code} : ${e.message}`;
  }
}

export async function rechercherCahierDesCharges(requete: string): Promise<string> {
  try {
    const query = encodeURIComponent(`DSN ${requete} site:net-entreprises.fr`);
    const html = await fetchPage(`${BASE_URL}/tableau-de-bord-dsn/`);
    const text = extractText(html);

    // Recherche simple dans le texte extrait
    const mots = requete.toLowerCase().split(/\s+/);
    const phrases = text.split(/[.!?]/).filter(p =>
      mots.some(mot => p.toLowerCase().includes(mot))
    );

    if (phrases.length === 0) {
      return `Aucun résultat trouvé pour "${requete}" sur le tableau de bord DSN.\n\nConsultez directement :\n- https://www.net-entreprises.fr/tableau-de-bord-dsn/\n- https://www.urssaf.fr (espace employeur > DSN)`;
    }

    return phrases.slice(0, 5).join(". ").trim();
  } catch (e: any) {
    return `Erreur lors de la recherche : ${e.message}`;
  }
}
