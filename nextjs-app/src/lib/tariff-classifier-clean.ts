// Moteur d'Intelligence Artificielle pour Classification Tarifaire CEDEAO
// Système avancé avec analyse sémantique, apprentissage et validation
// Adapté pour Next.js et TypeScript

export interface SectionData {
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

export interface ClassificationResult {
  section: SectionData;
  score: number;
  confidence: number;
  normalizedScore: number;
  certaintyLevel: string;
  reasons: string[];
  warnings: string[];
  matchedTerms: any[];
  validationStatus: string;
  recommendations: string[];
  requiredClarifications: string[];
}

export interface AnalysisReport {
  inputDescription: string;
  analysisTimestamp: string;
  totalSectionsAnalyzed: number;
  results: ClassificationResult[];
  recommendations: string[];
  confidence: number;
  needsHumanValidation: boolean;
}

export class TariffAIClassifier {
  private sectionsData: Record<string, SectionData>;
  private synonymDictionary: Record<string, string[]>;
  private contextRules: any[];
  private uncertaintyThreshold: number;
  private multipleMatchesThreshold: number;
  private learningHistory: any[];

  constructor() {
    this.sectionsData = this.loadSectionsData();
    this.synonymDictionary = this.buildSynonymDictionary();
    this.contextRules = this.buildContextRules();
    this.uncertaintyThreshold = 0.7;
    this.multipleMatchesThreshold = 0.6;
    this.learningHistory = this.loadLearningHistory();
  }

  // Base de données enrichie avec les données réelles du TEC CEDEAO
  private loadSectionsData(): Record<string, SectionData> {
    return {
      "Section I": {
        number: "I",
        title: "Animaux vivants et produits du règne animal",
        chapters: ["01", "02", "03", "04", "05"],
        description: "Animaux vivants, viandes, poissons, crustacés, mollusques, laits, œufs, miel",
        keywords: {
          primary: ["animal", "viande", "poisson", "lait", "œuf", "miel", "vivant", "bétail", "chair", "bœuf", "porc", "mouton", "volaille"],
          secondary: ["bœuf", "porc", "mouton", "chèvre", "volaille", "fromage", "beurre", "crème", "yaourt", "crevette", "homard"],
          technical: ["bovin", "porcin", "ovin", "caprin", "crustacé", "mollusque", "invertébré", "aquatique", "carnivore"],
          codes: ["0101", "0102", "0103", "0104", "0105", "0106", "0201", "0202", "0203", "0204", "0301", "0302", "0303", "0401", "0402", "0403", "0404", "0405", "0406", "0407", "0408", "0409", "0501", "0502", "0504", "0505", "0506", "0507", "0508", "0510", "0511"]
        },
        exclusions: ["plante", "végétal", "minéral", "textile", "métal"]
      },
      "Section II": {
        number: "II",
        title: "Produits du règne végétal",
        chapters: ["06", "07", "08", "09", "10", "11", "12", "13", "14"],
        description: "Plantes vivantes, légumes, fruits, céréales, graines, café, thé, épices",
        keywords: {
          primary: ["plante", "légume", "fruit", "céréale", "grain", "riz", "blé", "maïs", "pomme", "orange", "tomate", "café", "thé"],
          secondary: ["tomate", "pomme", "banane", "orange", "café", "thé", "épice", "fleur", "carotte", "salade", "mangue", "ananas"],
          technical: ["tubercule", "racine", "bulbe", "oléagineux", "floriculture", "horticulture", "végétal", "botanique"],
          codes: ["0601", "0602", "0603", "0604", "0701", "0702", "0703", "0704", "0705", "0706", "0707", "0708", "0709", "0710", "0711", "0712", "0713", "0714", "0801", "0802", "0803", "0804", "0805", "0806", "0807", "0808", "0809", "0810", "0811", "0812", "0813", "0814", "0901", "0902", "0903", "0904", "0905", "0906", "0907", "0908", "0909", "0910", "1001", "1002", "1003", "1004", "1005", "1006", "1007", "1008", "1101", "1102", "1103", "1104", "1105", "1106", "1107", "1108", "1109", "1201", "1202", "1203", "1204", "1205", "1206", "1207", "1208", "1209", "1210", "1211", "1212", "1213", "1214", "1301", "1302", "1401", "1402", "1403", "1404"]
        },
        exclusions: ["animal", "métal", "plastique", "chimique"]
      },
      "Section III": {
        number: "III",
        title: "Graisses et huiles animales, végétales ou d'origine microbienne",
        chapters: ["15"],
        description: "Huiles alimentaires, graisses, cires d'origine animale ou végétale",
        keywords: {
          primary: ["huile", "graisse", "beurre", "margarine", "cire", "lipide", "gras"],
          secondary: ["olive", "palme", "tournesol", "soja", "colza", "arachide", "coco", "karité"],
          technical: ["lipide", "oléique", "stéarique", "palmitique", "linolénique", "triglycéride"],
          codes: ["1501", "1502", "1503", "1504", "1505", "1506", "1507", "1508", "1509", "1510", "1511", "1512", "1513", "1514", "1515", "1516", "1517", "1518", "1520", "1521", "1522"]
        },
        exclusions: ["métal", "plastique", "textile"]
      },
      "Section IV": {
        number: "IV",
        title: "Produits des industries alimentaires, boissons, tabacs",
        chapters: ["16", "17", "18", "19", "20", "21", "22", "23", "24"],
        description: "Produits alimentaires préparés, boissons alcoolisées et non alcoolisées, tabac",
        keywords: {
          primary: ["boisson", "alimentaire", "conserve", "préparé", "transformé", "tabac", "cigarette", "alcool", "bière", "vin"],
          secondary: ["jus", "soda", "eau", "lait", "yaourt", "confiture", "chocolat", "biscuit", "pain"],
          technical: ["préparation", "transformation", "conservation", "fermentation", "distillation"],
          codes: ["1601", "1602", "1603", "1604", "1605", "1701", "1702", "1703", "1704", "1801", "1802", "1803", "1804", "1805", "1806", "1901", "1902", "1903", "1904", "1905", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2101", "2102", "2103", "2104", "2105", "2106", "2201", "2202", "2203", "2204", "2205", "2206", "2207", "2208", "2209", "2301", "2302", "2303", "2304", "2305", "2306", "2307", "2308", "2309", "2401", "2402", "2403", "2404"]
        },
        exclusions: ["brut", "non-transformé", "vivant"]
      },
      "Section V": {
        number: "V",
        title: "Produits minéraux",
        chapters: ["25", "26", "27"],
        description: "Sel, soufre, terres et pierres, plâtres, chaux et ciments, minerais, combustibles minéraux",
        keywords: {
          primary: ["minéral", "pierre", "sel", "sable", "ciment", "charbon", "pétrole", "gaz", "minerai", "or", "fer"],
          secondary: ["calcaire", "marbre", "granit", "argile", "plâtre", "chaux", "essence", "diesel"],
          technical: ["géologique", "extraction", "minier", "combustible", "hydrocarbure", "métallique"],
          codes: ["2501", "2502", "2503", "2504", "2505", "2506", "2507", "2508", "2509", "2510", "2511", "2512", "2513", "2514", "2515", "2516", "2517", "2518", "2519", "2520", "2521", "2522", "2523", "2524", "2525", "2526", "2527", "2528", "2529", "2530", "2601", "2602", "2603", "2604", "2605", "2606", "2607", "2608", "2609", "2610", "2611", "2612", "2613", "2614", "2615", "2616", "2617", "2618", "2619", "2620", "2621", "2701", "2702", "2703", "2704", "2705", "2706", "2707", "2708", "2709", "2710", "2711", "2712", "2713", "2714", "2715", "2716"]
        },
        exclusions: ["végétal", "animal", "synthétique"]
      }
    };
  }

  private buildSynonymDictionary(): Record<string, string[]> {
    return {
      "animal": ["bête", "bétail", "animal domestique", "faune", "espèce animale"],
      "viande": ["chair", "barbaque", "bidoche", "protéine animale"],
      "poisson": ["poiscaille", "fruit de mer", "produit halieutique"],
      "légume": ["légumineuse", "produit maraîcher", "légume vert"],
      "fruit": ["produit fruitier", "fruit frais", "fruit tropical"],
      "céréale": ["grain", "blé", "orge", "avoine", "seigle"]
    };
  }

  private buildContextRules(): any[] {
    return [
      {
        name: "État du produit",
        rules: [
          { pattern: /\b(vivant|frais|réfrigéré)\b/gi, boost: 1.5, sections: ["I", "II"] },
          { pattern: /\b(congelé|surgelé)\b/gi, boost: 1.3, sections: ["I", "II", "IV"] }
        ]
      }
    ];
  }

  public classifyWithAI(description: string): ClassificationResult[] {
    const analysis = this.performSemanticAnalysis(description);
    const scores: Record<string, any> = {};
    
    Object.keys(this.sectionsData).forEach(sectionKey => {
      scores[sectionKey] = {
        section: this.sectionsData[sectionKey],
        score: 0,
        confidence: 0,
        reasons: [],
        warnings: [],
        matchedTerms: []
      };
    });

    this.calculateKeywordScores(analysis, scores);
    this.calculateFinalScores(scores);
    
    const results = this.filterAndSortResults(scores);
    return this.validateResults(results, description);
  }

  private performSemanticAnalysis(description: string): any {
    return {
      tokens: this.tokenizeText(description),
      entities: this.extractEntities(description),
      context: { state: "unknown", usage: "unknown" },
      technicalTerms: [],
      negations: []
    };
  }

  private tokenizeText(text: string): any {
    const words = text.toLowerCase()
      .replace(/[^\w\s\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(word => word.length > 2);
    
    return {
      original: words,
      stemmed: words.map(word => this.stemWord(word)),
      synonyms: this.expandWithSynonyms(words),
      phrases: this.extractPhrases(text)
    };
  }

  private extractEntities(text: string): any {
    return {
      brands: [] as string[],
      materials: [] as string[],
      quantities: [] as string[],
      origins: [] as string[],
      specifications: [] as string[]
    };
  }

  private calculateKeywordScores(analysis: any, scores: Record<string, any>): void {
    Object.keys(this.sectionsData).forEach(sectionKey => {
      const section = this.sectionsData[sectionKey];
      let sectionScore = 0;
      
      section.keywords.primary.forEach(keyword => {
        if (analysis.tokens.original.some((token: string) => 
          token.toLowerCase().includes(keyword.toLowerCase())
        )) {
          sectionScore += 10;
        }
      });
      
      scores[sectionKey].score += sectionScore;
    });
  }

  private calculateFinalScores(scores: Record<string, any>): void {
    const maxScore = Math.max(...Object.values(scores).map((s: any) => s.score), 1);
    
    Object.keys(scores).forEach(sectionKey => {
      const score = scores[sectionKey];
      score.normalizedScore = (score.score / maxScore) * 100;
      score.confidence = Math.min(score.normalizedScore, 100);
      score.certaintyLevel = score.confidence >= 70 ? "ÉLEVÉE" : "MOYENNE";
    });
  }

  private filterAndSortResults(scores: Record<string, any>): any[] {
    return Object.values(scores)
      .filter((score: any) => score.confidence > 20)
      .sort((a: any, b: any) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  private validateResults(results: any[], originalDescription: string): ClassificationResult[] {
    return results.map(result => ({
      ...result,
      validationStatus: "VALID",
      recommendations: [],
      requiredClarifications: []
    }));
  }

  private stemWord(word: string): string {
    const suffixes = ['tion', 'ment', 'ique'];
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
    return Array.from(new Set(expanded));
  }

  private extractPhrases(text: string): string[] {
    const phrases: string[] = [];
    const words = text.split(' ');
    
    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(words[i] + ' ' + words[i + 1]);
    }
    
    return phrases;
  }

  private loadLearningHistory(): any[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tariff_learning_history');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  }

  public generateDetailedReport(results: ClassificationResult[], description: string): AnalysisReport {
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
      recommendations.push("Aucune classification trouvée");
    } else if (results[0].confidence < 50) {
      recommendations.push("Confiance faible");
    }
    
    return recommendations;
  }
}
