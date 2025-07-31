'use client';

import React, { useState } from 'react';
import { Search, FileText, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { TariffAIClassifier, ClassificationResult } from '../lib/tariff-classifier-clean';

export default function Home() {
  const [description, setDescription] = useState('');
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [classifier] = useState(() => new TariffAIClassifier());

  const handleClassification = async () => {
    if (!description.trim()) return;
    
    setIsLoading(true);
    try {
      const classificationResults = classifier.classifyWithAI(description);
      setResults(classificationResults);
    } catch (error) {
      console.error('Erreur de classification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-600 bg-green-50';
    if (confidence >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 70) return <CheckCircle2 className="w-4 h-4" />;
    if (confidence >= 50) return <Clock className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Classification Tarifaire CEDEAO
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Système d'Intelligence Artificielle pour la classification automatique des produits 
            selon le Tarif Extérieur Commun de la CEDEAO
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Description du Produit
            </h2>
          </div>
          
          <div className="space-y-4">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre produit en détail (matériaux, usage, forme, origine, etc.)..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            
            <button
              onClick={handleClassification}
              disabled={!description.trim() || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Classification en cours...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Classifier le produit
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Résultats de Classification
            </h2>
            
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {result.section.title}
                      </h3>
                      <p className="text-gray-600">
                        Section {result.section.number} • Chapitres: {result.section.chapters.join(', ')}
                      </p>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                      {getConfidenceIcon(result.confidence)}
                      {result.confidence.toFixed(0)}% de confiance
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">
                    {result.section.description}
                  </p>
                  
                  <div className="text-sm text-gray-600">
                    <strong>Niveau de certitude:</strong> {result.certaintyLevel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
