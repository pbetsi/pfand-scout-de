import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Edit, Trash2, Download, Upload, 
  Save, X, Calendar, MapPin, Settings, LogOut,
  CheckCircle, AlertCircle
} from 'lucide-react';
import {
  loadMunicipalRules, addCity, updateCity, deleteCity,
  exportRulesToJSON, importRulesFromJSON
} from '../utils/municipalRules';

export default function Admin({ onBack }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rules, setRules] = useState(loadMunicipalRules());
  const [editingCity, setEditingCity] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState(null);

  // Mot de passe admin (en production, utiliser un vrai système d'auth)
  const ADMIN_PASSWORD = 'admin2026';

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Falsches Passwort');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setEditingCity(null);
  };

  const handleAddCity = () => {
    const newCity = {
      id: `city_${Date.now()}`,
      name: 'Neue Stadt',
      plz: '00000',
      rules: {
        gelber_sack: 'Gelber Sack',
        papiermuell: 'Papiertonne',
        biomuell: 'Biotonne',
        restmuell: 'Restmüll',
        glas: 'Altglas-Container'
      },
      collectionDays: {}
    };
    const updatedRules = addCity(newCity);
    setRules(updatedRules);
    setEditingCity(newCity.id);
  };

  const handleUpdateCity = (cityId, updatedCity) => {
    const updatedRules = updateCity(cityId, updatedCity);
    setRules(updatedRules);
    setEditingCity(null);
    showMessage('Stadt erfolgreich aktualisiert', 'success');
  };

  const handleDeleteCity = (cityId) => {
    if (window.confirm('Möchten Sie diese Stadt wirklich löschen?')) {
      const updatedRules = deleteCity(cityId);
      setRules(updatedRules);
      setEditingCity(null);
      showMessage('Stadt gelöscht', 'success');
    }
  };

  const handleExport = () => {
    exportRulesToJSON();
    showMessage('Regeln exportiert', 'success');
  };

  const handleImport = () => {
    const result = importRulesFromJSON(importText);
    if (result.success) {
      setRules(loadMunicipalRules());
      setShowImport(false);
      setImportText('');
      showMessage(result.message, 'success');
    } else {
      showMessage(result.message, 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Écran de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-center mb-6">
              <Settings className="mx-auto text-pfand-green mb-2" size={48} />
              <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
              <p className="text-sm text-gray-500 mt-1">Pfand-Scout DE Verwaltung</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passwort
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pfand-green focus:border-transparent"
                  placeholder="Admin-Passwort eingeben"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-pfand-green text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
              >
                Anmelden
              </button>
            </form>

            <button
              onClick={onBack}
              className="mt-4 w-full text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Zurück zur App
            </button>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
              <strong>Hinweis:</strong> Dies ist eine Demo. Passwort: admin2026
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interface admin principale
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-pfand-green hover:text-green-700 p-2">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Verwaltung der kommunalen Regeln</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-500 p-2"
            title="Abmelden"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} className="text-green-500" /> : <AlertCircle size={20} className="text-red-500" />}
            <p className={`text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Städte</p>
            <p className="text-2xl font-bold text-pfand-green">{rules.cities.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Regeln</p>
            <p className="text-2xl font-bold text-blue-500">
              {rules.cities.reduce((acc, c) => acc + Object.keys(c.rules).length, 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Abholtermine</p>
            <p className="text-2xl font-bold text-orange-500">
              {rules.cities.reduce((acc, c) => {
                return acc + Object.values(c.collectionDays || {}).reduce((sum, month) => sum + Object.keys(month).length, 0);
              }, 0)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleAddCity}
            className="flex-1 bg-pfand-green text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition"
          >
            <Plus size={20} />
            Neue Stadt hinzufügen
          </button>
          <button
            onClick={handleExport}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition"
          >
            <Download size={20} />
            Export
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="bg-purple-500 text-white px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-purple-600 transition"
          >
            <Upload size={20} />
            Import
          </button>
        </div>

        {/* Liste des villes */}
        <div className="space-y-4">
          {rules.cities.map(city => (
            <div key={city.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {editingCity === city.id ? (
                <CityEditor
                  city={city}
                  onSave={(updated) => handleUpdateCity(city.id, updated)}
                  onCancel={() => setEditingCity(null)}
                  onDelete={() => handleDeleteCity(city.id)}
                />
              ) : (
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="text-pfand-green" size={24} />
                      <div>
                        <h3 className="font-bold text-gray-800">{city.name}</h3>
                        <p className="text-sm text-gray-500">PLZ: {city.plz}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingCity(city.id)}
                        className="text-blue-500 hover:text-blue-700 p-2"
                        title="Bearbeiten"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCity(city.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Löschen"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(city.rules).map(([key, value]) => (
                      <span key={key} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal Import */}
        {showImport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Regeln importieren</h2>
                <button onClick={() => setShowImport(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Fügen Sie den JSON-Code der Regeln hier ein:
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder='{"cities": [...]}'
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleImport}
                  className="flex-1 bg-pfand-green text-white py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Importieren
                </button>
                <button
                  onClick={() => setShowImport(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant d'édition d'une ville
function CityEditor({ city, onSave, onCancel, onDelete }) {
  const [formData, setFormData] = useState({ ...city });

  const handleRuleChange = (key, value) => {
    setFormData({
      ...formData,
      rules: { ...formData.rules, [key]: value }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stadtname</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
          <input
            type="text"
            value={formData.plz}
            onChange={(e) => setFormData({ ...formData, plz: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-800 mb-2">Müllregeln</h4>
        <div className="space-y-2">
          {Object.entries(formData.rules).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <label className="w-32 text-sm text-gray-600 flex items-center">
                {key.replace('_', ' ')}:
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleRuleChange(key, e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <button
          type="submit"
          className="flex-1 bg-pfand-green text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition"
        >
          <Save size={18} />
          Speichern
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Abbrechen
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </form>
  );
}