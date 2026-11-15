import { useState, useRef } from 'react';
import {
  ArrowLeft, Plus, Edit, Trash2, Download, Upload, Save, X,
  MapPin, Settings, LogOut, CheckCircle, AlertCircle, CalendarDays, FileText, Key
} from 'lucide-react';
import {
  loadMunicipalRules, addCity, updateCity, deleteCity,
  exportRulesToJSON, importRulesFromJSON, parseICS, parseCSV, exportCityToICS,
  getAdminPassword, setAdminPassword // <-- NOUVEAU : Gestion du mot de passe
} from '../utils/municipalRules';
import CalendarEditor from './CalendarEditor';

export default function Admin({ onBack }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rules, setRules] = useState(loadMunicipalRules());
  const [editingCity, setEditingCity] = useState(null);
  const [editingCalendar, setEditingCalendar] = useState(null);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Gestion du changement de mot de passe
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Utilisation de la fonction dynamique au lieu de la constante en dur
    if (password === getAdminPassword()) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Falsches Passwort');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showMessage('Passwörter stimmen nicht überein', 'error');
      return;
    }
    if (newPassword.length < 4) {
      showMessage('Passwort muss mindestens 4 Zeichen haben', 'error');
      return;
    }
    setAdminPassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    showMessage('Passwort erfolgreich geändert!', 'success');
  };

  const handleAddCity = () => {
    const newCity = {
      id: `city_${Date.now()}`, name: 'Neue Stadt', plz: '00000', logo: null,
      rules: { gelber_sack: 'Gelber Sack', papiermuell: 'Papiertonne', biomuell: 'Biotonne', restmuell: 'Restmüll', glas: 'Altglas-Container' },
      collectionDays: {}
    };
    setRules(addCity(newCity));
    setEditingCity(newCity.id);
  };

  const handleUpdateCity = (cityId, updatedCity) => {
    setRules(updateCity(cityId, updatedCity));
    setEditingCity(null);
    showMessage('Stadt erfolgreich aktualisiert', 'success');
  };

  const handleDeleteCity = (cityId) => {
    if (window.confirm('Möchten Sie diese Stadt wirklich löschen?')) {
      setRules(deleteCity(cityId));
      setEditingCity(null);
      showMessage('Stadt gelöscht', 'success');
    }
  };

  const handleSaveCalendar = (updatedCity) => {
    setRules(updateCity(updatedCity.id, updatedCity));
    setEditingCalendar(null);
    showMessage('Kalender gespeichert', 'success');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const name = file.name.toLowerCase();
      
      if (name.endsWith('.json')) {
        const res = importRulesFromJSON(text);
        if (res.success) {
          setRules(loadMunicipalRules());
          showMessage(res.message, 'success');
        } else {
          showMessage(res.message, 'error');
        }
      } else if (name.endsWith('.ics')) {
        const days = parseICS(text);
        const count = Object.values(days).reduce((a, m) => a + Object.keys(m).length, 0);
        if (count === 0) {
          showMessage('Keine Termine in ICS gefunden', 'error');
          return;
        }
        const target = editingCity ? rules.cities.find(c => c.id === editingCity) : rules.cities[0];
        if (target) {
          const updated = { ...target, collectionDays: { ...target.collectionDays, ...days } };
          setRules(updateCity(target.id, updated));
          showMessage(`${count} Abholtermine aus ICS importiert`, 'success');
        }
      } else if (name.endsWith('.csv')) {
        const days = parseCSV(text);
        const count = Object.values(days).reduce((a, m) => a + Object.keys(m).length, 0);
        if (count === 0) {
          showMessage('Keine Termine in CSV gefunden', 'error');
          return;
        }
        const target = editingCity ? rules.cities.find(c => c.id === editingCity) : rules.cities[0];
        if (target) {
          const updated = { ...target, collectionDays: { ...target.collectionDays, ...days } };
          setRules(updateCity(target.id, updated));
          showMessage(`${count} Abholtermine aus CSV importiert`, 'success');
        }
      } else {
        showMessage('Nur .ics, .csv oder .json erlaubt', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Écran de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <Settings className="mx-auto text-pfand-green mb-2" size={48} />
            <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
            <p className="text-sm text-gray-500 mt-1">Pfand-Scout DE Verwaltung</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
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
              <p className="text-sm text-gray-500">Kommunale Regeln & Kalender</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
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
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleAddCity}
            className="flex-1 min-w-[200px] bg-pfand-green text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition"
          >
            <Plus size={20} /> Neue Stadt
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-purple-500 text-white px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-purple-600 transition"
          >
            <Upload size={20} /> Import (.ics/.csv/.json)
          </button>
          <input 
            ref={fileInputRef} 
            type="file" 
            accept=".ics,.csv,.json" 
            className="hidden" 
            onChange={handleFileUpload} 
          />
          <button
            onClick={exportRulesToJSON}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition"
          >
            <Download size={20} /> Export
          </button>
        </div>

        {/* Liste des villes */}
        <div className="space-y-4 mb-8">
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
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <MapPin className="text-pfand-green" size={24} />
                      <div>
                        <h3 className="font-bold text-gray-800">{city.name}</h3>
                        <p className="text-sm text-gray-500">PLZ: {city.plz}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingCalendar(city)}
                        className="text-orange-500 hover:text-orange-700 p-2"
                        title="Kalender visuell bearbeiten"
                      >
                        <CalendarDays size={18} />
                      </button>
                      <button
                        onClick={() => exportCityToICS(city)}
                        className="text-green-600 hover:text-green-800 p-2"
                        title="ICS Exportieren"
                      >
                        <FileText size={18} />
                      </button>
                      <button
                        onClick={() => setEditingCity(city.id)}
                        className="text-blue-500 hover:text-blue-700 p-2"
                        title="Regeln bearbeiten"
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

        {/* NOUVEAU : Section Sécurité (Changement de mot de passe) */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-yellow-400">
          <div className="flex items-center gap-2 mb-4">
            <Key className="text-yellow-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Sicherheit & Passwort</h2>
          </div>
          <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Neues Passwort</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passwort bestätigen</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-yellow-600 transition">
              <Save size={18} /> Passwort ändern
            </button>
          </form>
        </div>

        {/* Éditeur de calendrier visuel (Modal) */}
        {editingCalendar && (
          <CalendarEditor
            city={editingCalendar}
            onSave={handleSaveCalendar}
            onCancel={() => setEditingCalendar(null)}
          />
        )}
      </div>
    </div>
  );
}

// Composant d'édition d'une ville (Règles textuelles)
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
        <h4 className="font-medium text-gray-800 mb-2">Müllregeln (Namen anpassen)</h4>
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
          <Save size={18} /> Speichern
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