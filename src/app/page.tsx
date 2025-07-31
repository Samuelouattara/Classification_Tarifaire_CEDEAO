'use client';

import { useState, useEffect } from 'react';
import { TariffAIClassifierComplete } from '@/lib/tariff-ai-classifier-complete';
import { Search, Brain, BarChart3, FileText, Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface ClassificationResult {
  section: {
    number: string;
    title: string;
    chapters: string[];
    description: string;
  };
  score: number;
  confidence: number;
  reasons: string[];
  warnings: string[];
  matchedTerms: Array<{
    keyword: string;
    type: 'primary' | 'secondary' | 'technical';
    matches: Array<{
      type: 'exact' | 'synonym';
      token: string;
      synonym?: string;
    }>;
  }>;
  normalizedScore: number;
  certaintyLevel: string;
  validationStatus: string;
  recommendations: string[];
  requiredClarifications: string[];
}

interface AnalysisReport {
  inputDescription: string;
  analysisTimestamp: string;
  totalSectionsAnalyzed: number;
  results: ClassificationResult[];
  recommendations: string[];
  confidence: number;
  needsHumanValidation: boolean;
}

export default function Home() {
  const [classifier, setClassifier] = useState<TariffAIClassifierComplete | null>(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  useEffect(() => {
    // Initialiser le classificateur côté client
    setClassifier(new TariffAIClassifierComplete());
  }, []);

  const handleClassify = async () => {
    if (!classifier || !description.trim()) return;

    setIsLoading(true);
    try {
      // Simulation d'un délai pour montrer le loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const classificationResults = classifier.classifyWithAI(description);
      const analysisReport = classifier.generateDetailedReport(classificationResults, description);
      
      setResults(classificationResults);
      setReport(analysisReport);
    } catch (error) {
      console.error('Erreur lors de la classification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-blue-600 bg-blue-100';
    if (confidence >= 55) return 'text-yellow-600 bg-yellow-100';
    if (confidence >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusIcon = (validationStatus: string) => {
    switch (validationStatus) {
      case 'VALID':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'UNCERTAIN':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'MULTIPLE_MATCHES':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Classification Tarifaire CEDEAO
                </h1>
                <p className="text-sm text-gray-600">
                  Système d&apos;Intelligence Artificielle - TEC SH 2022
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">21 Sections</p>
                <p className="text-xs text-gray-500">Classification automatique</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Search className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Description du Produit
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Décrivez votre produit en détail
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                placeholder="Ex: Bananes fraîches d'origine tropicale, destinées à la consommation alimentaire..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <button
              onClick={handleClassify}
              disabled={!description.trim() || isLoading || !classifier}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyse en cours...</span>
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  <span>Classifier avec l&apos;IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="space-y-6">
            {/* Statistics */}
            {report && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Statistiques d&apos;Analyse
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Sections analysées</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {report.totalSectionsAnalyzed}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Résultats trouvés</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {report.results.length}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Confiance moyenne</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(report.confidence)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Validation requise</p>
                    <p className={`text-2xl font-bold ${report.needsHumanValidation ? 'text-yellow-600' : 'text-green-600'}`}>
                      {report.needsHumanValidation ? 'Oui' : 'Non'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Classification Results */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Résultats de Classification
                </h3>
              </div>
              
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedSection === result.section.number 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSection(
                      selectedSection === result.section.number 
                        ? null 
                        : result.section.number
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(result.validationStatus)}
                          <h4 className="font-semibold text-gray-900">
                            Section {result.section.number}: {result.section.title}
                          </h4>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {result.section.description}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                            {Math.round(result.confidence)}% de confiance
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {result.certaintyLevel}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            Chapitres: {result.section.chapters.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedSection === result.section.number && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Mots-clés correspondants</h5>
                            <div className="flex flex-wrap gap-1">
                              {result.matchedTerms.length > 0 ? (
                                result.matchedTerms.slice(0, 5).map((term, i) => (
                                  <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                    {term.keyword}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">Aucun terme spécifique détecté</span>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Raisons de la classification</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {result.reasons.length > 0 ? (
                                result.reasons.slice(0, 3).map((reason, i) => (
                                  <li key={i} className="flex items-start space-x-2">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <span>{reason}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-gray-500">Classification basée sur l&apos;analyse sémantique</li>
                              )}
                            </ul>
                          </div>
                        </div>
                        
                        {result.warnings.length > 0 && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h5 className="font-medium text-yellow-800 mb-1">Avertissements</h5>
                            <ul className="text-sm text-yellow-700 space-y-1">
                              {result.warnings.map((warning, i) => (
                                <li key={i}>• {warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {report && report.recommendations.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-amber-800 mb-4">
                  Recommandations
                </h3>
                <ul className="space-y-2">
                  {report.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-amber-700">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Comment utiliser ce système ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 font-semibold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Décrivez votre produit</p>
                <p className="text-gray-600">Soyez précis sur la nature, l&apos;origine et l&apos;usage du produit</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 font-semibold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Analysez les résultats</p>
                <p className="text-gray-600">Examinez les sections proposées et leur niveau de confiance</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 font-semibold">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Validez la classification</p>
                <p className="text-gray-600">Vérifiez les recommandations et consultez un expert si nécessaire</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">
              Système de Classification Tarifaire CEDEAO - TEC SH 2022
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Intelligence Artificielle pour la classification automatique des produits
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
