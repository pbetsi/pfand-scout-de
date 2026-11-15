const MUNICIPAL_STORAGE_KEY = 'pfand_scout_municipal_rules';

const defaultRules = {
  cities: [
    {
      id: 'hof',
      name: 'Hof',
      plz: '95028',
      logo: null,
      rules: {
        gelber_sack: 'Gelber Sack',
        papiermuell: 'Papiertonne (Blau)',
        biomuell: 'Biotonne (Braun)',
        restmuell: 'Restmüll (Grau)',
        glas: 'Altglas-Container'
      },
      collectionDays: {
        '2027-01': {
          '2027-01-02': { type: 'gelber_sack', label: 'Gelber Sack' },
          '2027-01-05': { type: 'restmuell', label: 'Restmüll' },
          '2027-01-06': { type: 'papiermuell', label: 'Papiertonne' },
          '2027-01-09': { type: 'biomuell', label: 'Biotonne' },
          '2027-01-12': { type: 'restmuell', label: 'Restmüll' },
          '2027-01-16': { type: 'gelber_sack', label: 'Gelber Sack' },
          '2027-01-19': { type: 'restmuell', label: 'Restmüll' },
          '2027-01-20': { type: 'papiermuell', label: 'Papiertonne' },
          '2027-01-23': { type: 'biomuell', label: 'Biotonne' },
          '2027-01-26': { type: 'restmuell', label: 'Restmüll' },
          '2027-01-30': { type: 'gelber_sack', label: 'Gelber Sack' }
        }
      }
    }
  ]
};

export function loadMunicipalRules() {
  try {
    const data = localStorage.getItem(MUNICIPAL_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (err) { console.error('Erreur lecture:', err); }
  saveMunicipalRules(defaultRules);
  return defaultRules;
}

export function saveMunicipalRules(rules) {
  try { localStorage.setItem(MUNICIPAL_STORAGE_KEY, JSON.stringify(rules)); }
  catch (err) { console.error('Erreur sauvegarde:', err); }
}

export function addCity(city) {
  const rules = loadMunicipalRules();
  rules.cities.push(city);
  saveMunicipalRules(rules);
  return rules;
}

export function updateCity(cityId, updatedCity) {
  const rules = loadMunicipalRules();
  const index = rules.cities.findIndex(c => c.id === cityId);
  if (index !== -1) { rules.cities[index] = updatedCity; saveMunicipalRules(rules); }
  return rules;
}

export function deleteCity(cityId) {
  const rules = loadMunicipalRules();
  rules.cities = rules.cities.filter(c => c.id !== cityId);
  saveMunicipalRules(rules);
  return rules;
}

export function getCityByPLZ(plz) {
  const rules = loadMunicipalRules();
  return rules.cities.find(c => c.plz === plz) || null;
}

export function getCollectionDays(cityId, year, month) {
  const rules = loadMunicipalRules();
  const city = rules.cities.find(c => c.id === cityId);
  if (!city) return {};
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  return city.collectionDays?.[monthKey] || {};
}

// ===== EXPORT JSON (sauvegarde complète) =====
export function exportRulesToJSON() {
  const rules = loadMunicipalRules();
  const blob = new Blob([JSON.stringify(rules, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pfand-scout-regles-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importRulesFromJSON(jsonString) {
  try {
    const rules = JSON.parse(jsonString);
    if (rules.cities && Array.isArray(rules.cities)) {
      saveMunicipalRules(rules);
      return { success: true, message: 'Regeln erfolgreich importiert' };
    }
    return { success: false, message: 'Ungültiges JSON-Format' };
  } catch (err) { return { success: false, message: 'JSON-Parsing-Fehler' }; }
}

// ===== IMPORT ICS (iCalendar - Standard der Kommunen) =====
export function parseICS(icsText) {
  const collectionDays = {};
  // Normalise les sauts de ligne
  const normalized = icsText.replace(/\r\n/g, '\n').replace(/\n /g, '');
  const events = normalized.split('BEGIN:VEVENT');
  events.shift(); // enlève le premier bloc vide

  events.forEach(ev => {
    const dtMatch = ev.match(/DTSTART(?:;[^:]*)?:(\d{8})/);
    const sumMatch = ev.match(/SUMMARY:(.+)/);
    if (dtMatch && sumMatch) {
      const dateStr = dtMatch[1]; // ex: 20270105
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      const dateKey = `${year}-${month}-${day}`;
      const monthKey = `${year}-${month}`;
      const label = sumMatch[1].trim();
      const type = mapLabelToType(label);
      if (!collectionDays[monthKey]) collectionDays[monthKey] = {};
      collectionDays[monthKey][dateKey] = { type, label };
    }
  });
  return collectionDays;
}

// ===== IMPORT CSV (date,type) =====
export function parseCSV(csvText) {
  const collectionDays = {};
  const lines = csvText.split(/\r?\n/).filter(l => l.trim());
  lines.forEach(line => {
    const cols = line.split(/[,;]/);
    if (cols.length >= 2) {
      const rawDate = cols[0].trim();
      const label = cols[1].trim();
      // Supporte 2027-01-05 ou 05.01.2027
      let y, m, d;
      if (rawDate.includes('-')) { [y, m, d] = rawDate.split('-'); }
      else if (rawDate.includes('.')) { [d, m, y] = rawDate.split('.'); }
      if (y && m && d) {
        m = String(m).padStart(2, '0');
        d = String(d).padStart(2, '0');
        const dateKey = `${y}-${m}-${d}`;
        const monthKey = `${y}-${m}`;
        const type = mapLabelToType(label);
        if (!collectionDays[monthKey]) collectionDays[monthKey] = {};
        collectionDays[monthKey][dateKey] = { type, label };
      }
    }
  });
  return collectionDays;
}

// ===== MAPPING label allemand → type interne =====
function mapLabelToType(label) {
  const l = label.toLowerCase();
  if (l.includes('gelb') || l.includes('wertstoff') || l.includes('verpack')) return 'gelber_sack';
  if (l.includes('papier') || l.includes('pappe') || l.includes('blau')) return 'papiermuell';
  if (l.includes('bio') || l.includes('kompost') || l.includes('grün') || l.includes('gruen')) return 'biomuell';
  if (l.includes('glas')) return 'glas';
  if (l.includes('rest') || l.includes('schadstoff') || l.includes('grau')) return 'restmuell';
  return 'restmuell';
}

// ===== EXPORT ICS (interopérabilité avec le calendrier de la mairie) =====
export function exportCityToICS(city) {
  let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Pfand-Scout DE//DE\nCALSCALE:GREGORIAN\n';
  Object.values(city.collectionDays || {}).forEach(monthData => {
    Object.entries(monthData).forEach(([dateKey, info]) => {
      const cleanDate = dateKey.replace(/-/g, '');
      ics += 'BEGIN:VEVENT\n';
      ics += `DTSTART;VALUE=DATE:${cleanDate}\n`;
      ics += `SUMMARY:${info.label} (Abholung ${city.name})\n`;
      ics += `DESCRIPTION:Abfallart: ${info.type}\n`;
      ics += 'END:VEVENT\n';
    });
  });
  ics += 'END:VCALENDAR';
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `abfallkalender-${city.name.toLowerCase()}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

// ===== GESTION DU MOT DE PASSE ADMIN =====
const ADMIN_PWD_KEY = 'pfand_scout_admin_pwd';

export function getAdminPassword() {
  return localStorage.getItem(ADMIN_PWD_KEY) || 'admin2026'; // Défaut
}

export function setAdminPassword(newPassword) {
  localStorage.setItem(ADMIN_PWD_KEY, newPassword);
}