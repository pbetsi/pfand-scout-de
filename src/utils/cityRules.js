import disposalRulesData from '../data/disposalRules.json';

// Fonction pour obtenir les règles d'une ville spécifique
export function getCityRules(cityKey) {
  const bundesregeln = disposalRulesData.bundesregeln;
  const kommunalregeln = disposalRulesData.kommunalregeln[cityKey];

  if (!kommunalregeln) {
    // Ville non trouvée → utiliser les règles fédérales
    return {
      city: cityKey,
      rules: bundesregeln,
      isDefault: true
    };
  }

  // Fusionner les règles fédérales avec les overrides locaux
  const mergedRules = { ...bundesregeln };
  
  for (const [key, override] of Object.entries(kommunalregeln.overrides)) {
    if (mergedRules[key]) {
      mergedRules[key] = { ...mergedRules[key], ...override };
    }
  }

  // Ajouter les poubelles supplémentaires spécifiques à la ville
  if (kommunalregeln.additionalBins) {
    Object.assign(mergedRules, kommunalregeln.additionalBins);
  }

  return {
    city: kommunalregeln.cityName,
    rules: mergedRules,
    isDefault: false
  };
}

// Fonction pour mapper une ville vers sa clé
export function getCityKeyFromName(cityName) {
  const cityMap = {
    'berlin': 'berlin',
    'münchen': 'muenchen',
    'muenchen': 'muenchen',
    'hof': 'hof',
    'hamburg': 'hamburg',
    'köln': 'koeln',
    'cologne': 'koeln'
  };
  return cityMap[cityName.toLowerCase()] || null;
}