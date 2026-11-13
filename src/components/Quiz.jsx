import { useState } from 'react';
import { ArrowLeft, CheckCircle, Recycle } from 'lucide-react';
import { disposalRules } from '../utils/pfandRules';

export default function Quiz({ onBack, onAddPoints }) {
  const [step, setStep] = useState(0);
  const [material, setMaterial] = useState(null);
  const [isClean, setIsClean] = useState(null);
  const [result, setResult] = useState(null);

  const materials = [
    { id: 'plastik', label: 'Kunststoff / Plastik', icon: '🥤', color: 'bg-yellow-100 border-yellow-400' },
    { id: 'glas', label: 'Glas', icon: '🍾', color: 'bg-gray-100 border-gray-400' },
    { id: 'papier', label: 'Papier / Pappe', icon: '📦', color: 'bg-blue-100 border-blue-400' },
    { id: 'metall', label: 'Metall / Dose', icon: '🥫', color: 'bg-gray-200 border-gray-500' },
    { id: 'bio', label: 'Bio / Organisch', icon: '🍎', color: 'bg-green-100 border-green-500' },
    { id: 'restmuell', label: 'Restmüll', icon: '🗑️', color: 'bg-gray-300 border-gray-600' },
  ];

  const handleMaterialSelect = (mat) => {
    setMaterial(mat);
    if (mat.id === 'bio' || mat.id === 'restmuell') {
      // Pas besoin de demander la propreté pour bio/restmüll
      calculateResult(mat.id, true);
    } else {
      setStep(1);
    }
  };

  const handleCleanSelect = (clean) => {
    setIsClean(clean);
    calculateResult(material.id, clean);
  };

  const calculateResult = (matId, clean) => {
  let disposalKey = 'restmuell';
  
  if (matId === 'plastik') {
    disposalKey = clean ? 'gelber_sack' : 'restmuell';
  } else if (matId === 'glas') {
    disposalKey = 'glas_weiss';
  } else if (matId === 'papier') {
    disposalKey = 'papiermuell';
  } else if (matId === 'metall') {
    disposalKey = 'gelber_sack';
  } else if (matId === 'bio') {
    disposalKey = 'biomuell';
  }

  const rule = disposalRules[disposalKey];
  setResult({ ...rule, key: disposalKey });
  onAddPoints(rule.points, `Manuell sortiert: ${matId}`);
};

  const resetQuiz = () => {
    setStep(0);
    setMaterial(null);
    setIsClean(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="text-pfand-green hover:text-green-700"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-pfand-green text-center flex-1">
            Sortier-Hilfe 🤔
          </h1>
        </div>

        {/* Étape 0 : Choix du matériau */}
        {step === 0 && !result && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-center text-gray-800">
              Aus welchem Material besteht die Verpackung?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {materials.map((mat) => (
                <button
                  key={mat.id}
                  onClick={() => handleMaterialSelect(mat)}
                  className={`${mat.color} border-2 p-4 rounded-lg flex flex-col items-center gap-2 hover:scale-105 transition`}
                >
                  <span className="text-3xl">{mat.icon}</span>
                  <span className="text-sm font-medium text-gray-800 text-center">
                    {mat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Étape 1 : Propreté */}
        {step === 1 && !result && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-center text-gray-800">
              Ist die Verpackung sauber? 🧼
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              (In Deutschland muss Verpackung "löffelrein" sein für den Gelben Sack)
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleCleanSelect(true)}
                className="w-full bg-green-100 border-2 border-green-400 p-4 rounded-lg flex items-center gap-3 hover:bg-green-200 transition"
              >
                <span className="text-3xl">✨</span>
                <div className="text-left">
                  <p className="font-bold text-green-800">Ja, sauber</p>
                  <p className="text-sm text-green-700">Keine Essensreste mehr</p>
                </div>
              </button>
              <button
                onClick={() => handleCleanSelect(false)}
                className="w-full bg-red-100 border-2 border-red-400 p-4 rounded-lg flex items-center gap-3 hover:bg-red-200 transition"
              >
                <span className="text-3xl">🍽️</span>
                <div className="text-left">
                  <p className="font-bold text-red-800">Nein, schmutzig</p>
                  <p className="text-sm text-red-700">Noch Essensreste drin</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Résultat */}
        {result && (
          <div className={`p-6 border-l-4 rounded-lg ${result.color} shadow-md`}>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-green-600" size={32} />
              <span className="text-xl font-bold text-gray-800">
                {result.bin}
              </span>
            </div>
            <div className="text-4xl text-center my-4">{result.icon}</div>
            <p className="text-gray-700 mb-4">{result.description}</p>
            <div className="bg-white p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">Belohnung:</p>
              <p className="text-2xl font-bold text-pfand-green">
                +{result.points} Öko-Punkte 🌱
              </p>
            </div>
            <button
              onClick={resetQuiz}
              className="mt-4 w-full bg-pfand-green text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition"
            >
              <Recycle size={20} />
              Weiteres Produkt sortieren
            </button>
          </div>
        )}
      </div>
    </div>
  );
}