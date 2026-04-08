"use strict";
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { NOMENCLATURES, BLOCS_DSN, CODES_MOTIFS_RUPTURE, CODES_NATURE_CONTRAT } = require("./tools/nomenclature.js");
const { getActualitesDSN, getNomenclatureCSV, rechercherCahierDesCharges } = require("./tools/netentreprises.js");

const server = new McpServer({ name: "dsn-mcp", version: "1.0.0" });

// ─── OUTIL 1 : Recherche générale DSN ───────────────────────────────────────
server.tool(
  "dsn_search",
  "Recherche dans le cahier des charges DSN (Net Entreprises & URSSAF). Pour toute question générale sur la DSN.",
  { requete: z.string().describe("Votre question sur la DSN") },
  async ({ requete }) => {
    const resultat = await rechercherCahierDesCharges(requete);
    return {
      content: [{ type: "text", text: `**Recherche DSN : "${requete}"**\n\n${resultat}\n\n📖 https://www.net-entreprises.fr/tableau-de-bord-dsn/` }],
    };
  }
);

// ─── OUTIL 2 : Tables de nomenclature ───────────────────────────────────────
server.tool(
  "dsn_nomenclature",
  "Consulte les tables de nomenclature DSN : IDCC, NAF, PCSESE, PAYS, OPCO, RAT, BAR, INSEE...",
  {
    code: z.string().describe("Code de la table (ex: IDCC, NAF, PCSESE, PAYS, OPCO)"),
    telecharger: z.boolean().optional().describe("Si true, récupère les données CSV depuis Net Entreprises"),
  },
  async ({ code, telecharger }) => {
    const codeUp = code.toUpperCase();
    const table = NOMENCLATURES[codeUp];
    let reponse = "";
    if (table) {
      reponse += `**Table DSN : ${codeUp}**\n\n📋 ${table.description}\n\n`;
      if (table.exemples) reponse += `💡 Exemples :\n${table.exemples.map(e => `- ${e}`).join("\n")}\n\n`;
      reponse += `🔗 ${table.url}`;
    } else {
      reponse += `Table "${codeUp}" non trouvée.\n\n**Tables disponibles :**\n`;
      reponse += Object.entries(NOMENCLATURES).map(([k, v]) => `- **${k}** : ${v.description.slice(0, 70)}...`).join("\n");
      reponse += `\n\n🔗 https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/`;
    }
    if (telecharger && table) {
      const csv = await getNomenclatureCSV(codeUp);
      reponse += `\n\n---\n📥 Données CSV :\n\`\`\`\n${csv}\n\`\`\``;
    }
    return { content: [{ type: "text", text: reponse }] };
  }
);

// ─── OUTIL 3 : Blocs DSN ────────────────────────────────────────────────────
server.tool(
  "dsn_blocs",
  "Consulte la structure des blocs DSN (S10.G00.xx, S21.G00.xx).",
  { bloc: z.string().optional().describe("Identifiant du bloc (ex: S21.G00.30) ou mot-clé (ex: contrat, salarié)") },
  async ({ bloc }) => {
    if (!bloc) {
      const liste = Object.entries(BLOCS_DSN)
        .map(([id, b]) => `**${id}** — ${b.libelle}${b.obligatoire ? " *(obligatoire)*" : ""}\n  ${b.description.slice(0, 100)}...`)
        .join("\n\n");
      return { content: [{ type: "text", text: `**Blocs DSN (norme P26V01)**\n\n${liste}` }] };
    }
    const cle = bloc.toUpperCase();
    const exact = BLOCS_DSN[cle];
    if (exact) {
      return {
        content: [{
          type: "text",
          text: `**Bloc ${cle} — ${exact.libelle}**${exact.obligatoire ? " *(obligatoire)*" : ""}\n\n${exact.description}\n\n**Rubriques clés :**\n${exact.rubriques_cles.map(r => `  - ${r}`).join("\n")}`,
        }],
      };
    }
    const motCle = bloc.toLowerCase();
    const resultats = Object.entries(BLOCS_DSN).filter(
      ([, b]) => b.libelle.toLowerCase().includes(motCle) || b.description.toLowerCase().includes(motCle) || b.rubriques_cles.some(r => r.toLowerCase().includes(motCle))
    );
    if (resultats.length === 0) return { content: [{ type: "text", text: `Aucun bloc trouvé pour "${bloc}".` }] };
    const texte = resultats.map(([id, b]) => `**${id} — ${b.libelle}**\n${b.description}\n\nRubriques :\n${b.rubriques_cles.map(r => `  - ${r}`).join("\n")}`).join("\n\n---\n\n");
    return { content: [{ type: "text", text: texte }] };
  }
);

// ─── OUTIL 4 : Codes ────────────────────────────────────────────────────────
server.tool(
  "dsn_codes",
  "Codes DSN : motifs de rupture de contrat, nature de contrat.",
  {
    type: z.enum(["motif_rupture", "nature_contrat", "tous"]).describe("Type de codes"),
    valeur: z.string().optional().describe("Code ou libellé à rechercher (ex: 040, CDI, rupture conventionnelle)"),
  },
  async ({ type, valeur }) => {
    const chercher = (table, titre) => {
      if (valeur) {
        const v = valeur.toLowerCase();
        const res = Object.entries(table).filter(([c, l]) => c.includes(v) || l.toLowerCase().includes(v));
        if (res.length === 0) return `Aucun résultat pour "${valeur}" dans ${titre}.\n`;
        return `**${titre}** — "${valeur}" :\n${res.map(([c, l]) => `- **${c}** : ${l}`).join("\n")}\n\n`;
      }
      return `**${titre} :**\n${Object.entries(table).map(([c, l]) => `- **${c}** : ${l}`).join("\n")}\n\n`;
    };
    let reponse = "";
    if (type === "motif_rupture" || type === "tous") reponse += chercher(CODES_MOTIFS_RUPTURE, "Codes motifs de rupture (S21.G00.54.002)");
    if (type === "nature_contrat" || type === "tous") reponse += chercher(CODES_NATURE_CONTRAT, "Codes nature de contrat (S21.G00.30.004)");
    return { content: [{ type: "text", text: reponse.trim() }] };
  }
);

// ─── OUTIL 5 : Échéances ─────────────────────────────────────────────────────
server.tool(
  "dsn_echeances",
  "Échéances de dépôt DSN : dates limites, PASRAU, signalements événementiels.",
  {},
  async () => ({
    content: [{
      type: "text",
      text: `**Échéances DSN (norme P26V01)**

| Entreprise | Date limite |
|---|---|
| 50 salariés et + | **5 du mois M+1** |
| Moins de 50 salariés | **15 du mois M+1** |
| Décalage de paie | 5 ou 15 selon effectif |

**PASRAU :** 8 du mois M+1 (EDI/API uniquement)

**TOPAZE fermé depuis 2026** → taux PAS via signalement d'initialisation DSN

**Signalements événementiels :**
- Arrêt de travail : 5 jours ouvrés après début
- Reprise : 5 jours ouvrés après reprise
- Fin de contrat : avant/lors de la DSN mensuelle suivante`,
    }],
  })
);

// ─── OUTIL 6 : Actualités ───────────────────────────────────────────────────
server.tool(
  "dsn_actualites",
  "Dernières actualités DSN depuis Net Entreprises (temps réel).",
  {},
  async () => {
    const actualites = await getActualitesDSN();
    return { content: [{ type: "text", text: `**Actualités DSN — Net Entreprises**\n\n${actualites}\n\n🔗 https://www.net-entreprises.fr/tableau-de-bord-dsn/` }] };
  }
);

// ─── OUTIL 7 : Debug ────────────────────────────────────────────────────────
server.tool(
  "dsn_debug",
  "Vérifie que le serveur DSN MCP est opérationnel.",
  {},
  async () => ({
    content: [{ type: "text", text: "**DSN MCP opérationnel** ✅\nNorme P26V01 — Sources : Net Entreprises + URSSAF\nOutils : dsn_search · dsn_nomenclature · dsn_blocs · dsn_codes · dsn_echeances · dsn_actualites · dsn_debug" }],
  })
);

// ─── Démarrage stdio ─────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
