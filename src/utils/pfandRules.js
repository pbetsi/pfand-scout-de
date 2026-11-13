// Règles de tri allemandes
export const disposalRules = {
  pfand_rueckgabe: {
    bin: "Pfand-Rückgabe",
    color: "bg-blue-100 border-blue-500",
    icon: "🏪",
    description: "Im Supermarkt an der Pfandautomat zurückgeben",
    points: 50
  },
  gelber_sack: {
    bin: "Gelber Sack / Gelbe Tonne",
    color: "bg-yellow-100 border-yellow-500",
    icon: "💛",
    description: "Für Verpackungen aus Kunststoff, Metall und Verbundstoffen",
    points: 20
  },
  papiermuell: {
    bin: "Papiertonne",
    color: "bg-blue-100 border-blue-400",
    icon: "📦",
    description: "Für Papier, Pappe und Karton",
    points: 15
  },
  glas_weiss: {
    bin: "Weißglas-Container",
    color: "bg-gray-100 border-gray-400",
    icon: "🍾",
    description: "Für weißes Glas (nicht in die Papiertonne!)",
    points: 15
  },
  glas_gruen: {
    bin: "Grünglas-Container",
    color: "bg-green-100 border-green-400",
    icon: "🍾",
    description: "Für grünes Glas",
    points: 15
  },
  glas_braun: {
    bin: "Braunglas-Container",
    color: "bg-amber-100 border-amber-600",
    icon: "🍾",
    description: "Für braunes Glas",
    points: 15
  },
  restmuell: {
    bin: "Restmüll (Graue Tonne)",
    color: "bg-gray-200 border-gray-600",
    icon: "🗑️",
    description: "Für Abfälle, die nicht recycelt werden können",
    points: 5
  },
  biomuell: {
    bin: "Biotonne",
    color: "bg-green-100 border-green-600",
    icon: "🌱",
    description: "Für organische Abfälle und Essensreste",
    points: 10
  }
};

// Fonction pour chercher un produit par son code EAN
export function findProductByEAN(ean, products) {
  return products.find(p => p.ean === ean) || null;
}

// Fonction pour calculer les points
export function calculatePoints(disposalType) {
  return disposalRules[disposalType]?.points || 0;
}