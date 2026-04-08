"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CODES_NATURE_CONTRAT = exports.CODES_MOTIFS_RUPTURE = exports.BLOCS_DSN = exports.NOMENCLATURES = void 0;

exports.NOMENCLATURES = {
  IDCC: {
    description: "Code de convention collective (Identifiant De Convention Collective). Identifie la convention collective applicable.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
    exemples: ["0016 = Convention collective nationale de la métallurgie", "0573 = Bâtiment", "1518 = Cabinets d'avocats"],
  },
  NAF: {
    description: "Code NAF (Nomenclature des Activités Françaises). Code INSEE sur 5 caractères (4 chiffres + 1 lettre).",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
    exemples: ["6910Z = Activités juridiques", "6920Z = Activités comptables"],
  },
  PCSESE: {
    description: "Code de catégorie socioprofessionnelle (PCS-ESE). Obligatoire pour chaque salarié dans la DSN.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
    exemples: ["382 = Cadres administratifs et commerciaux d'entreprise", "431 = Employés de la comptabilité"],
  },
  PAYS: {
    description: "Code pays de naissance du salarié. Nomenclature INSEE des pays et territoires étrangers.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
    exemples: ["99100 = France", "99109 = Espagne", "99132 = Maroc"],
  },
  PAY: {
    description: "Code pays (ISO 3166-1 alpha-2). Utilisé pour les adresses.",
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
    description: "Barèmes de taux non personnalisés pour le Prélèvement À la Source (PAS).",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
  },
  INSEE: {
    description: "Codes INSEE des communes françaises. Utilisé pour le lieu de travail ou de naissance.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
  },
  IVO: {
    description: "Identifiant d'organisme de protection sociale - versement organisme.",
    url: "https://www.net-entreprises.fr/declaration/tables-de-nomenclatures/",
  },
};

exports.BLOCS_DSN = {
  "S10.G00.00": {
    libelle: "Déclaration",
    description: "En-tête de la DSN. Contient les informations d'identification de la déclaration : type, mois principal déclaré, version du cahier des charges.",
    rubriques_cles: ["S10.G00.00.001 = Type de déclaration", "S10.G00.00.002 = Mois principal déclaré (MMAAAA)", "S10.G00.00.003 = Nature de la déclaration"],
    obligatoire: true,
  },
  "S10.G00.01": {
    libelle: "Emetteur",
    description: "Identifie l'émetteur de la DSN : entreprise ou tiers déclarant.",
    rubriques_cles: ["S10.G00.01.001 = SIRET émetteur", "S10.G00.01.002 = Civilité", "S10.G00.01.003 = Nom"],
    obligatoire: true,
  },
  "S21.G00.06": {
    libelle: "Etablissement",
    description: "Identification de l'établissement déclarant.",
    rubriques_cles: ["S21.G00.06.001 = SIRET", "S21.G00.06.002 = Enseigne", "S21.G00.06.004 = Code NAF", "S21.G00.06.005 = Code IDCC"],
    obligatoire: true,
  },
  "S21.G00.11": {
    libelle: "Individu (salarié)",
    description: "Données d'identification du salarié : NIR, état civil, coordonnées.",
    rubriques_cles: ["S21.G00.11.001 = NIR", "S21.G00.11.003 = Nom de famille", "S21.G00.11.005 = Prénoms", "S21.G00.11.006 = Sexe", "S21.G00.11.007 = Date de naissance"],
    obligatoire: true,
  },
  "S21.G00.30": {
    libelle: "Contrat",
    description: "Informations contractuelles du salarié : type de contrat, convention collective, nature d'emploi.",
    rubriques_cles: ["S21.G00.30.001 = Date début contrat", "S21.G00.30.004 = Code nature du contrat", "S21.G00.30.006 = Code IDCC", "S21.G00.30.007 = Code PCS-ESE"],
    obligatoire: true,
  },
  "S21.G00.40": {
    libelle: "Activité",
    description: "Période d'activité du salarié sur le mois : présence, absences, heures travaillées.",
    rubriques_cles: ["S21.G00.40.001 = Date début période de paie", "S21.G00.40.002 = Date fin période de paie", "S21.G00.40.007 = Nombre d'heures travaillées"],
    obligatoire: true,
  },
  "S21.G00.50": {
    libelle: "Rémunération",
    description: "Détail des éléments de rémunération versés au salarié.",
    rubriques_cles: ["S21.G00.50.001 = Date de début", "S21.G00.50.002 = Date de fin", "S21.G00.50.003 = Type de rémunération", "S21.G00.50.004 = Montant"],
    obligatoire: true,
  },
  "S21.G00.53": {
    libelle: "Arrêt de travail",
    description: "Signalement d'un arrêt de travail (maladie, AT, maternité...). Remplace les attestations papier.",
    rubriques_cles: ["S21.G00.53.001 = Date de début", "S21.G00.53.002 = Date de fin prévisionnelle", "S21.G00.53.003 = Code motif", "S21.G00.53.013 = Subrogation"],
    obligatoire: false,
  },
  "S21.G00.54": {
    libelle: "Fin de contrat",
    description: "Signalement de fin de contrat de travail. Alimente le dossier France Travail.",
    rubriques_cles: ["S21.G00.54.001 = Date de fin", "S21.G00.54.002 = Code motif rupture", "S21.G00.54.010 = Salaire de référence"],
    obligatoire: false,
  },
  "S21.G00.78": {
    libelle: "Montant Net Social (MNS)",
    description: "Montant net social à déclarer depuis janvier 2024. Sert au calcul du RSA et de la prime d'activité.",
    rubriques_cles: ["S21.G00.78.001 = Montant net social", "S21.G00.78.002 = Période de début", "S21.G00.78.003 = Période de fin"],
    obligatoire: true,
  },
};

exports.CODES_MOTIFS_RUPTURE = {
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

exports.CODES_NATURE_CONTRAT = {
  "01": "CDI",
  "02": "CDD",
  "03": "CTT (contrat de travail temporaire / intérim)",
  "07": "Contrat d'apprentissage",
  "08": "Contrat de professionnalisation",
  "10": "Contrat intermittent",
  "29": "Mandat social",
  "80": "Portage salarial",
  "89": "Autre nature de contrat",
  "90": "Convention de stage",
};
