import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import {
  NOMENCLATURES,
  BLOCS_DSN,
  CODES_MOTIFS_RUPTURE,
  CODES_NATURE_CONTRAT,
} from "./tools/nomenclature.js";
import {
  getActualitesDSN,
  getNomenclatureCSV,
  rechercherCahierDesCharges,
} from "./tools/netentreprises.js";

const app = express();
app.use(express.json());

function createServer(): McpServer {
  const server = new McpServer({
    name: "dsn-mcp",
    version: "1.0.0",
  });

  // ─── OUTIL 1 : Recherche générale DSN ───────────────────────────────────────
  server.tool(
    "dsn_search",
    "Recherche dans le cahier des charges DSN et les ressources Net Entreprises / URSSAF. Utilisez cet outil pour toute question générale sur la DSN.",
    {
      requete: z.string().describe("Votre question ou terme de recherche sur la DSN"),
    },
    async ({ requete }) => {
      const resultat = await rechercherCahierDesCharges(requete);
      return {
        content: [
          {
            type: "text",
            text: `**Recherche DSN : "${requete}"**\n\n${resultat}\n\n---\n📖 Sources de référence :\n- https://www.net-entreprises.fr/tableau-de-bord-dsn/\n- https://www.urssaf.fr (espace employeur > DSN)`,
          },
        ],
      };
    }
  );

  // ─── OUTIL 2 : Tables de nomenclature ───────────────────────────────────────
  server.tool(
    "dsn_nomenclature",
    "Consulte les tables de nomenclature DSN : IDCC (convention collective), NAF, PCSESE (catégorie sociopro), PAYS, OPCO, RAT, BAR, etc.",
    {
      code: z.string().describe("Code de la table (ex: IDCC, NAF, PCSESE, PAYS, OPCO, RAT, BAR)"),
      telecharger: z.boolean().optional().describe("Si true, tente de récupérer les données CSV depuis Net Entreprises"),
    },
    async ({ code, telecharger }) => {
      const codeUp = code.toUpperCase();
      const table = NOMENCLATURES[codeUp];

      let reponse = "";

      if (table) {
        reponse += `**Table de nomenclature DSN : ${codeUp}**\n\n`;
        reponse += `📋 **Description :** ${table.description}\n\n`;
        if (table.exemples) {
          reponse += `💡 **Exemples :**\n${table.exemples.map(e => `- ${e}`).join("\n")}\n\n`;
        }
        reponse += `🔗 **Source :** ${table.url}\n`;
      } else {
        // Liste des tables disponibles
        reponse += `Table "${codeUp}" non trouvée dans la base locale.\n\n`;
        reponse += `**Tables disponibles :**\n`;
        reponse += Object.entries(NOMENCLATURES)
          .map(([k, v]) => `- **${k}** : ${v.description.slice(0, 80)}...`)
          .join("\n");
        reponse += `\n\n🔗 Toutes les tables CSV : https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/`;
      }

      if (telecharger && table) {
        const csv = await getNomenclatureCSV(codeUp);
        reponse += `\n\n---\n📥 **Données CSV :**\n\`\`\`\n${csv}\n\`\`\``;
      }

      return { content: [{ type: "text", text: reponse }] };
    }
  );

  // ─── OUTIL 3 : Blocs DSN ────────────────────────────────────────────────────
  server.tool(
    "dsn_blocs",
    "Consulte la structure des blocs DSN (S10.G00.xx, S21.G00.xx). Permet de comprendre l'organisation des données dans un fichier DSN.",
    {
      bloc: z.string().optional().describe("Identifiant du bloc (ex: S21.G00.30) ou mot-clé (ex: 'contrat', 'salarié', 'rémunération')"),
    },
    async ({ bloc }) => {
      if (!bloc) {
        // Lister tous les blocs
        const liste = Object.entries(BLOCS_DSN)
          .map(([id, b]) => `**${id}** — ${b.libelle}${b.obligatoire ? " *(obligatoire)*" : ""}\n  ${b.description.slice(0, 100)}...`)
          .join("\n\n");
        return {
          content: [
            {
              type: "text",
              text: `**Structure des blocs DSN (norme P26V01)**\n\n${liste}\n\n🔗 Cahier des charges complet : https://www.net-entreprises.fr/tableau-de-bord-dsn/`,
            },
          ],
        };
      }

      // Recherche par identifiant exact ou mot-clé
      const cle = bloc.toUpperCase();
      const exact = BLOCS_DSN[cle];

      if (exact) {
        const rubriques = exact.rubriques_cles.map(r => `  - ${r}`).join("\n");
        return {
          content: [
            {
              type: "text",
              text: `**Bloc DSN : ${cle}**\n📌 ${exact.libelle}${exact.obligatoire ? " *(obligatoire)*" : " *(facultatif)*"}\n\n${exact.description}\n\n**Rubriques clés :**\n${rubriques}\n\n🔗 https://www.net-entreprises.fr/tableau-de-bord-dsn/`,
            },
          ],
        };
      }

      // Recherche par mot-clé
      const motCle = bloc.toLowerCase();
      const resultats = Object.entries(BLOCS_DSN).filter(
        ([id, b]) =>
          b.libelle.toLowerCase().includes(motCle) ||
          b.description.toLowerCase().includes(motCle) ||
          b.rubriques_cles.some(r => r.toLowerCase().includes(motCle))
      );

      if (resultats.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `Aucun bloc trouvé pour "${bloc}".\n\nAppellez dsn_blocs sans paramètre pour voir tous les blocs disponibles.`,
            },
          ],
        };
      }

      const texte = resultats
        .map(([id, b]) => {
          const rubriques = b.rubriques_cles.map(r => `  - ${r}`).join("\n");
          return `**${id} — ${b.libelle}**${b.obligatoire ? " *(obligatoire)*" : ""}\n${b.description}\n\n**Rubriques clés :**\n${rubriques}`;
        })
        .join("\n\n---\n\n");

      return { content: [{ type: "text", text: texte }] };
    }
  );

  // ─── OUTIL 4 : Codes motifs et nature contrat ────────────────────────────────
  server.tool(
    "dsn_codes",
    "Consulte les codes DSN : motifs de rupture de contrat, nature de contrat, et autres codes fréquemment utilisés en DSN.",
    {
      type: z.enum(["motif_rupture", "nature_contrat", "tous"]).describe("Type de codes à consulter"),
      valeur: z.string().optional().describe("Code ou libellé à rechercher (ex: '040', 'CDI', 'rupture conventionnelle')"),
    },
    async ({ type, valeur }) => {
      let reponse = "";

      const chercher = (table: Record<string, string>, titre: string) => {
        if (valeur) {
          const v = valeur.toLowerCase();
          const resultats = Object.entries(table).filter(
            ([code, lib]) => code.includes(v) || lib.toLowerCase().includes(v)
          );
          if (resultats.length === 0) return `Aucun résultat pour "${valeur}" dans ${titre}.\n`;
          return `**${titre}** — résultats pour "${valeur}" :\n${resultats.map(([c, l]) => `- **${c}** : ${l}`).join("\n")}\n\n`;
        }
        return `**${titre} :**\n${Object.entries(table).map(([c, l]) => `- **${c}** : ${l}`).join("\n")}\n\n`;
      };

      if (type === "motif_rupture" || type === "tous") {
        reponse += chercher(CODES_MOTIFS_RUPTURE, "Codes motifs de rupture (S21.G00.54.002)");
      }
      if (type === "nature_contrat" || type === "tous") {
        reponse += chercher(CODES_NATURE_CONTRAT, "Codes nature de contrat (S21.G00.30.004)");
      }

      return { content: [{ type: "text", text: reponse.trim() }] };
    }
  );

  // ─── OUTIL 5 : Échéances DSN ─────────────────────────────────────────────────
  server.tool(
    "dsn_echeances",
    "Informations sur les échéances de dépôt DSN : dates limites selon l'effectif, cas particuliers, PASRAU.",
    {},
    async () => {
      const texte = `**Échéances DSN (norme P26V01)**

## Règle générale

| Type d'entreprise | Date limite de dépôt |
|---|---|
| Entreprises de **50 salariés et plus** | **5 du mois M+1** (sur salaires du mois M) |
| Entreprises de **moins de 50 salariés** | **15 du mois M+1** |
| Entreprises à **décalage de paie** | Le 5 ou le 15 selon effectif, mois suivant le versement |

## PASRAU (secteur public)
- Dépôt le **8 du mois M+1**
- Mode EDI ou API uniquement (depuis 2025)

## Points d'attention
- **TOPAZE fermé depuis début 2026** → le taux PAS est appelé via le signalement d'initialisation DSN
- En cas de **retard**, une DSN hors délai reste recevable mais peut générer des pénalités URSSAF
- La **DSN néant** est obligatoire même si aucun salarié n'a été payé dans le mois

## Mois principal déclaré (MPD)
Format MMAAAA dans la rubrique S10.G00.00.002
- Mois de rattachement des cotisations, pas nécessairement le mois de dépôt

## Signalements événementiels (hors délai mensuel)
| Événement | Délai |
|---|---|
| Arrêt de travail | **5 jours ouvrés** après le début de l'arrêt |
| Reprise de travail | **5 jours ouvrés** après la reprise |
| Fin de contrat | Avant ou lors de la DSN mensuelle du mois suivant |

🔗 https://www.net-entreprises.fr/tableau-de-bord-dsn/
🔗 https://www.urssaf.fr (espace employeur > DSN)`;

      return { content: [{ type: "text", text: texte }] };
    }
  );

  // ─── OUTIL 6 : Actualités Net Entreprises ───────────────────────────────────
  server.tool(
    "dsn_actualites",
    "Récupère les dernières actualités et alertes DSN directement depuis Net Entreprises.",
    {},
    async () => {
      const actualites = await getActualitesDSN();
      return {
        content: [
          {
            type: "text",
            text: `**Actualités DSN — Net Entreprises**\n\n${actualites}\n\n🔗 https://www.net-entreprises.fr/tableau-de-bord-dsn/`,
          },
        ],
      };
    }
  );

  // ─── OUTIL 7 : Debug ────────────────────────────────────────────────────────
  server.tool(
    "dsn_debug",
    "Vérifie l'état du serveur DSN MCP et liste les outils disponibles.",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `**DSN MCP — Serveur opérationnel**\n\nVersion norme : P26V01\nSources : Net Entreprises + URSSAF.fr\n\n**Outils disponibles :**\n- dsn_search — Recherche générale\n- dsn_nomenclature — Tables IDCC, NAF, PCSESE, PAYS, OPCO...\n- dsn_blocs — Structure des blocs S10/S21\n- dsn_codes — Codes motifs rupture / nature contrat\n- dsn_echeances — Calendrier de dépôt\n- dsn_actualites — Alertes Net Entreprises en temps réel\n- dsn_debug — Ce message`,
          },
        ],
      };
    }
  );

  return server;
}

// ─── Route MCP (stateless, une session par requête) ─────────────────────────
app.post("/mcp", async (req, res) => {
  const apiKey = process.env.API_KEY;
  if (apiKey) {
    const provided = req.headers["x-api-key"] || req.query.api_key;
    if (provided !== apiKey) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  }

  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
  });

  res.on("close", () => transport.close());

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("Erreur MCP:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.get("/mcp", async (req, res) => {
  res.status(405).json({ error: "Utiliser POST pour les requêtes MCP" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "dsn-mcp", norme: "P26V01" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`DSN MCP server démarré sur le port ${PORT}`);
});
