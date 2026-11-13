const STORAGE_KEY = 'pfand_scout_data';

// Récupérer les données sauvegardées
export function loadUserData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Erreur lecture localStorage:', err);
  }
  // Valeurs par défaut
  return {
    totalPoints: 0,
    history: [],
    badges: []
  };
}

// Sauvegarder les données
export function saveUserData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Erreur sauvegarde:', err);
  }
}

// Ajouter des points et un historique
export function addPointsAndLog(points, action, product = null) {
  const data = loadUserData();
  data.totalPoints += points;
  data.history.unshift({
    id: Date.now(),
    date: new Date().toLocaleString('de-DE'),
    action: action,
    product: product,
    points: points
  });
  // Garder seulement les 50 derniers
  if (data.history.length > 50) {
    data.history = data.history.slice(0, 50);
  }
  // Vérifier les badges
  data.badges = checkBadges(data.totalPoints, data.badges);
  saveUserData(data);
  return data;
}

// Système de badges
export function checkBadges(totalPoints, currentBadges) {
  const allBadges = [
    { id: 'anfanger', name: 'Anfänger 🌱', threshold: 20, icon: '🌱' },
    { id: 'umweltfreund', name: 'Umweltfreund 🌿', threshold: 100, icon: '🌿' },
    { id: 'recycling_profi', name: 'Recycling-Profi ♻️', threshold: 300, icon: '♻️' },
    { id: 'oeko_held', name: 'Öko-Held 🌍', threshold: 500, icon: '🌍' },
    { id: 'meister', name: 'Nachhaltigkeits-Meister 👑', threshold: 1000, icon: '👑' }
  ];

  const newBadges = [...currentBadges];
  allBadges.forEach(badge => {
    if (totalPoints >= badge.threshold && !newBadges.find(b => b.id === badge.id)) {
      newBadges.push(badge);
    }
  });
  return newBadges;
}

// Réinitialiser (pour tests)
export function resetUserData() {
  localStorage.removeItem(STORAGE_KEY);
  return loadUserData();
}