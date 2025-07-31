// Interface pour une section tarifaire
interface TariffSection {
  number: string;
  title: string;
  chapters: string[];
  description: string;
  keywords: {
    primary: string[];
    secondary: string[];
    technical: string[];
    codes: string[];
  };
  exclusions: string[];
}

// Interface pour le résultat de classification
interface ClassificationResult {
  section: TariffSection;
  score: number;
  confidence: number;
  reasons: string[];
  warnings: string[];
  matchedTerms: MatchedTerm[];
  normalizedScore: number;
  certaintyLevel: string;
  validationStatus: string;
  recommendations: string[];
  requiredClarifications: string[];
}

interface MatchedTerm {
  keyword: string;
  type: 'primary' | 'secondary' | 'technical';
  matches: Array<{
    type: 'exact' | 'synonym';
    token: string;
    synonym?: string;
  }>;
}

interface SemanticAnalysis {
  tokens: {
    original: string[];
    stemmed: string[];
    synonyms: string[];
    phrases: string[];
  };
  entities: {
    brands: string[];
    materials: string[];
    quantities: string[];
    origins: string[];
    specifications: string[];
  };
  context: {
    state: string;
    usage: string;
    processing: string;
    target: string;
  };
  technicalTerms: string[];
  negations: Array<{
    negation: string;
    term: string;
  }>;
}

interface ContextRule {
  name: string;
  rules: Array<{
    pattern: RegExp;
    boost: number;
    sections: string[];
  }>;
}

interface ScoreData {
  section: TariffSection;
  score: number;
  confidence: number;
  reasons: string[];
  warnings: string[];
  matchedTerms: MatchedTerm[];
  normalizedScore: number;
  certaintyLevel?: string;
  validationStatus?: string;
  recommendations?: string[];
  requiredClarifications?: string[];
}

export class TariffAIClassifierComplete {
  private sectionsData: { [key: string]: TariffSection };
  private synonymDictionary: { [key: string]: string[] };
  private contextRules: ContextRule[];
  private uncertaintyThreshold: number = 0.7;
  private multipleMatchesThreshold: number = 0.6;
  private learningHistory: any[] = [];

  constructor() {
    this.sectionsData = this.buildSectionsDatabase();
    this.synonymDictionary = this.buildSynonymDictionary();
    this.contextRules = this.buildContextRules();
  }

  // Base de données complète des 21 sections tarifaires CEDEAO
  private buildSectionsDatabase(): { [key: string]: TariffSection } {
    return {
      "Section I": {
        number: "I",
        title: "Animaux vivants et produits du règne animal",
        chapters: ["01", "02", "03", "04", "05"],
        description: "Animaux vivants, viandes, poissons, produits laitiers, œufs, miel",
        keywords: {
          primary: ["animal", "viande", "poisson", "lait", "œuf", "fromage", "beurre", "miel"],
          secondary: ["bœuf", "porc", "volaille", "agneau", "crustacé", "mollusque", "yaourt", "crème"],
          technical: ["bovins", "porcins", "ovins", "caprins", "équidés", "mammifères", "lactosérum"],
          codes: ["0101", "0102", "0103", "0104", "0105", "0106", "0201", "0202", "0203", "0204", "0205", "0206", "0207", "0208", "0209", "0210", "0301", "0302", "0303", "0304", "0305", "0306", "0307", "0308", "0401", "0402", "0403", "0404", "0405", "0406", "0407", "0408", "0409", "0410", "0501", "0502", "0503", "0504", "0505", "0506", "0507", "0508", "0509", "0510", "0511"]
        },
        exclusions: ["végétal", "minéral", "synthétique", "artificiel"]
      },
      "Section II": {
        number: "II",
        title: "Produits du règne végétal",
        chapters: ["06", "07", "08", "09", "10", "11", "12", "13", "14"],
        description: "Plantes, légumes, fruits, céréales, graines, résines végétales",
        keywords: {
          primary: ["légume", "fruit", "céréale", "plante", "graine", "farine", "huile végétale"],
          secondary: ["tomate", "pomme", "blé", "riz", "maïs", "soja", "café", "thé", "épice"],
          technical: ["tubercule", "légumineuse", "oléagineux", "aromate", "condiment"],
          codes: ["0601", "0602", "0603", "0604", "0701", "0702", "0703", "0704", "0705", "0706", "0707", "0708", "0709", "0710", "0711", "0712", "0713", "0714", "0801", "0802", "0803", "0804", "0805", "0806", "0807", "0808", "0809", "0810", "0811", "0812", "0813", "0814", "0901", "0902", "0903", "0904", "0905", "0906", "0907", "0908", "0909", "0910", "1001", "1002", "1003", "1004", "1005", "1006", "1007", "1008", "1101", "1102", "1103", "1104", "1105", "1106", "1107", "1108", "1109", "1201", "1202", "1203", "1204", "1205", "1206", "1207", "1208", "1209", "1210", "1211", "1212", "1213", "1214", "1301", "1302", "1401", "1402", "1403", "1404"]
        },
        exclusions: ["animal", "minéral", "synthétique"]
      },
      "Section III": {
        number: "III",
        title: "Graisses et huiles animales ou végétales",
        chapters: ["15"],
        description: "Huiles, graisses, cires d'origine animale ou végétale",
        keywords: {
          primary: ["huile", "graisse", "beurre", "margarine", "cire"],
          secondary: ["olive", "tournesol", "colza", "palme", "coco", "lin"],
          technical: ["lipide", "glycéride", "stéarine", "oléine"],
          codes: ["1501", "1502", "1503", "1504", "1505", "1506", "1507", "1508", "1509", "1510", "1511", "1512", "1513", "1514", "1515", "1516", "1517", "1518", "1520", "1521", "1522"]
        },
        exclusions: ["minéral", "synthétique", "pétrole"]
      },
      "Section IV": {
        number: "IV",
        title: "Produits des industries alimentaires",
        chapters: ["16", "17", "18", "19", "20", "21", "22", "23", "24"],
        description: "Préparations alimentaires, boissons, tabac",
        keywords: {
          primary: ["conserve", "préparation", "boisson", "alcool", "tabac", "sucre", "chocolat"],
          secondary: ["confiture", "sauce", "vin", "bière", "cigarette", "bonbon", "pâtisserie"],
          technical: ["transformation", "fermentation", "distillation", "raffinage"],
          codes: ["1601", "1602", "1603", "1604", "1605", "1701", "1702", "1703", "1704", "1801", "1802", "1803", "1804", "1805", "1806", "1901", "1902", "1903", "1904", "1905", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2101", "2102", "2103", "2104", "2105", "2106", "2201", "2202", "2203", "2204", "2205", "2206", "2207", "2208", "2209", "2301", "2302", "2303", "2304", "2305", "2306", "2307", "2308", "2309", "2401", "2402", "2403"]
        },
        exclusions: ["cru", "naturel", "non transformé"]
      },
      "Section V": {
        number: "V",
        title: "Produits minéraux",
        chapters: ["25", "26", "27"],
        description: "Sel, soufre, pierres, ciments, combustibles minéraux",
        keywords: {
          primary: ["sel", "pierre", "sable", "ciment", "charbon", "pétrole", "gaz"],
          secondary: ["calcaire", "marbre", "granite", "argile", "essence", "diesel"],
          technical: ["minéral", "combustible", "hydrocarbure", "bitume"],
          codes: ["2501", "2502", "2503", "2504", "2505", "2506", "2507", "2508", "2509", "2510", "2511", "2512", "2513", "2514", "2515", "2516", "2517", "2518", "2519", "2520", "2521", "2522", "2523", "2524", "2525", "2526", "2528", "2529", "2530", "2601", "2602", "2603", "2604", "2605", "2606", "2607", "2608", "2609", "2610", "2611", "2612", "2613", "2614", "2615", "2616", "2617", "2618", "2619", "2620", "2621", "2701", "2702", "2703", "2704", "2705", "2706", "2707", "2708", "2709", "2710", "2711", "2712", "2713", "2714", "2715", "2716"]
        },
        exclusions: ["végétal", "animal", "synthétique"]
      },
      "Section VI": {
        number: "VI",
        title: "Produits des industries chimiques",
        chapters: ["28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38"],
        description: "Produits chimiques, pharmaceutiques, engrais, teintures, cosmétiques",
        keywords: {
          primary: ["chimique", "pharmaceutique", "médicament", "engrais", "peinture", "parfum"],
          secondary: ["acide", "base", "sel chimique", "vitamine", "antibiotique", "cosmétique"],
          technical: ["organique", "inorganique", "catalyseur", "réactif", "polymère"],
          codes: ["2801", "2802", "2803", "2804", "2805", "2806", "2807", "2808", "2809", "2810", "2811", "2812", "2813", "2814", "2815", "2816", "2817", "2818", "2819", "2820", "2821", "2822", "2823", "2824", "2825", "2826", "2827", "2828", "2829", "2830", "2831", "2832", "2833", "2834", "2835", "2836", "2837", "2838", "2839", "2840", "2841", "2842", "2843", "2844", "2845", "2846", "2847", "2848", "2849", "2850", "2851", "2852", "2853", "2901", "2902", "2903", "2904", "2905", "2906", "2907", "2908", "2909", "2910", "2911", "2912", "2913", "2914", "2915", "2916", "2917", "2918", "2919", "2920", "2921", "2922", "2923", "2924", "2925", "2926", "2927", "2928", "2929", "2930", "2931", "2932", "2933", "2934", "2935", "2936", "2937", "2938", "2939", "2940", "2941", "2942", "3001", "3002", "3003", "3004", "3005", "3006", "3101", "3102", "3103", "3104", "3105", "3201", "3202", "3203", "3204", "3205", "3206", "3207", "3208", "3209", "3210", "3211", "3212", "3213", "3214", "3215", "3301", "3302", "3303", "3304", "3305", "3306", "3307", "3401", "3402", "3403", "3404", "3405", "3406", "3407", "3501", "3502", "3503", "3504", "3505", "3506", "3507", "3508", "3601", "3602", "3603", "3604", "3605", "3606", "3701", "3702", "3703", "3704", "3705", "3706", "3707", "3801", "3802", "3803", "3804", "3805", "3806", "3807", "3808", "3809", "3810", "3811", "3812", "3813", "3814", "3815", "3816", "3817", "3818", "3819", "3820", "3821", "3822", "3823", "3824", "3825", "3826"]
        },
        exclusions: ["naturel", "bio", "végétal"]
      },
      "Section VII": {
        number: "VII",
        title: "Matières plastiques et caoutchouc",
        chapters: ["39", "40"],
        description: "Plastiques, résines synthétiques, caoutchouc et ouvrages",
        keywords: {
          primary: ["plastique", "caoutchouc", "polymère", "résine", "synthétique"],
          secondary: ["polyéthylène", "PVC", "polystyrène", "pneu", "tube", "sac"],
          technical: ["thermoplastique", "élastomère", "vulcanisation", "polyamide"],
          codes: ["3901", "3902", "3903", "3904", "3905", "3906", "3907", "3908", "3909", "3910", "3911", "3912", "3913", "3914", "3915", "3916", "3917", "3918", "3919", "3920", "3921", "3922", "3923", "3924", "3925", "3926", "4001", "4002", "4003", "4004", "4005", "4006", "4007", "4008", "4009", "4010", "4011", "4012", "4013", "4014", "4015", "4016", "4017"]
        },
        exclusions: ["métal", "textile", "bois", "verre"]
      },
      "Section VIII": {
        number: "VIII",
        title: "Peaux, cuirs et ouvrages",
        chapters: ["41", "42", "43"],
        description: "Cuirs, peaux, fourrures, maroquinerie, articles de voyage",
        keywords: {
          primary: ["cuir", "peau", "fourrure", "maroquinerie", "tannage"],
          secondary: ["sac", "valise", "chaussure", "ceinture", "portefeuille"],
          technical: ["tannerie", "pelleterie", "croûte", "bourrellerie"],
          codes: ["4101", "4102", "4103", "4104", "4105", "4106", "4107", "4112", "4113", "4114", "4115", "4201", "4202", "4203", "4204", "4205", "4206", "4301", "4302", "4303", "4304"]
        },
        exclusions: ["textile", "plastique", "métal"]
      },
      "Section IX": {
        number: "IX",
        title: "Bois, charbon de bois et ouvrages",
        chapters: ["44", "45", "46"],
        description: "Bois, liège, vannerie, ouvrages de sparterie",
        keywords: {
          primary: ["bois", "liège", "vannerie", "osier", "rotin"],
          secondary: ["planche", "poutre", "contreplaqué", "aggloméré", "sciage"],
          technical: ["forestier", "sylviculture", "essence", "débitage"],
          codes: ["4401", "4402", "4403", "4404", "4405", "4406", "4407", "4408", "4409", "4410", "4411", "4412", "4413", "4414", "4415", "4416", "4417", "4418", "4419", "4420", "4421", "4501", "4502", "4503", "4504", "4601", "4602"]
        },
        exclusions: ["plastique", "métal", "textile"]
      },
      "Section X": {
        number: "X",
        title: "Pâtes de bois, papier et carton",
        chapters: ["47", "48", "49"],
        description: "Papier, carton, livres, journaux, édition",
        keywords: {
          primary: ["papier", "carton", "livre", "journal", "magazine", "pâte"],
          secondary: ["impression", "édition", "emballage", "cahier", "enveloppe"],
          technical: ["cellulose", "fibreux", "imprimerie", "graphique"],
          codes: ["4701", "4702", "4703", "4704", "4705", "4706", "4707", "4801", "4802", "4803", "4804", "4805", "4806", "4807", "4808", "4809", "4810", "4811", "4812", "4813", "4814", "4815", "4816", "4817", "4818", "4819", "4820", "4821", "4822", "4823", "4901", "4902", "4903", "4904", "4905", "4906", "4907", "4908", "4909", "4910", "4911"]
        },
        exclusions: ["textile", "plastique", "métal"]
      },
      "Section XI": {
        number: "XI",
        title: "Matières textiles et ouvrages",
        chapters: ["50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63"],
        description: "Tissus, vêtements, fibres textiles, confection",
        keywords: {
          primary: ["textile", "tissu", "vêtement", "fibre", "fil", "coton", "laine"],
          secondary: ["chemise", "pantalon", "robe", "tricot", "tissage", "tapis"],
          technical: ["filature", "bonneterie", "confection", "ennoblissement"],
          codes: ["5001", "5002", "5003", "5004", "5005", "5006", "5007", "5101", "5102", "5103", "5104", "5105", "5106", "5107", "5108", "5109", "5110", "5111", "5112", "5113", "5201", "5202", "5203", "5204", "5205", "5206", "5207", "5208", "5209", "5210", "5211", "5212", "5301", "5302", "5303", "5305", "5306", "5307", "5308", "5309", "5310", "5311", "5401", "5402", "5403", "5404", "5405", "5406", "5407", "5408", "5501", "5502", "5503", "5504", "5505", "5506", "5507", "5508", "5509", "5510", "5511", "5512", "5513", "5514", "5515", "5516", "5601", "5602", "5603", "5604", "5605", "5606", "5607", "5608", "5609", "5701", "5702", "5703", "5704", "5705", "5801", "5802", "5803", "5804", "5805", "5806", "5807", "5808", "5809", "5810", "5811", "5901", "5902", "5903", "5904", "5905", "5906", "5907", "5908", "5909", "5910", "5911", "6001", "6002", "6003", "6004", "6005", "6006", "6101", "6102", "6103", "6104", "6105", "6106", "6107", "6108", "6109", "6110", "6111", "6112", "6113", "6114", "6115", "6116", "6117", "6201", "6202", "6203", "6204", "6205", "6206", "6207", "6208", "6209", "6210", "6211", "6212", "6213", "6214", "6215", "6216", "6217", "6301", "6302", "6303", "6304", "6305", "6306", "6307", "6308", "6309", "6310"]
        },
        exclusions: ["plastique", "métal", "cuir"]
      },
      "Section XII": {
        number: "XII",
        title: "Chaussures, coiffures, parapluies",
        chapters: ["64", "65", "66", "67"],
        description: "Chaussures, chapeaux, parapluies, plumes",
        keywords: {
          primary: ["chaussure", "chapeau", "parapluie", "plume", "coiffure"],
          secondary: ["botte", "sandales", "casquette", "béret", "ombrelle"],
          technical: ["cordonnerie", "chapellerie", "maroquinerie"],
          codes: ["6401", "6402", "6403", "6404", "6405", "6406", "6501", "6502", "6503", "6504", "6505", "6506", "6507", "6601", "6602", "6603", "6701", "6702", "6703", "6704"]
        },
        exclusions: ["textile", "plastique", "métal"]
      },
      "Section XIII": {
        number: "XIII",
        title: "Ouvrages en pierres, céramique, verre",
        chapters: ["68", "69", "70"],
        description: "Pierre, ciment, céramique, porcelaine, verre",
        keywords: {
          primary: ["pierre", "ciment", "céramique", "porcelaine", "verre", "cristal"],
          secondary: ["marbre", "granit", "béton", "faïence", "grès", "vitre"],
          technical: ["silicate", "réfractaire", "verrerie", "cristallerie"],
          codes: ["6801", "6802", "6803", "6804", "6805", "6806", "6807", "6808", "6809", "6810", "6811", "6812", "6813", "6814", "6815", "6901", "6902", "6903", "6904", "6905", "6906", "6907", "6908", "6909", "6910", "6911", "6912", "6913", "6914", "7001", "7002", "7003", "7004", "7005", "7006", "7007", "7008", "7009", "7010", "7011", "7012", "7013", "7014", "7015", "7016", "7017", "7018", "7019", "7020"]
        },
        exclusions: ["métal", "plastique", "textile"]
      },
      "Section XIV": {
        number: "XIV",
        title: "Perles, pierres gemmes, métaux précieux",
        chapters: ["71"],
        description: "Bijouterie, joaillerie, métaux précieux, monnaies",
        keywords: {
          primary: ["or", "argent", "bijou", "diamant", "perle", "gemme"],
          secondary: ["bague", "collier", "bracelet", "montre", "monnaie"],
          technical: ["joaillerie", "orfèvrerie", "sertissage", "alliage"],
          codes: ["7101", "7102", "7103", "7104", "7105", "7106", "7107", "7108", "7109", "7110", "7111", "7112", "7113", "7114", "7115", "7116", "7117", "7118"]
        },
        exclusions: ["métal commun", "plastique", "verre"]
      },
      "Section XV": {
        number: "XV",
        title: "Métaux communs et ouvrages",
        chapters: ["72", "73", "74", "75", "76", "78", "79", "80", "81", "82", "83"],
        description: "Fer, acier, cuivre, aluminium, outils, ouvrages métalliques",
        keywords: {
          primary: ["métal", "fer", "acier", "aluminium", "cuivre", "zinc", "outil"],
          secondary: ["clou", "vis", "boulon", "tôle", "profilé", "tube"],
          technical: ["sidérurgie", "métallurgie", "alliage", "fonte", "laminage"],
          codes: ["7201", "7202", "7203", "7204", "7205", "7206", "7207", "7208", "7209", "7210", "7211", "7212", "7213", "7214", "7215", "7216", "7217", "7218", "7219", "7220", "7221", "7222", "7223", "7224", "7225", "7226", "7227", "7228", "7229", "7301", "7302", "7303", "7304", "7305", "7306", "7307", "7308", "7309", "7310", "7311", "7312", "7313", "7314", "7315", "7316", "7317", "7318", "7319", "7320", "7321", "7322", "7323", "7324", "7325", "7326", "7401", "7402", "7403", "7404", "7405", "7406", "7407", "7408", "7409", "7410", "7411", "7412", "7413", "7415", "7418", "7419", "7501", "7502", "7503", "7504", "7505", "7506", "7507", "7508", "7601", "7602", "7603", "7604", "7605", "7606", "7607", "7608", "7609", "7610", "7611", "7612", "7613", "7614", "7615", "7616", "7801", "7804", "7806", "7901", "7902", "7903", "7904", "7905", "7907", "8001", "8002", "8003", "8007", "8101", "8102", "8103", "8104", "8105", "8106", "8107", "8108", "8109", "8110", "8111", "8112", "8113", "8201", "8202", "8203", "8204", "8205", "8206", "8207", "8208", "8209", "8210", "8211", "8212", "8213", "8214", "8215", "8301", "8302", "8303", "8304", "8305", "8306", "8307", "8308", "8309", "8310", "8311"]
        },
        exclusions: ["plastique", "bois", "textile"]
      },
      "Section XVI": {
        number: "XVI",
        title: "Machines et appareils électriques",
        chapters: ["84", "85"],
        description: "Machines, moteurs, équipements électriques et électroniques",
        keywords: {
          primary: ["machine", "moteur", "électrique", "électronique", "appareil"],
          secondary: ["ordinateur", "téléphone", "télévision", "réfrigérateur", "pompe"],
          technical: ["mécanique", "hydraulique", "pneumatique", "automation"],
          codes: ["8401", "8402", "8403", "8404", "8405", "8406", "8407", "8408", "8409", "8410", "8411", "8412", "8413", "8414", "8415", "8416", "8417", "8418", "8419", "8420", "8421", "8422", "8423", "8424", "8425", "8426", "8427", "8428", "8429", "8430", "8431", "8432", "8433", "8434", "8435", "8436", "8437", "8438", "8439", "8440", "8441", "8442", "8443", "8444", "8445", "8446", "8447", "8448", "8449", "8450", "8451", "8452", "8453", "8454", "8455", "8456", "8457", "8458", "8459", "8460", "8461", "8462", "8463", "8464", "8465", "8466", "8467", "8468", "8469", "8470", "8471", "8472", "8473", "8474", "8475", "8476", "8477", "8478", "8479", "8480", "8481", "8482", "8483", "8484", "8485", "8486", "8487", "8501", "8502", "8503", "8504", "8505", "8506", "8507", "8508", "8509", "8510", "8511", "8512", "8513", "8514", "8515", "8516", "8517", "8518", "8519", "8520", "8521", "8522", "8523", "8524", "8525", "8526", "8527", "8528", "8529", "8530", "8531", "8532", "8533", "8534", "8535", "8536", "8537", "8538", "8539", "8540", "8541", "8542", "8543", "8544", "8545", "8546", "8547", "8548"]
        },
        exclusions: ["manuel", "textile", "bois"]
      },
      "Section XVII": {
        number: "XVII",
        title: "Matériel de transport",
        chapters: ["86", "87", "88", "89"],
        description: "Véhicules, automobiles, navires, aéronefs",
        keywords: {
          primary: ["véhicule", "voiture", "camion", "moto", "bateau", "avion"],
          secondary: ["automobile", "navire", "aéronef", "train", "bicyclette"],
          technical: ["transport", "navigation", "aviation", "ferroviaire"],
          codes: ["8601", "8602", "8603", "8604", "8605", "8606", "8607", "8608", "8609", "8701", "8702", "8703", "8704", "8705", "8706", "8707", "8708", "8709", "8710", "8711", "8712", "8713", "8714", "8715", "8716", "8801", "8802", "8803", "8804", "8805", "8901", "8902", "8903", "8904", "8905", "8906", "8907", "8908"]
        },
        exclusions: ["stationnaire", "textile", "mobilier"]
      },
      "Section XVIII": {
        number: "XVIII",
        title: "Instruments d'optique, de mesure, horlogerie",
        chapters: ["90", "91", "92"],
        description: "Instruments de précision, horlogerie, instruments de musique",
        keywords: {
          primary: ["instrument", "optique", "mesure", "montre", "horloge", "musique"],
          secondary: ["lunettes", "microscope", "thermomètre", "piano", "guitare"],
          technical: ["précision", "calibrage", "chronométrie", "acoustique"],
          codes: ["9001", "9002", "9003", "9004", "9005", "9006", "9007", "9008", "9010", "9011", "9012", "9013", "9014", "9015", "9016", "9017", "9018", "9019", "9020", "9021", "9022", "9023", "9024", "9025", "9026", "9027", "9028", "9029", "9030", "9031", "9032", "9033", "9101", "9102", "9103", "9104", "9105", "9106", "9107", "9108", "9109", "9110", "9111", "9112", "9113", "9114", "9201", "9202", "9203", "9204", "9205", "9206", "9207", "9208", "9209"]
        },
        exclusions: ["grossier", "textile", "alimentaire"]
      },
      "Section XIX": {
        number: "XIX",
        title: "Armes, munitions",
        chapters: ["93"],
        description: "Armes et munitions, parties et accessoires",
        keywords: {
          primary: ["arme", "fusil", "pistolet", "munition", "cartouche"],
          secondary: ["militaire", "chasse", "défense", "sécurité"],
          technical: ["balistique", "armement", "pyrotechnie"],
          codes: ["9301", "9302", "9303", "9304", "9305", "9306", "9307"]
        },
        exclusions: ["civil", "textile", "alimentaire"]
      },
      "Section XX": {
        number: "XX",
        title: "Marchandises et produits divers",
        chapters: ["94", "95", "96"],
        description: "Meubles, jouets, ouvrages divers",
        keywords: {
          primary: ["meuble", "jouet", "jeu", "sport", "brosse", "stylo"],
          secondary: ["siège", "table", "lit", "poupée", "ballon", "parapluie"],
          technical: ["mobilier", "ludique", "récréatif", "domestique"],
          codes: ["9401", "9402", "9403", "9404", "9405", "9406", "9501", "9502", "9503", "9504", "9505", "9506", "9507", "9508", "9601", "9602", "9603", "9604", "9605", "9606", "9607", "9608", "9609", "9610", "9611", "9612", "9613", "9614", "9615", "9616", "9617", "9618"]
        },
        exclusions: ["industriel", "professionnel", "technique"]
      },
      "Section XXI": {
        number: "XXI",
        title: "Objets d'art, de collection ou d'antiquité",
        chapters: ["97"],
        description: "Œuvres d'art, objets de collection, antiquités",
        keywords: {
          primary: ["art", "œuvre", "tableau", "sculpture", "collection", "antiquité"],
          secondary: ["peinture", "statue", "artisanat", "patrimoine"],
          technical: ["artistique", "culturel", "historique"],
          codes: ["9701", "9702", "9703", "9704", "9705", "9706"]
        },
        exclusions: ["industriel", "moderne", "série"]
      }
    };
  }

  // Dictionnaire de synonymes enrichi
  private buildSynonymDictionary(): { [key: string]: string[] } {
    return {
      "animal": ["bête", "bétail", "animal domestique", "faune", "espèce animale"],
      "viande": ["chair", "barbaque", "bidoche", "protéine animale"],
      "poisson": ["poiscaille", "fruit de mer", "produit halieutique"],
      "légume": ["légumineuse", "produit maraîcher", "légume vert"],
      "fruit": ["produit fruitier", "fruit frais", "fruit tropical"],
      "céréale": ["grain", "blé", "orge", "avoine", "seigle"],
      "machine": ["appareil", "équipement", "dispositif", "mécanisme"],
      "véhicule": ["transport", "automobile", "engin", "moyen de transport"],
      "textile": ["tissu", "étoffe", "matière textile", "fibres"],
      "métal": ["métallique", "alliage", "fer", "acier", "aluminium"],
      "plastique": ["polymère", "matière plastique", "résine synthétique"],
      "chimique": ["produit chimique", "substance chimique", "composé"],
      "électrique": ["électronique", "électroménager", "appareil électrique"],
      "bois": ["matière ligneuse", "essence de bois", "produit forestier"],
      "verre": ["cristal", "verrerie", "matière vitreuse"],
      "cuir": ["peau", "matière tannée", "maroquinerie"],
      "papier": ["cellulose", "produit papetier", "support papier"]
    };
  }

  // Règles contextuelles avancées
  private buildContextRules(): ContextRule[] {
    return [
      {
        name: "État du produit",
        rules: [
          { pattern: /\b(vivant|frais|réfrigéré)\b/gi, boost: 1.5, sections: ["I", "II"] },
          { pattern: /\b(congelé|surgelé)\b/gi, boost: 1.3, sections: ["I", "II", "IV"] },
          { pattern: /\b(séché|déshydraté|conservé)\b/gi, boost: 1.4, sections: ["II", "IV"] },
          { pattern: /\b(préparé|transformé|manufacturé)\b/gi, boost: 1.5, sections: ["IV", "VI", "XVI"] }
        ]
      },
      {
        name: "Usage du produit",
        rules: [
          { pattern: /\b(alimentaire|comestible|consommation)\b/gi, boost: 2.0, sections: ["I", "II", "III", "IV"] },
          { pattern: /\b(industriel|technique|professionnel)\b/gi, boost: 1.8, sections: ["V", "VI", "XV", "XVI"] },
          { pattern: /\b(domestique|ménager|personnel)\b/gi, boost: 1.5, sections: ["XX", "XI", "VIII"] },
          { pattern: /\b(médical|pharmaceutique|thérapeutique)\b/gi, boost: 2.5, sections: ["VI", "XVIII"] }
        ]
      },
      {
        name: "Origine du produit",
        rules: [
          { pattern: /\b(naturel|bio|organique)\b/gi, boost: 1.6, sections: ["I", "II", "III"] },
          { pattern: /\b(synthétique|artificiel|chimique)\b/gi, boost: 1.8, sections: ["VI", "VII"] },
          { pattern: /\b(recyclé|récupéré)\b/gi, boost: 1.2, sections: ["X", "XV"] }
        ]
      },
      {
        name: "Matière première",
        rules: [
          { pattern: /\b(coton|laine|soie|lin|fibr)\b/gi, boost: 2.2, sections: ["XI"] },
          { pattern: /\b(acier|fer|métallique|alliage)\b/gi, boost: 2.2, sections: ["XV"] },
          { pattern: /\b(pétrole|gaz|combustible|carburant)\b/gi, boost: 2.5, sections: ["V"] },
          { pattern: /\b(bois|forestier|ligneux)\b/gi, boost: 2.2, sections: ["IX"] }
        ]
      }
    ];
  }

  // Analyse sémantique avancée
  private performSemanticAnalysis(description: string): SemanticAnalysis {
    const analysis: SemanticAnalysis = {
      tokens: this.tokenizeText(description),
      entities: this.extractEntities(description),
      context: this.analyzeContext(description),
      technicalTerms: this.identifyTechnicalTerms(description),
      negations: this.detectNegations(description)
    };
    
    return analysis;
  }

  // Tokenisation intelligente
  private tokenizeText(text: string): SemanticAnalysis['tokens'] {
    const normalizedText = text.toLowerCase()
      .replace(/[^\w\s\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const words = normalizedText.split(' ').filter(word => word.length > 2);
    const stemmed = words.map(word => this.stemWord(word));
    const synonyms = this.expandWithSynonyms(words);
    
    return {
      original: words,
      stemmed: stemmed,
      synonyms: synonyms,
      phrases: this.extractPhrases(normalizedText)
    };
  }

  // Extraction d'entités nommées
  private extractEntities(text: string): SemanticAnalysis['entities'] {
    const entities: SemanticAnalysis['entities'] = {
      brands: [],
      materials: [],
      quantities: [],
      origins: [],
      specifications: []
    };

    // Détection de marques
    const brandPatterns = /\b([A-Z][a-z]+ ?[A-Z][a-z]*)\b/g;
    let match;
    while ((match = brandPatterns.exec(text)) !== null) {
      entities.brands.push(match[1]);
    }

    // Détection de quantités
    const quantityPatterns = /\b(\d+(?:\.\d+)?\s*(?:kg|g|l|ml|m|cm|mm|%)?)\b/gi;
    while ((match = quantityPatterns.exec(text)) !== null) {
      entities.quantities.push(match[1]);
    }

    // Détection d'origines géographiques
    const originPatterns = /\b(français|chinois|allemand|italien|africain|européen|asiatique)\b/gi;
    while ((match = originPatterns.exec(text)) !== null) {
      entities.origins.push(match[1]);
    }

    return entities;
  }

  // Analyse contextuelle
  private analyzeContext(description: string): SemanticAnalysis['context'] {
    const context: SemanticAnalysis['context'] = {
      state: "unknown",
      usage: "unknown",
      processing: "unknown",
      target: "unknown"
    };

    // État du produit
    if (/\b(frais|vivant|cru)\b/gi.test(description)) {
      context.state = "fresh";
    } else if (/\b(congelé|surgelé)\b/gi.test(description)) {
      context.state = "frozen";
    } else if (/\b(séché|déshydraté)\b/gi.test(description)) {
      context.state = "dried";
    } else if (/\b(conservé|en conserve)\b/gi.test(description)) {
      context.state = "preserved";
    }

    // Usage
    if (/\b(alimentaire|comestible|consommation)\b/gi.test(description)) {
      context.usage = "food";
    } else if (/\b(industriel|technique)\b/gi.test(description)) {
      context.usage = "industrial";
    } else if (/\b(médical|pharmaceutique)\b/gi.test(description)) {
      context.usage = "medical";
    }

    // Niveau de transformation
    if (/\b(brut|naturel|non traité)\b/gi.test(description)) {
      context.processing = "raw";
    } else if (/\b(préparé|transformé|manufacturé)\b/gi.test(description)) {
      context.processing = "processed";
    }

    return context;
  }

  // Identification de termes techniques
  private identifyTechnicalTerms(description: string): string[] {
    const technicalTerms: string[] = [];
    const technicalPatterns = [
      /\b\d{4}\.\d{2}\.\d{2}\.\d{2}\b/g, // Codes tarifaires
      /\b[A-Z]{2,}\b/g, // Acronymes
      /\b\w+ique\b/gi, // Termes en -ique
      /\b\w+ation\b/gi, // Termes en -ation
      /\b\w+ologie\b/gi // Termes en -ologie
    ];

    technicalPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(description)) !== null) {
        technicalTerms.push(match[0]);
      }
    });

    return technicalTerms;
  }

  // Détection de négations
  private detectNegations(description: string): SemanticAnalysis['negations'] {
    const negationPatterns = /\b(non|pas|sans|aucun|aucune|jamais|nullement)\s+(\w+)/gi;
    const negations: SemanticAnalysis['negations'] = [];
    let match;

    while ((match = negationPatterns.exec(description)) !== null) {
      negations.push({
        negation: match[1],
        term: match[2]
      });
    }

    return negations;
  }

  // Classification principale avec IA
  public classifyWithAI(description: string): ClassificationResult[] {
    const semanticAnalysis = this.performSemanticAnalysis(description);
    const scores: { [key: string]: ScoreData } = {};
    
    // Initialiser les scores
    Object.keys(this.sectionsData).forEach(sectionKey => {
      scores[sectionKey] = {
        section: this.sectionsData[sectionKey],
        score: 0,
        confidence: 0,
        reasons: [],
        warnings: [],
        matchedTerms: [],
        normalizedScore: 0
      };
    });

    // Score basé sur les mots-clés
    this.calculateKeywordScores(semanticAnalysis, scores);
    
    // Score basé sur le contexte
    this.applyContextualRules(semanticAnalysis, scores);
    
    // Score basé sur les codes tarifaires
    this.applyTariffCodeMatching(semanticAnalysis, scores);
    
    // Score basé sur les exclusions
    this.applyExclusionRules(semanticAnalysis, scores);
    
    // Calcul final des scores et confiance
    this.calculateFinalScores(scores);
    
    // Tri et filtrage des résultats
    const results = this.filterAndSortResults(scores);
    
    // Validation et recommandations
    const validatedResults = this.validateResults(results, description);
    
    return validatedResults;
  }

  // Calcul des scores basés sur les mots-clés
  private calculateKeywordScores(analysis: SemanticAnalysis, scores: { [key: string]: ScoreData }): void {
    Object.keys(this.sectionsData).forEach(sectionKey => {
      const section = this.sectionsData[sectionKey];
      let sectionScore = 0;
      const matchedTerms: MatchedTerm[] = [];

      // Mots-clés primaires (poids fort)
      section.keywords.primary.forEach(keyword => {
        const matches = this.findKeywordMatches(keyword, analysis);
        if (matches.length > 0) {
          sectionScore += matches.length * 10;
          matchedTerms.push({ keyword, type: 'primary', matches });
        }
      });

      // Mots-clés secondaires (poids moyen)
      section.keywords.secondary.forEach(keyword => {
        const matches = this.findKeywordMatches(keyword, analysis);
        if (matches.length > 0) {
          sectionScore += matches.length * 6;
          matchedTerms.push({ keyword, type: 'secondary', matches });
        }
      });

      // Mots-clés techniques (poids variable selon contexte)
      section.keywords.technical.forEach(keyword => {
        const matches = this.findKeywordMatches(keyword, analysis);
        if (matches.length > 0) {
          const weight = analysis.technicalTerms.length > 0 ? 8 : 4;
          sectionScore += matches.length * weight;
          matchedTerms.push({ keyword, type: 'technical', matches });
        }
      });

      scores[sectionKey].score += sectionScore;
      scores[sectionKey].matchedTerms = matchedTerms;
    });
  }

  // Recherche de correspondances de mots-clés
  private findKeywordMatches(keyword: string, analysis: SemanticAnalysis): Array<{ type: 'exact' | 'synonym'; token: string; synonym?: string }> {
    const matches: Array<{ type: 'exact' | 'synonym'; token: string; synonym?: string }> = [];
    const keywordLower = keyword.toLowerCase();

    // Recherche dans les tokens originaux
    analysis.tokens.original.forEach(token => {
      if (token.includes(keywordLower) || keywordLower.includes(token)) {
        matches.push({ type: 'exact', token });
      }
    });

    // Recherche dans les synonymes
    if (this.synonymDictionary[keywordLower]) {
      this.synonymDictionary[keywordLower].forEach(synonym => {
        analysis.tokens.original.forEach(token => {
          if (token.includes(synonym.toLowerCase()) || synonym.toLowerCase().includes(token)) {
            matches.push({ type: 'synonym', token, synonym });
          }
        });
      });
    }

    return matches;
  }

  // Application des règles contextuelles
  private applyContextualRules(analysis: SemanticAnalysis, scores: { [key: string]: ScoreData }): void {
    this.contextRules.forEach(rule => {
      rule.rules.forEach(contextRule => {
        const description = analysis.tokens.original.join(' ');
        if (contextRule.pattern.test(description)) {
          contextRule.sections.forEach(sectionNumber => {
            const sectionKey = `Section ${sectionNumber}`;
            if (scores[sectionKey]) {
              scores[sectionKey].score *= contextRule.boost;
              scores[sectionKey].reasons.push(`Règle contextuelle: ${rule.name} (boost: ${contextRule.boost})`);
            }
          });
        }
      });
    });
  }

  // Correspondance avec les codes tarifaires
  private applyTariffCodeMatching(analysis: SemanticAnalysis, scores: { [key: string]: ScoreData }): void {
    analysis.technicalTerms.forEach(term => {
      if (/^\d{4}(\.\d{2})?(\.\d{2})?(\.\d{2})?$/.test(term)) {
        const code = term.substring(0, 4);
        Object.keys(this.sectionsData).forEach(sectionKey => {
          const section = this.sectionsData[sectionKey];
          if (section.keywords.codes && section.keywords.codes.some(c => c.startsWith(code))) {
            scores[sectionKey].score += 50; // Bonus important pour les codes exacts
            scores[sectionKey].reasons.push(`Code tarifaire détecté: ${term}`);
          }
        });
      }
    });
  }

  // Application des règles d'exclusion
  private applyExclusionRules(analysis: SemanticAnalysis, scores: { [key: string]: ScoreData }): void {
    Object.keys(this.sectionsData).forEach(sectionKey => {
      const section = this.sectionsData[sectionKey];
      section.exclusions.forEach(exclusion => {
        const matches = this.findKeywordMatches(exclusion, analysis);
        if (matches.length > 0) {
          scores[sectionKey].score *= 0.3; // Pénalité forte pour les exclusions
          scores[sectionKey].warnings.push(`Terme d'exclusion détecté: ${exclusion}`);
        }
      });
    });
  }

  // Calcul des scores finaux
  private calculateFinalScores(scores: { [key: string]: ScoreData }): void {
    const maxScore = Math.max(...Object.values(scores).map(s => s.score));
    
    Object.keys(scores).forEach(sectionKey => {
      const score = scores[sectionKey];
      
      // Normalisation du score (0-100)
      score.normalizedScore = maxScore > 0 ? (score.score / maxScore) * 100 : 0;
      
      // Calcul de la confiance
      score.confidence = this.calculateConfidence(score);
      
      // Détermination du niveau de certitude
      score.certaintyLevel = this.determineCertaintyLevel(score.confidence);
    });
  }

  // Calcul de la confiance
  private calculateConfidence(scoreData: ScoreData): number {
    let confidence = scoreData.normalizedScore;
    
    // Bonus pour plusieurs types de correspondances
    const matchTypes = new Set(scoreData.matchedTerms.map(m => m.type));
    if (matchTypes.size > 1) {
      confidence *= 1.2;
    }
    
    // Bonus pour les raisons contextuelles
    if (scoreData.reasons.length > 0) {
      confidence *= 1.1;
    }
    
    // Pénalité pour les avertissements
    if (scoreData.warnings.length > 0) {
      confidence *= 0.7;
    }
    
    return Math.min(confidence, 100);
  }

  // Détermination du niveau de certitude
  private determineCertaintyLevel(confidence: number): string {
    if (confidence >= 85) return "TRÈS ÉLEVÉE";
    if (confidence >= 70) return "ÉLEVÉE";
    if (confidence >= 55) return "MOYENNE";
    if (confidence >= 40) return "FAIBLE";
    return "TRÈS FAIBLE";
  }

  // Filtrage et tri des résultats
  private filterAndSortResults(scores: { [key: string]: ScoreData }): ClassificationResult[] {
    return Object.values(scores)
      .filter(score => score.confidence > 20) // Seuil minimum
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5) // Top 5 résultats
      .map(score => ({
        ...score,
        certaintyLevel: score.certaintyLevel || "TRÈS FAIBLE",
        validationStatus: "VALID",
        recommendations: [],
        requiredClarifications: []
      }));
  }

  // Validation des résultats
  private validateResults(results: ClassificationResult[], originalDescription: string): ClassificationResult[] {
    const validated = results.map(result => {
      const validation = {
        ...result,
        validationStatus: "VALID",
        recommendations: result.recommendations ? [...result.recommendations] : [],
        requiredClarifications: result.requiredClarifications ? [...result.requiredClarifications] : []
      };

      // Vérification de la cohérence
      if (result.confidence < this.uncertaintyThreshold * 100) {
        validation.validationStatus = "UNCERTAIN";
        validation.recommendations.push("Classification incertaine - Vérification manuelle recommandée");
      }

      // Détection de classifications multiples possibles
      const highConfidenceResults = results.filter(r => r.confidence > this.multipleMatchesThreshold * 100);
      if (highConfidenceResults.length > 1) {
        validation.validationStatus = "MULTIPLE_MATCHES";
        validation.recommendations.push("Plusieurs classifications possibles - Analyse approfondie nécessaire");
      }

      // Suggestions d'amélioration de la description
      if (result.matchedTerms.length < 3) {
        validation.requiredClarifications.push("Description trop générique - Ajouter plus de détails spécifiques");
      }

      return validation;
    });

    return validated;
  }

  // Fonctions utilitaires
  private stemWord(word: string): string {
    // Algorithme de racinisation français simplifié
    const suffixes = ['tion', 'ment', 'ique', 'able', 'ible', 'ance', 'ence', 'eur', 'euse', 'ant', 'ent'];
    for (let suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.substring(0, word.length - suffix.length);
      }
    }
    return word;
  }

  private expandWithSynonyms(words: string[]): string[] {
    const expanded = [...words];
    words.forEach(word => {
      if (this.synonymDictionary[word]) {
        expanded.push(...this.synonymDictionary[word]);
      }
    });
    return [...new Set(expanded)];
  }

  private extractPhrases(text: string): string[] {
    const phrases: string[] = [];
    const words = text.split(' ');
    
    // Extraction de phrases de 2-3 mots
    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(words[i] + ' ' + words[i + 1]);
      if (i < words.length - 2) {
        phrases.push(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
      }
    }
    
    return phrases;
  }

  // Génération de rapport détaillé
  public generateDetailedReport(results: ClassificationResult[], description: string) {
    return {
      inputDescription: description,
      analysisTimestamp: new Date().toISOString(),
      totalSectionsAnalyzed: Object.keys(this.sectionsData).length,
      results: results,
      recommendations: this.generateRecommendations(results),
      confidence: results.length > 0 ? results[0].confidence : 0,
      needsHumanValidation: results.length === 0 || results[0].confidence < 70
    };
  }

  private generateRecommendations(results: ClassificationResult[]): string[] {
    const recommendations: string[] = [];
    
    if (results.length === 0) {
      recommendations.push("Aucune classification trouvée - Réviser la description du produit");
    } else if (results[0].confidence < 50) {
      recommendations.push("Confiance faible - Consulter un expert en classification tarifaire");
    } else if (results.length > 1 && results[1].confidence > 60) {
      recommendations.push("Classifications multiples possibles - Examiner les alternatives");
    }
    
    return recommendations;
  }
}
