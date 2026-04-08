export const NOMENCLATURES: Record<string, { description: string; url: string; exemples?: string[] }> = {
  IDCC: {
    description: "Code de convention collective (Identifiant De Convention Collective). Permet d'identifier la convention collective applicable à l'établissement ou au salarié.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
    exemples: ["0016 = Convention collective nationale de la métallurgie", "0573 = Bâtiment", "1518 = Cabinets d'avocats"],
  },
  NAF: {
    description: "Code NAF (Nomenclature des Activités Françaises) de l'entreprise ou de l'établissement. Code INSEE sur 5 caractères (4 chiffres + 1 lettre).",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
    exemples: ["6910Z = Activités juridiques", "6920Z = Activités comptables", "8299Z = Autres activités de soutien aux entreprises NCA"],
  },
  PCSESE: {
    description: "Code de catégorie socioprofessionnelle (PCS-ESE). Obligatoire pour chaque salarié dans la DSN.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
    exemples: ["382 = Cadres administratifs et commerciaux d'entreprise", "431 = Employés de la comptabilité", "523 = Employés des services directs aux particuliers"],
  },
  PAYS: {
    description: "Code pays de naissance du salarié. Utilise la nomenclature INSEE des pays et territoires étrangers.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
    exemples: ["99100 = France", "99109 = Espagne", "99132 = Maroc"],
  },
  PAY: {
    description: "Code pays (format ISO 3166-1 alpha-2 ou nomenclature INSEE). Utilisé pour l'adresse de l'employeur ou du salarié.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
    exemples: ["FR = France", "BE = Belgique", "DE = Allemagne"],
  },
  OPCO: {
    description: "Code de l'Opérateur de Compétences (OPCO). Obligatoire depuis la réforme de la formation professionnelle.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
    exemples: ["1 = ATLAS", "2 = AFDAS", "10 = CONSTRUCTYS (BTP)"],
  },
  RAT: {
    description: "Code risque AT/MP (Accidents du Travail / Maladies Professionnelles). Taux de cotisation ATMP par activité.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
  },
  BAR: {
    description: "Barèmes de taux non personnalisés pour le Prélèvement À la Source (PAS). Utilisé quand le taux individualisé n'est pas disponible.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
  },
  HEX: {
    description: "Codes postaux français. Table de référence pour les adresses.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
  },
  INSEE: {
    description: "Codes INSEE des communes françaises. Utilisé pour le lieu de travail ou de naissance.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
  },
  IVO: {
    description: "Identifiant d'organisme de protection sociale - versement organisme. Identifie l'organisme destinataire des cotisations.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
  },
  ICI: {
    description: "Identifiant d'organisme de protection sociale - contributions individuelles. Organisme gérant les cotisations individuelles du salarié.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
  },
  IBCI: {
    description: "Identifiant d'organisme de protection sociale - bordereau de cotisations individuel.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
  },
  DLGPREV: {
    description: "Code délégation de gestion prévoyance. Identifie l'organisme délégataire de la gestion prévoyance.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
  },
  DLGMUT: {
    description: "Code délégation de gestion mutuelle santé.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
  },
};

export const BLOCS_DSN: Record<string, { libelle: string; description: string; rubriques_cles: string[]; obligatoire: boolean }> = {
  "S10.G00.00": {
    libelle: "Déclaration",
    description: "En-tête de la DSN. Contient les informations d'identification de la déclaration elle-même : type, mois principal déclaré, version du cahier des charges.",
    rubriques_cles: ["S10.G00.00.001 = Type de déclaration", "S10.G00.00.002 = Mois principal déclaré (MMAAAA)", "S10.G00.00.003 = Nature de la déclaration"],
    obligatoire: true,
  },
  "S10.G00.01": {
    libelle: "Emetteur",
    description: "Identifie l'émetteur de la DSN : entreprise ou tiers déclarant (cabinet de paie, expert-comptable).",
    rubriques_cles: ["S10.G00.01.001 = SIRET émetteur", "S10.G00.01.002 = Civilité", "S10.G00.01.003 = Nom", "S10.G00.01.004 = Prénom"],
    obligatoire: true,
  },
  "S10.G00.02": {
    libelle: "Contact",
    description: "Coordonnées du contact technique ou fonctionnel pour la déclaration.",
    rubriques_cles: ["S10.G00.02.001 = Nom du contact", "S10.G00.02.002 = Prénom", "S10.G00.02.003 = Téléphone", "S10.G00.02.004 = Courriel"],
    obligatoire: false,
  },
  "S21.G00.06": {
    libelle: "Etablissement",
    description: "Identification de l'établissement déclarant. Un fichier DSN peut contenir plusieurs établissements.",
    rubriques_cles: ["S21.G00.06.001 = SIRET", "S21.G00.06.002 = Enseigne", "S21.G00.06.003 = Adresse", "S21.G00.06.004 = Code NAF", "S21.G00.06.005 = Code IDCC"],
    obligatoire: true,
  },
  "S21.G00.11": {
    libelle: "Individu (salarié)",
    description: "Données d'identification du salarié : NIR, état civil, coordonnées. Un bloc par salarié.",
    rubriques_cles: ["S21.G00.11.001 = NIR", "S21.G00.11.002 = NTT (si NIR provisoire)", "S21.G00.11.003 = Nom de famille", "S21.G00.11.004 = Nom d'usage", "S21.G00.11.005 = Prénoms", "S21.G00.11.006 = Sexe", "S21.G00.11.007 = Date de naissance"],
    obligatoire: true,
  },
  "S21.G00.30": {
    libelle: "Contrat",
    description: "Informations contractuelles du salarié : type de contrat, convention collective, nature d'emploi.",
    rubriques_cles: ["S21.G00.30.001 = Date début contrat", "S21.G00.30.004 = Code nature du contrat", "S21.G00.30.006 = Code IDCC", "S21.G00.30.007 = Code PCS-ESE", "S21.G00.30.013 = Code régime retraite complémentaire"],
    obligatoire: true,
  },
  "S21.G00.40": {
    libelle: "Activité",
    description: "Période d'activité du salarié sur le mois déclaré : présence, absences, heures travaillées.",
    rubriques_cles: ["S21.G00.40.001 = Date début période de paie", "S21.G00.40.002 = Date fin période de paie", "S21.G00.40.007 = Nombre d'heures travaillées", "S21.G00.40.010 = Taux de travail à temps partiel"],
    obligatoire: true,
  },
  "S21.G00.50": {
    libelle: "Rémunération",
    description: "Détail des éléments de rémunération versés au salarié. Un bloc par nature de rémunération.",
    rubriques_cles: ["S21.G00.50.001 = Date de début de période", "S21.G00.50.002 = Date de fin de période", "S21.G00.50.003 = Type de rémunération", "S21.G00.50.004 = Montant"],
    obligatoire: true,
  },
  "S21.G00.51": {
    libelle: "Prime et gratification",
    description: "Primes et gratifications versées au salarié en dehors du salaire mensuel.",
    rubriques_cles: ["S21.G00.51.001 = Type", "S21.G00.51.002 = Période de rattachement début", "S21.G00.51.003 = Période de rattachement fin", "S21.G00.51.004 = Montant"],
    obligatoire: false,
  },
  "S21.G00.53": {
    libelle: "Arrêt de travail",
    description: "Signalement d'un arrêt de travail (maladie, AT, maternité...). Remplace les attestations papier.",
    rubriques_cles: ["S21.G00.53.001 = Date de début", "S21.G00.53.002 = Date de fin prévisionnelle", "S21.G00.53.003 = Code motif", "S21.G00.53.013 = Subrogation (O/N)"],
    obligatoire: false,
  },
  "S21.G00.54": {
    libelle: "Fin de contrat",
    description: "Signalement de fin de contrat de travail. Alimente le dossier France Travail (ex-Pôle emploi).",
    rubriques_cles: ["S21.G00.54.001 = Date de fin", "S21.G00.54.002 = Code motif rupture", "S21.G00.54.010 = Salaire de référence", "S21.G00.54.012 = Préavis (O/N)"],
    obligatoire: false,
  },
  "S21.G00.65": {
    libelle: "Versement individu",
    description: "Cotisations et contributions individuelles déclarées par salarié.",
    rubriques_cles: ["S21.G00.65.001 = Code organisme", "S21.G00.65.002 = Identifiant technique", "S21.G00.65.004 = Montant total versé"],
    obligatoire: true,
  },
  "S21.G00.78": {
    libelle: "Montant Net Social (MNS)",
    description: "Montant net social à déclarer depuis janvier 2024 (MPD). Sert au calcul du RSA et de la prime d'activité.",
    rubriques_cles: ["S21.G00.78.001 = Montant net social", "S21.G00.78.002 = Période de début", "S21.G00.78.003 = Période de fin"],
    obligatoire: true,
  },
};

export const CODES_MOTIFS_RUPTURE: Record<string, string> = {
  "010": "Démission",
  "020": "Licenciement pour motif personnel",
  "025": "Licenciement pour motif économique",
  "026": "Licenciement pour inaptitude",
  "030": "Fin de CDD — terme échu",
  "032": "Rupture anticipée CDD à l'initiative de l'employeur",
  "033": "Rupture anticipée CDD à l'initiative du salarié",
  "034": "Rupture anticipée CDD d'un commun accord",
  "040": "Rupture conventionnelle individuelle",
  "043": "Rupture conventionnelle collective",
  "058": "Départ volontaire à la retraite",
  "059": "Mise à la retraite par l'employeur",
  "089": "Décès du salarié",
  "091": "Fin de mission intérim",
  "999": "Autre",
};

export const CODES_NATURE_CONTRAT: Record<string, string> = {
  "01": "CDI",
  "02": "CDD",
  "03": "CTT (contrat de travail temporaire / intérim)",
  "07": "Contrat d'apprentissage",
  "08": "Contrat de professionnalisation",
  "10": "Contrat intermittent",
  "20": "Contrat aidé",
  "29": "Mandat social",
  "32": "Stage (hors convention)",
  "50": "Contrat à durée indéterminée — relations particulières",
  "60": "Contrat de travail à durée déterminée — relations particulières",
  "80": "Portage salarial",
  "82": "VRP à carte unique",
  "89": "Autre nature de contrat",
  "90": "Convention de stage (stagiaire)",
  "91": "Contrat de génération",
  "92": "Contrat de sécurisation professionnelle",
};
