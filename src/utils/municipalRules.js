const MUNICIPAL_STORAGE_KEY = 'pfand_scout_municipal_rules';

// Règles par défaut (exemple : Hof)
const defaultRules = {
  cities: [
    {
      id: 'hof',
      name: 'Hof',
      plz: '95028',
      rules: {
        gelber_sack: 'Gelber Sack',
        papiermuell: 'Papiertonne (Blau)',
        biomuell: 'Biotonne (Braun)',
        restmuell: 'Restmüll (Grau)',
        glas: 'Altglas-Container'
      },
      collectionDays: {
        '2027-01': {
          '2027-01-05': { type: 'restmuell', label: 'Restmüll' },
          '2027-01-12': { type: 'restmuell', label: 'Restmüll' },
          '2027-01-19': { type: 'restmuell', label: 'Restmüll' },
          '2027-01-26': { type: 'restmuell', label: 'Restmüll' },
          '2027-01-02': { type: 'gelber_sack', label: 'Gelber Sack' },
          '2027-01-16': { type: 'gelber_sack', label: 'Gelber Sack' },
          '2027-01-30': { type: 'gelber_sack', label: 'Gelber Sack' },
          '2027-01-06': { type: 'papiermuell', label: 'Papiertonne' },
          '2027-01-20': { type: 'papiermuell', label: 'Papiertonne' },
          '2027-01-09': { type: 'biomuell', label: 'Biotonne' },
          '2027-01-16': { type: 'biomuell', label: 'Biotonne' },
          '2027-01-23': { type: 'biomuell', label: 'Biotonne' },
        }
      }
    }
  ]
};

// Charger les règles municipales
export function loadMunicipalRules() {
  try {
    const data = localStorage.getItem(MUNICIPAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Erreur lecture règles municipales:', err);
  }
  // Initialiser avec les règles par défaut
  saveMunicipalRules(defaultRules);
  return defaultRules;
}

// Sauvegarder les règles municipales
export function saveMunicipalRules(rules) {
  try {
    localStorage.setItem(MUNICIPAL_STORAGE_KEY, JSON.stringify(rules));
  } catch (err) {
    console.error('Erreur sauvegarde règles municipales:', err);
  }
}

// Ajouter une ville
export function addCity(city) {
  const rules = loadMunicipalRules();
  rules.cities.push(city);
  saveMunicipalRules(rules);
  return rules;
}

// Mettre à jour une ville
export function updateCity(cityId, updatedCity) {
  const rules = loadMunicipalRules();
  const index = rules.cities.findIndex(c => c.id === cityId);
  if (index !== -1) {
    rules.cities[index] = updatedCity;
    saveMunicipalRules(rules);
  }
  return rules;
}

// Supprimer une ville
export function deleteCity(cityId) {
  const rules = loadMunicipalRules();
  rules.cities = rules.cities.filter(c => c.id !== cityId);
  saveMunicipalRules(rules);
  return rules;
}

// Exporter les règles en JSON
export function exportRulesToJSON() {
  const rules = loadMunicipalRules();
  const dataStr = JSON.stringify(rules, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pfand-scout-regles-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Importer les règles depuis un JSON
export function importRulesFromJSON(jsonString) {
  try {
    const rules = JSON.parse(jsonString);
    if (rules.cities && Array.isArray(rules.cities)) {
      saveMunicipalRules(rules);
      return { success: true, message: 'Règles importées avec succès' };
    }
    return { success: false, message: 'Format JSON invalide' };
  } catch (err) {
    return { success: false, message: 'Erreur de parsing JSON' };
  }
}

// Obtenir les règles d'une ville par PLZ
export function getCityByPLZ(plz) {
  const rules = loadMunicipalRules();
  return rules.cities.find(c => c.plz === plz) || null;
}

// Obtenir les jours de collecte d'une ville pour un mois
export function getCollectionDays(cityId, year, month) {
  const rules = loadMunicipalRules();
  const city = rules.cities.find(c => c.id === cityId);
  if (!city) return {};
  
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  return city.collectionDays?.[monthKey] || {};
}