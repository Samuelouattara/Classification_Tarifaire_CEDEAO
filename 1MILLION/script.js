// Système de Classification Tarifaire CEDEAO
// Base de données des sections tarifaires basée sur le TEC CEDEAO SH 2022

// Structure complète basée sur le document officiel TEC CEDEAO avec règles précises
const sectionsData = {
    "Section I": {
        number: "I",
        title: "Animaux vivants et produits du règne animal",
        chapters: ["01", "02", "03", "04", "05"],
        description: "Animaux vivants, viandes et abats comestibles, poissons et crustacés, mollusques et autres invertébrés aquatiques, laits et produits de la laiterie, œufs d'oiseaux, miel naturel, autres produits d'origine animale",
        keywords: ["animal", "vivant", "cheval", "âne", "mulet", "bovin", "porcin", "ovin", "caprin", "volaille", "coq", "poule", "canard", "oie", "dindon", "pintade", "viande", "abat", "comestible", "poisson", "crustacé", "mollusque", "invertébré", "aquatique", "lait", "crème", "yoghourt", "fromage", "beurre", "œuf", "miel", "crin", "laine", "poil", "plume", "duvet", "peau", "cuir", "boyau"],
        // Règles spécifiques pour éviter les confusions
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section II": {
        number: "II", 
        title: "Produits du règne végétal",
        chapters: ["06", "07", "08", "09", "10", "11", "12", "13", "14"],
        description: "Plantes vivantes et produits de la floriculture, légumes, plantes, racines et tubercules alimentaires, fruits comestibles, café, thé, maté et épices, céréales, produits de la minoterie, graines et fruits oléagineux, gommes, résines et autres sucs et extraits végétaux, matières à tresser",
        keywords: ["plante", "vivant", "floriculture", "légume", "racine", "tubercule", "alimentaire", "pomme de terre", "tomate", "oignon", "échalote", "ail", "poireau", "chou", "chou-fleur", "laitue", "chicorée", "carotte", "navet", "betterave", "salsifis", "concombre", "cornichon", "fruit", "comestible", "agrume", "melon", "café", "thé", "maté", "épice", "céréale", "froment", "blé", "méteil", "seigle", "orge", "avoine", "maïs", "riz", "sarrasin", "millet", "alpiste", "quinoa", "triticale", "minoterie", "malt", "amidon", "fécule", "inuline", "gluten", "graine", "oléagineux", "semence", "industriel", "médicinal", "paille", "fourrage", "gomme", "résine", "suc", "extrait", "végétal", "tresser", "vannerie", "osier", "bambou", "rotin"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section III": {
        number: "III",
        title: "Graisses et huiles animales, végétales ou d'origine microbienne et produits de leur dissociation; graisses alimentaires élaborées; cires d'origine animale ou végétale",
        chapters: ["15"],
        description: "Graisses et huiles animales, végétales ou d'origine microbienne et produits de leur dissociation ; graisses alimentaires élaborées ; cires d'origine animale ou végétale",
        keywords: ["graisse", "huile", "animale", "végétale", "microbienne", "dissociation", "alimentaire", "élaborée", "cire", "margarine", "beurre", "saindoux", "suif", "olives", "tournesol", "colza", "soja", "arachide", "palme", "coprah", "lin", "ricin", "sésame"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section IV": {
        number: "IV",
        title: "Produits des industries alimentaires; boissons, liquides alcooliques et vinaigres; tabacs et succédanés de tabac fabriqués",
        chapters: ["16", "17", "18", "19", "20", "21", "22", "23", "24"],
        description: "Préparations de viande, de poissons, de crustacés, de mollusques, d'autres invertébrés aquatiques ou d'insectes, sucres et sucreries, cacao et ses préparations, préparations à base de céréales, de farines, d'amidons, de fécules ou de lait; pâtisseries, préparations de légumes, de fruits ou d'autres parties de plantes, préparations alimentaires diverses, boissons, liquides alcooliques et vinaigres, résidus et déchets des industries alimentaires; aliments préparés pour animaux, tabacs et succédanés de tabac fabriqués",
        keywords: ["préparation", "viande", "poisson", "crustacé", "mollusque", "invertébré", "insecte", "sucre", "sucrerie", "cacao", "chocolat", "céréale", "farine", "amidon", "fécule", "lait", "pâtisserie", "biscuit", "pain", "légume", "fruit", "partie", "plante", "conserve", "confiture", "gelée", "marmelade", "alimentaire", "divers", "boisson", "alcoolique", "vinaigre", "bière", "vin", "spiritueux", "eau", "jus", "résidu", "déchet", "industrie", "aliment", "animal", "tabac", "succédané", "fabriqué", "cigarette", "cigare", "nicotine", "inhalation", "combustion"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section V": {
        number: "V",
        title: "Produits minéraux",
        chapters: ["25", "26", "27"],
        description: "Sel; soufre; terres et pierres; plâtres, chaux et ciments, minerais, scories et cendres, combustibles minéraux, huiles minérales et produits de leur distillation; matières bitumineuses; cires minérales",
        keywords: ["sel", "soufre", "terre", "pierre", "plâtre", "chaux", "ciment", "minerai", "scorie", "cendre", "combustible", "minéral", "huile", "distillation", "bitumineux", "cire", "charbon", "coke", "lignite", "tourbe", "pétrole", "essence", "kérosène", "gazole", "fuel", "gaz", "asphalte", "goudron"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section VI": {
        number: "VI",
        title: "Produits des industries chimiques ou des industries connexes",
        chapters: ["28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38"],
        description: "Produits chimiques inorganiques; composés inorganiques ou organiques de métaux précieux, d'éléments radioactifs, de métaux des terres rares ou d'isotopes, produits chimiques organiques, produits pharmaceutiques, engrais, extraits tannants ou tinctoriaux; tanins et leurs dérivés; pigments et autres matières colorantes; peintures et vernis; mastics; encres, huiles essentielles et résinoïdes; produits de parfumerie ou de toilette préparés et préparations cosmétiques, savons, agents de surface organiques, préparations pour lessives, préparations lubrifiantes, cires artificielles, cires préparées, produits d'entretien, bougies et articles similaires, pâtes à modeler, matières albuminoïdes; produits à base d'amidons ou de fécules modifiés; colles; enzymes, poudres et explosifs; articles de pyrotechnie; allumettes; alliages pyrophoriques; matières inflammables, produits photographiques ou cinématographiques, produits divers des industries chimiques",
        keywords: ["chimique", "inorganique", "composé", "métal", "précieux", "radioactif", "terre", "rare", "isotope", "organique", "pharmaceutique", "médicament", "engrais", "extrait", "tannant", "tinctorial", "tanin", "dérivé", "pigment", "colorant", "peinture", "vernis", "mastic", "encre", "huile", "essentielle", "résinoïde", "parfumerie", "toilette", "préparé", "cosmétique", "savon", "agent", "surface", "lessive", "lubrifiant", "artificiel", "entretien", "bougie", "similaire", "pâte", "modeler", "albuminoïde", "amidon", "fécule", "modifié", "colle", "enzyme", "poudre", "explosif", "pyrotechnie", "allumette", "alliage", "pyrophorique", "inflammable", "photographique", "cinématographique", "divers"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section VII": {
        number: "VII",
        title: "Matières plastiques et ouvrages en ces matières; caoutchouc et ouvrages en caoutchouc",
        chapters: ["39", "40"],
        description: "Matières plastiques et ouvrages en ces matières, caoutchouc et ouvrages en caoutchouc",
        keywords: ["plastique", "matière", "ouvrage", "caoutchouc", "polymère", "résine", "polyéthylène", "polypropylène", "polystyrène", "PVC", "polyuréthane", "silicone", "élastomère", "pneumatique", "pneu", "chambre", "air", "tube", "tuyau", "courroie", "joint", "garniture"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section VIII": {
        number: "VIII",
        title: "Peaux, cuirs, pelleteries et ouvrages en ces matières; articles de bourrellerie ou de sellerie; articles de voyage, sacs à main et contenants similaires; ouvrages en boyaux",
        chapters: ["41", "42", "43"],
        description: "Peaux (autres que les pelleteries) et cuirs, ouvrages en cuir; articles de bourrellerie ou de sellerie; articles de voyage, sacs à main et contenants similaires; ouvrages en boyaux, pelleteries et fourrures; pelleteries factices",
        keywords: ["peau", "cuir", "pelleterie", "ouvrage", "bourrellerie", "sellerie", "voyage", "sac", "main", "contenant", "similaire", "boyau", "fourrure", "factice", "maroquinerie", "chaussure", "ceinture", "portefeuille", "valise", "mallette", "sacoche", "gibecière"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section IX": {
        number: "IX",
        title: "Bois, charbon de bois et ouvrages en bois; liège et ouvrages en liège; ouvrages de sparterie ou de vannerie",
        chapters: ["44", "45", "46"],
        description: "Bois, charbon de bois et ouvrages en bois, liège et ouvrages en liège, ouvrages de sparterie ou de vannerie",
        keywords: ["bois", "charbon", "ouvrage", "liège", "sparterie", "vannerie", "sciage", "placage", "contreplaqué", "aggloméré", "panneau", "menuiserie", "charpente", "meuble", "caisse", "tonneau", "outil", "manche", "bouchon", "panier", "corbeille", "natte", "osier", "bambou", "rotin", "raphia"],
        exclusions: ["jouet", "jeu", "divertissement", "sport"],
        priority: 1
    },
    "Section X": {
        number: "X",
        title: "Pâtes de bois ou d'autres matières fibreuses cellulosiques; papier ou carton à recycler (déchets et rebuts); papier et ses applications",
        chapters: ["47", "48", "49"],
        description: "Pâtes de bois ou d'autres matières fibreuses cellulosiques; papier ou carton à recycler (déchets et rebuts), papiers et cartons; ouvrages en pâte de cellulose, en papier ou en carton, produits de l'édition, de la presse ou des autres industries graphiques; textes manuscrits ou dactylographiés et plans",
        keywords: ["pâte", "bois", "matière", "fibreuse", "cellulosique", "papier", "carton", "recycler", "déchet", "rebut", "ouvrage", "cellulose", "édition", "presse", "industrie", "graphique", "texte", "manuscrit", "dactylographié", "plan", "journal", "livre", "magazine", "cahier", "enveloppe", "sac", "boîte", "emballage"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section XI": {
        number: "XI",
        title: "Matières textiles et ouvrages en ces matières",
        chapters: ["50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63"],
        description: "Soie, laine, poils fins ou grossiers; fils et tissus de crin, coton, autres fibres textiles végétales; fils de papier et tissus de fils de papier, filaments synthétiques ou artificiels; lames et formes similaires en matières textiles synthétiques ou artificielles, fibres synthétiques ou artificielles discontinues, ouates, feutres et nontissés; fils spéciaux; ficelles, cordes et cordages; articles de corderie, tapis et autres revêtements de sol en matières textiles, tissus spéciaux; surfaces textiles touffetées; dentelles; tapisseries; passementeries; broderies, tissus imprégnés, enduits, recouverts ou stratifiés; articles techniques en matières textiles, étoffes de bonneterie, vêtements et accessoires du vêtement, en bonneterie, vêtements et accessoires du vêtement, autres qu'en bonneterie, autres articles textiles confectionnés; assortiments; friperie et chiffons",
        keywords: ["textile", "matière", "ouvrage", "soie", "laine", "poil", "fin", "grossier", "fil", "tissu", "crin", "coton", "fibre", "végétale", "papier", "filament", "synthétique", "artificiel", "lame", "forme", "similaire", "discontinu", "ouate", "feutre", "nontissé", "spécial", "ficelle", "corde", "cordage", "corderie", "tapis", "revêtement", "sol", "spéciaux", "surface", "touffetée", "dentelle", "tapisserie", "passementerie", "broderie", "imprégné", "enduit", "recouvert", "stratifié", "technique", "étoffe", "bonneterie", "vêtement", "accessoire", "confectionné", "assortiment", "friperie", "chiffon", "chemise", "pantalon", "robe", "jupe", "veste", "manteau", "pull", "tricot"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section XII": {
        number: "XII",
        title: "Chaussures, coiffures, parapluies, parasols, cannes, fouets, cravaches et leurs parties; plumes apprêtées et articles en plumes; fleurs artificielles; ouvrages en cheveux",
        chapters: ["64", "65", "66", "67"],
        description: "Chaussures, guêtres et articles analogues; parties de ces objets, coiffures et parties de coiffures, parapluies, ombrelles, parasols, cannes, cannes-sièges, fouets, cravaches et leurs parties, plumes et duvet apprêtés et articles en plumes ou en duvet; fleurs artificielles; ouvrages en cheveux",
        keywords: ["chaussure", "guêtre", "analogue", "partie", "objet", "coiffure", "parapluie", "ombrelle", "parasol", "canne", "siège", "fouet", "cravache", "plume", "duvet", "apprêté", "fleur", "artificielle", "cheveu", "soulier", "botte", "sandale", "espadrille", "chapeau", "casquette", "béret", "bonnet"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section XIII": {
        number: "XIII",
        title: "Ouvrages en pierres, plâtre, ciment, amiante, mica ou matières analogues; produits céramiques; verre et ouvrages en verre",
        chapters: ["68", "69", "70"],
        description: "Ouvrages en pierres, plâtre, ciment, amiante, mica ou matières analogues, produits céramiques, verre et ouvrages en verre",
        keywords: ["ouvrage", "pierre", "plâtre", "ciment", "amiante", "mica", "matière", "analogue", "céramique", "verre", "marbre", "granit", "ardoise", "grès", "béton", "mortier", "enduit", "carreau", "tuile", "brique", "porcelaine", "faïence", "poterie", "cristal", "vitre", "bouteille", "vase", "gobelet"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section XIV": {
        number: "XIV",
        title: "Perles fines ou de culture, pierres gemmes ou similaires, métaux précieux, plaqués ou doublés de métaux précieux et ouvrages en ces matières; bijouterie de fantaisie; monnaies",
        chapters: ["71"],
        description: "Perles fines ou de culture, pierres gemmes ou similaires, métaux précieux, plaqués ou doublés de métaux précieux et ouvrages en ces matières; bijouterie de fantaisie; monnaies",
        keywords: ["perle", "fin", "culture", "pierre", "gemme", "similaire", "métal", "précieux", "plaqué", "doublé", "ouvrage", "matière", "bijouterie", "fantaisie", "monnaie", "or", "argent", "platine", "palladium", "diamant", "émeraude", "rubis", "saphir", "bijou", "joaillerie", "bague", "collier", "bracelet", "boucle", "oreille", "médaille", "pièce"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section XV": {
        number: "XV",
        title: "Métaux communs et ouvrages en ces métaux",
        chapters: ["72", "73", "74", "75", "76", "78", "79", "80", "81", "82", "83"],
        description: "Fonte, fer et acier, ouvrages en fonte, fer ou acier, cuivre et ouvrages en cuivre, nickel et ouvrages en nickel, aluminium et ouvrages en aluminium, plomb et ouvrages en plomb, zinc et ouvrages en zinc, étain et ouvrages en étain, autres métaux communs; cermets; ouvrages en ces matières, outils et outillage, articles de coutellerie et couverts de table, en métaux communs; parties de ces articles, en métaux communs, ouvrages divers en métaux communs",
        keywords: ["métal", "commun", "ouvrage", "fonte", "fer", "acier", "cuivre", "nickel", "aluminium", "plomb", "zinc", "étain", "autre", "cermet", "matière", "outil", "outillage", "coutellerie", "couvert", "table", "partie", "divers", "tôle", "barre", "profilé", "tube", "fil", "clou", "vis", "boulon", "écrou", "ressort", "chaîne", "serrure", "charnière", "robinet", "couteau", "fourchette", "cuillère"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section XVI": {
        number: "XVI",
        title: "Machines et appareils, matériel électrique et leurs parties; appareils d'enregistrement ou de reproduction du son, appareils d'enregistrement ou de reproduction des images et du son en télévision, et parties et accessoires de ces appareils",
        chapters: ["84", "85"],
        description: "Réacteurs nucléaires, chaudières, machines, appareils et engins mécaniques; parties de ces machines ou appareils, machines, appareils et matériels électriques et leurs parties; appareils d'enregistrement ou de reproduction du son, appareils d'enregistrement ou de reproduction des images et du son en télévision, et parties et accessoires de ces appareils",
        keywords: ["machine", "appareil", "matériel", "électrique", "partie", "enregistrement", "reproduction", "son", "image", "télévision", "accessoire", "réacteur", "nucléaire", "chaudière", "engin", "mécanique", "moteur", "pompe", "compresseur", "turbine", "générateur", "transformateur", "ordinateur", "téléphone", "radio", "télévision", "caméra", "magnétophone", "lecteur", "amplificateur", "haut-parleur"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section XVII": {
        number: "XVII",
        title: "Matériel de transport",
        chapters: ["86", "87", "88", "89"],
        description: "Véhicules et matériel pour voies ferrées ou similaires et leurs parties; appareils mécaniques (y compris électromécaniques) de signalisation pour voies de communication, voitures automobiles, tracteurs, cycles et autres véhicules terrestres, leurs parties et accessoires, navigation aérienne ou spatiale, navigation maritime ou fluviale",
        keywords: ["matériel", "transport", "véhicule", "voie", "ferrée", "similaire", "partie", "appareil", "mécanique", "électromécanique", "signalisation", "communication", "voiture", "automobile", "tracteur", "cycle", "terrestre", "accessoire", "navigation", "aérienne", "spatiale", "maritime", "fluviale", "train", "locomotive", "wagon", "tramway", "métro", "auto", "camion", "autobus", "moto", "bicyclette", "avion", "hélicoptère", "planeur", "bateau", "navire", "yacht", "canot"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section XVIII": {
        number: "XVIII",
        title: "Instruments et appareils d'optique, de photographie ou de cinématographie, de mesure, de contrôle ou de précision; instruments et appareils médico-chirurgicaux; horlogerie; instruments de musique; parties et accessoires de ces instruments ou appareils",
        chapters: ["90", "91", "92"],
        description: "Instruments et appareils d'optique, de photographie ou de cinématographie, de mesure, de contrôle ou de précision; instruments et appareils médico-chirurgicaux; parties et accessoires de ces instruments ou appareils, horlogerie, instruments de musique; parties et accessoires de ces instruments",
        keywords: ["instrument", "appareil", "optique", "photographie", "cinématographie", "mesure", "contrôle", "précision", "médico", "chirurgical", "partie", "accessoire", "horlogerie", "musique", "lunette", "microscope", "télescope", "jumelle", "lentille", "prisme", "appareil", "photo", "caméra", "objectif", "thermomètre", "manomètre", "balance", "règle", "compas", "médical", "stéthoscope", "seringue", "bistouri", "prothèse", "montre", "horloge", "pendule", "réveil", "piano", "guitare", "violon", "flûte", "trompette", "tambour"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section XIX": {
        number: "XIX",
        title: "Armes, munitions et leurs parties et accessoires",
        chapters: ["93"],
        description: "Armes, munitions et leurs parties et accessoires",
        keywords: ["arme", "munition", "partie", "accessoire", "fusil", "pistolet", "revolver", "carabine", "mitraillette", "canon", "cartouche", "balle", "projectile", "poudre", "amorce", "étui", "culasse", "canon", "crosse", "gâchette", "viseur", "silencieux", "militaire", "chasse", "sport", "défense"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    },
    "Section XX": {
        number: "XX",
        title: "Marchandises et produits divers",
        chapters: ["94", "95", "96"],
        description: "Meubles; mobilier médico-chirurgical; articles de literie et similaires; luminaires et appareils d'éclairage non dénommés ni compris ailleurs; lampes-réclames, enseignes lumineuses, plaques indicatrices lumineuses et articles similaires; constructions préfabriquées, jouets, jeux, articles pour divertissements ou pour sports; leurs parties et accessoires, ouvrages divers",
        keywords: ["marchandise", "produit", "divers", "meuble", "mobilier", "médico", "chirurgical", "literie", "similaire", "luminaire", "éclairage", "dénommé", "compris", "ailleurs", "lampe", "réclame", "enseigne", "lumineuse", "plaque", "indicatrice", "construction", "préfabriquée", "jouet", "jeu", "divertissement", "sport", "partie", "accessoire", "ouvrage", "siège", "table", "armoire", "lit", "matelas", "oreiller", "ampoule", "lustre", "applique", "maison", "bâtiment", "poupée", "peluche", "puzzle", "carte", "ballon", "raquette", "ski", "patin", "brosse", "peigne", "stylo", "crayon", "bouton", "fermeture", "éclair"],
        // Section XX a une priorité plus basse car elle est générique
        priority: 2
    },
    "Section XXI": {
        number: "XXI",
        title: "Objets d'art, de collection ou d'antiquité",
        chapters: ["97"],
        description: "Objets d'art, de collection ou d'antiquité",
        keywords: ["objet", "art", "collection", "antiquité", "œuvre", "tableau", "peinture", "sculpture", "dessin", "gravure", "estampe", "lithographie", "photographie", "artistique", "artisanat", "traditionnel", "culturel", "patrimoine", "musée", "galerie", "exposition", "collectionneur", "amateur", "ancien", "historique", "précieux", "rare", "unique"],
        exclusions: ["jouet", "jeu", "divertissement", "sport", "meuble", "mobilier", "luminaire", "éclairage"],
        priority: 1
    }
};

// Règles spécifiques pour les classifications prioritaires
const specificRules = {
    // Jouets et jeux -> Section XX Chapitre 95
    "jouet": { section: "XX", chapter: "95", priority: 10 },
    "jeu": { section: "XX", chapter: "95", priority: 10 },
    "divertissement": { section: "XX", chapter: "95", priority: 10 },
    "sport": { section: "XX", chapter: "95", priority: 10 },
    "poupée": { section: "XX", chapter: "95", priority: 10 },
    "peluche": { section: "XX", chapter: "95", priority: 10 },
    "puzzle": { section: "XX", chapter: "95", priority: 10 },
    "ballon": { section: "XX", chapter: "95", priority: 10 },
    "raquette": { section: "XX", chapter: "95", priority: 10 },
    "ski": { section: "XX", chapter: "95", priority: 10 },
    "patin": { section: "XX", chapter: "95", priority: 10 },
    
    // Poissons -> Section I Chapitre 03
    "poisson": { section: "I", chapter: "03", priority: 10 },
    "crustacé": { section: "I", chapter: "03", priority: 10 },
    "mollusque": { section: "I", chapter: "03", priority: 10 },
    "aquatique": { section: "I", chapter: "03", priority: 10 },
    "saumon": { section: "I", chapter: "03", priority: 10 },
    "thon": { section: "I", chapter: "03", priority: 10 },
    "morue": { section: "I", chapter: "03", priority: 10 },
    "crevette": { section: "I", chapter: "03", priority: 10 },
    "huître": { section: "I", chapter: "03", priority: 10 },
    "moule": { section: "I", chapter: "03", priority: 10 },
    
    // Meubles -> Section XX Chapitre 94
    "meuble": { section: "XX", chapter: "94", priority: 10 },
    "mobilier": { section: "XX", chapter: "94", priority: 10 },
    "siège": { section: "XX", chapter: "94", priority: 10 },
    "table": { section: "XX", chapter: "94", priority: 10 },
    "armoire": { section: "XX", chapter: "94", priority: 10 },
    "lit": { section: "XX", chapter: "94", priority: 10 },
    "matelas": { section: "XX", chapter: "94", priority: 10 },
    "oreiller": { section: "XX", chapter: "94", priority: 10 },
    
    // Luminaires -> Section XX Chapitre 94
    "luminaire": { section: "XX", chapter: "94", priority: 10 },
    "éclairage": { section: "XX", chapter: "94", priority: 10 },
    "ampoule": { section: "XX", chapter: "94", priority: 10 },
    "lustre": { section: "XX", chapter: "94", priority: 10 },
    "applique": { section: "XX", chapter: "94", priority: 10 },
    
    // Viandes -> Section I Chapitre 02
    "viande": { section: "I", chapter: "02", priority: 10 },
    "bœuf": { section: "I", chapter: "02", priority: 10 },
    "porc": { section: "I", chapter: "02", priority: 10 },
    "mouton": { section: "I", chapter: "02", priority: 10 },
    "agneau": { section: "I", chapter: "02", priority: 10 },
    "veau": { section: "I", chapter: "02", priority: 10 },
    "poulet": { section: "I", chapter: "02", priority: 10 },
    "volaille": { section: "I", chapter: "02", priority: 10 },
    
    // Vêtements -> Section XI
    "vêtement": { section: "XI", chapter: "61", priority: 10 },
    "chemise": { section: "XI", chapter: "61", priority: 10 },
    "pantalon": { section: "XI", chapter: "61", priority: 10 },
    "robe": { section: "XI", chapter: "61", priority: 10 },
    "jupe": { section: "XI", chapter: "61", priority: 10 },
    "veste": { section: "XI", chapter: "61", priority: 10 },
    "manteau": { section: "XI", chapter: "61", priority: 10 },
    
    // Chaussures -> Section XII Chapitre 64
    "chaussure": { section: "XII", chapter: "64", priority: 10 },
    "soulier": { section: "XII", chapter: "64", priority: 10 },
    "botte": { section: "XII", chapter: "64", priority: 10 },
    "sandale": { section: "XII", chapter: "64", priority: 10 },
    "espadrille": { section: "XII", chapter: "64", priority: 10 }
};
function classifyProduct(description) {
    const results = [];
    const descriptionLower = description.toLowerCase();
    
    // Nettoyer et tokeniser la description
    const words = descriptionLower
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
    
    // Vérifier d'abord les règles spécifiques
    let specificMatch = null;
    let highestPriority = 0;
    
    for (const [keyword, rule] of Object.entries(specificRules)) {
        if (descriptionLower.includes(keyword)) {
            if (rule.priority > highestPriority) {
                highestPriority = rule.priority;
                specificMatch = rule;
            }
        }
    }
    
    // Si on a une règle spécifique, l'appliquer en priorité
    if (specificMatch) {
        const section = Object.values(sectionsData).find(s => s.number === specificMatch.section);
        if (section) {
            results.push({
                section: section,
                score: 100,
                confidence: 95,
                matchedKeywords: [Object.keys(specificRules).find(k => specificRules[k] === specificMatch)],
                specificRule: true,
                chapter: specificMatch.chapter
            });
        }
    }
    
    // Calculer les scores pour chaque section (sans les exclusions)
    Object.values(sectionsData).forEach(section => {
        // Vérifier les exclusions
        let hasExclusion = false;
        section.exclusions.forEach(exclusion => {
            if (descriptionLower.includes(exclusion)) {
                hasExclusion = true;
            }
        });
        
        if (hasExclusion) {
            return; // Ignorer cette section si elle contient des mots exclus
        }
        
        let score = 0;
        let matchedKeywords = [];
        
        section.keywords.forEach(keyword => {
            if (descriptionLower.includes(keyword)) {
                score += keyword.length; // Mots plus longs = score plus élevé
                matchedKeywords.push(keyword);
            }
        });
        
        // Bonus pour les mots exacts
        words.forEach(word => {
            if (section.keywords.includes(word)) {
                score += 5;
            }
        });
        
        // Ajuster le score selon la priorité de la section
        score = score / section.priority;
        
        if (score > 0) {
            results.push({
                section: section,
                score: score,
                confidence: Math.min(Math.round((score / words.length) * 20), 100),
                matchedKeywords: matchedKeywords,
                specificRule: false
            });
        }
    });
    
    // Trier par score décroissant
    results.sort((a, b) => b.score - a.score);
    
    return results.slice(0, 3); // Retourner les 3 meilleurs résultats
}

// Fonction pour afficher les résultats de classification
function displayResults(results) {
    const resultsContainer = document.getElementById('classification-result');
    const specificCodesContainer = document.getElementById('specific-codes');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <h4 class="text-xl font-bold text-red-600 mb-3">❌ Aucune classification trouvée</h4>
                <p class="text-red-700">Essayez avec une description plus détaillée ou consultez manuellement les sections ci-dessous.</p>
            </div>
        `;
        specificCodesContainer.classList.add('hidden');
        return;
    }
    
    resultsContainer.innerHTML = '';
    
    results.forEach((result, index) => {
        const item = document.createElement('div');
        // Transformé : classification-item fade-in -> Tailwind avec animation
        item.className = 'bg-white/95 border border-douane-or/30 rounded-xl p-6 mb-4 shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 translate-y-4 animate-fade-in text-gray-800';
        item.style.animationDelay = `${index * 0.1}s`;
        item.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`;
        
        // Transformé : high-confidence, medium-confidence, low-confidence -> Tailwind
        let confidenceClass;
        if (result.confidence >= 70) {
            confidenceClass = 'bg-green-100 text-green-800 border-green-300';
        } else if (result.confidence >= 40) {
            confidenceClass = 'bg-yellow-100 text-yellow-800 border-yellow-300';
        } else {
            confidenceClass = 'bg-red-100 text-red-800 border-red-300';
        }
        
        item.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <span class="px-4 py-2 rounded-full text-sm font-semibold border ${confidenceClass}">${result.confidence}% de confiance</span>
                <span class="bg-douane-vert text-white px-4 py-2 rounded-full font-bold text-lg">Section ${result.section.number}</span>
            </div>
            <h4 class="text-2xl font-bold text-douane-vert mb-3">${result.section.title}</h4>
            <p class="mb-3"><strong class="text-douane-or">Chapitres concernés:</strong> <span class="text-gray-700">${result.section.chapters.join(', ')}</span></p>
            <p class="mb-3"><strong class="text-douane-or">Description:</strong> <span class="text-gray-700">${result.section.description}</span></p>
            <p><strong class="text-douane-or">Mots-clés correspondants:</strong> 
                <span class="inline-flex flex-wrap gap-2 mt-1">
                    ${result.matchedKeywords.map(keyword => 
                        `<span class="bg-douane-vert/20 text-douane-vert px-3 py-1 rounded-full text-sm font-medium border border-douane-vert/30">${keyword}</span>`
                    ).join('')}
                </span>
            </p>
        `;
        
        resultsContainer.appendChild(item);
    });
    
    // Rechercher des codes tarifaires spécifiques
    if (typeof rechercherCodesSpecifiques === 'function') {
        const codesSpecifiques = rechercherCodesSpecifiques(document.getElementById('product-description').value);
        displaySpecificCodes(codesSpecifiques);
    }
}

// Fonction pour afficher les codes tarifaires spécifiques
function displaySpecificCodes(codes) {
    const specificCodesContainer = document.getElementById('specific-codes');
    const codesListContainer = document.getElementById('codes-list');
    
    if (codes.length === 0) {
        specificCodesContainer.classList.add('hidden');
        return;
    }
    
    specificCodesContainer.classList.remove('hidden');
    codesListContainer.innerHTML = '';
    
    codes.forEach(code => {
        const item = document.createElement('div');
        // Transformé : code-item fade-in -> Tailwind
        item.className = 'flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-douane-or/50 transition-all duration-300 opacity-0 translate-y-2 animate-fade-in';
        
        let typeLabel = '';
        let typeBadgeClass = '';
        switch(code.type) {
            case 'code_principal': 
                typeLabel = '📂 Code principal';
                typeBadgeClass = 'bg-douane-vert text-white';
                break;
            case 'sous_code': 
                typeLabel = '🎯 Code spécifique';
                typeBadgeClass = 'bg-douane-or text-douane-vert';
                break;
            case 'mot_cle': 
                typeLabel = '🔍 Trouvé par mot-clé';
                typeBadgeClass = 'bg-vert-ci text-white';
                break;
        }
        
        item.innerHTML = `
            <div class="bg-douane-vert/10 border border-douane-vert/30 rounded-lg px-4 py-2 min-w-fit">
                <span class="font-mono text-lg font-bold text-douane-vert">${code.code}</span>
            </div>
            <div class="flex-1 space-y-2">
                <div class="flex items-center gap-2">
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${typeBadgeClass}">${typeLabel}</span>
                </div>
                <p class="text-gray-800 leading-relaxed">${code.description}</p>
                ${code.motCle ? `<p class="text-sm text-gray-600 italic">Mot-clé: "${code.motCle}"</p>` : ''}
                ${code.codeParent ? `<p class="text-sm text-gray-600 italic">Code parent: ${code.codeParent}</p>` : ''}
            </div>
        `;
        
        codesListContainer.appendChild(item);
    });
}

// Fonction pour afficher les détails d'une section
function showSectionDetails(section) {
    alert(`Section ${section.number}: ${section.title}\n\nChapitres: ${section.chapters.join(', ')}\n\nDescription: ${section.description}\n\nMots-clés: ${section.keywords.join(', ')}`);
}

// Événements
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter les animations CSS avec Tailwind
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(1rem);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in {
            animation: fadeInUp 0.6s ease-out forwards;
        }
    `;
    document.head.appendChild(style);
    
    // Charger les sections
    loadSections();
    
    // Gestionnaire pour le bouton de classification
    const classifyBtn = document.getElementById('classify-btn');
    const productDescription = document.getElementById('product-description');
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    
    classifyBtn.addEventListener('click', function() {
        const description = productDescription.value.trim();
        
        if (!description) {
            alert('Veuillez saisir une description du produit.');
            return;
        }
        
        // Afficher le loading
        loadingDiv.classList.remove('hidden');
        resultsDiv.classList.add('hidden');
        
        // Simuler un délai de traitement
        setTimeout(() => {
            const results = classifyProduct(description);
            displayResults(results);
            
            // Masquer le loading et afficher les résultats
            loadingDiv.classList.add('hidden');
            resultsDiv.classList.remove('hidden');
            
            // Faire défiler vers les résultats
            resultsDiv.scrollIntoView({ behavior: 'smooth' });
        }, 1500);
    });
    
    // Permettre la classification avec la touche Entrée
    productDescription.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            classifyBtn.click();
        }
    });
});

// Fonction pour ajouter de nouvelles données tarifaires
function addTariffData(sectionNumber, newData) {
    if (sectionsData[`Section ${sectionNumber}`]) {
        // Ajouter des mots-clés supplémentaires
        if (newData.keywords) {
            sectionsData[`Section ${sectionNumber}`].keywords.push(...newData.keywords);
        }
        
        // Mettre à jour la description si fournie
        if (newData.description) {
            sectionsData[`Section ${sectionNumber}`].description = newData.description;
        }
        
        console.log(`Section ${sectionNumber} mise à jour`);
    }
}

// Fonction d'export pour debugging
function exportClassificationData() {
    console.log('Données de classification:', JSON.stringify(sectionsData, null, 2));
}

// Rendre les fonctions disponibles globalement pour tests
window.classifyProductCorrected = classifyProductCorrected;
window.generateCorrectTariffCode = generateCorrectTariffCode;
window.testCorrectedClassification = testCorrectedClassification;

console.log('✅ Système de classification corrigé chargé!');
console.log('🧪 Utilisez testCorrectedClassification() pour tester');
console.log('🔄 Utilisez addProductToTableCorrected() au lieu de addProductToTable()');
window.exportClassificationData = exportClassificationData;
