import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, History, Award, RotateCcw } from 'lucide-react';
import { loadUserData, resetUserData } from '../utils/storage';

export default function Dashboard({ onBack }) {
  const [data, setData] = useState(loadUserData());

  const handleReset = () => {
    if (window.confirm('Möchtest du wirklich alle Punkte zurücksetzen?')) {
      const newData = resetUserData();
      setData(newData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="text-pfand-green hover:text-green-700">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-pfand-green text-center flex-1">
            Dashboard 📊
          </h1>
        </div>

        {/* Total des points */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg mb-4">
          <p className="text-sm opacity-90 mb-1">Deine Öko-Punkte</p>
          <p className="text-5xl font-bold">{data.totalPoints}</p>
          <p className="text-sm opacity-90 mt-2">
            🌱 {data.totalPoints < 100 ? 'Weiter so!' : 
                data.totalPoints < 300 ? 'Gut gemacht!' : 
                data.totalPoints < 500 ? 'Fantastisch!' : 'Unglaublich!'}
          </p>
        </div>

        {/* Badges */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Award className="text-yellow-500" size={20} />
            Abzeichen ({data.badges.length}/5)
          </h2>
          {data.badges.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Sammle Punkte, um Abzeichen freizuschalten! 🏆
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {data.badges.map(badge => (
                <div key={badge.id} className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-center">
                  <span className="text-2xl">{badge.icon}</span>
                  <p className="text-xs font-medium text-gray-700 mt-1">{badge.name}</p>
                </div>
              ))}
            </div>
          )}
          {/* Badges à débloquer */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Nächste Abzeichen:</p>
            <div className="space-y-1">
              {[
                { name: 'Anfänger', threshold: 20, icon: '🌱' },
                { name: 'Umweltfreund', threshold: 100, icon: '🌿' },
                { name: 'Recycling-Profi', threshold: 300, icon: '♻️' },
                { name: 'Öko-Held', threshold: 500, icon: '🌍' },
                { name: 'Meister', threshold: 1000, icon: '👑' }
              ].filter(b => !data.badges.find(bd => bd.id === b.name.toLowerCase().replace('öko', 'oeko').replace('ü', 'ue').replace('ä', 'ae').replace('ß', 'ss')))
              .slice(0, 2)
              .map(b => (
                <div key={b.name} className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{b.icon}</span>
                  <span>{b.name} ({b.threshold} Punkte)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Historique */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <History className="text-blue-500" size={20} />
            Verlauf
          </h2>
          {data.history.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Noch keine Einträge. Starte mit dem Scannen! 📱
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.history.map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{entry.action}</p>
                    <p className="text-xs text-gray-500">{entry.date}</p>
                  </div>
                  <span className="text-sm font-bold text-pfand-green">+{entry.points}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bouton reset */}
        <button
          onClick={handleReset}
          className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition text-sm"
        >
          <RotateCcw size={16} />
          Punkte zurücksetzen
        </button>
      </div>
    </div>
  );
}