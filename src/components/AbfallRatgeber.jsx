import { useState } from 'react';
import { ArrowLeft, MapPin, Info, CheckCircle2, LocateFixed, Search } from 'lucide-react';

// Mapping PLZ → Région (démo réaliste avec des vraies villes pour le pitch B2G)
const plzMapping = {
  '10115': { city: 'Berlin', tonne: 'Gelbe Tonne', bio: 'Pflicht-Biotonne' },
  '80331': { city: 'München', tonne: 'Gelbe Tonne', bio: 'Biotonne' },
  '20095': { city: 'Hamburg', tonne: 'Gelber Sack', bio: 'Biotonne' },
  '50667': { city: 'Köln', tonne: 'Gelbe Tonne', bio: 'Biotonne' },
  '60311': { city: 'Frankfurt', tonne: 'Gelbe Tonne', bio: 'Biotonne' },
  '04109': { city: 'Leipzig', tonne: 'Gelber Sack', bio: 'Biotonne' },
  '70173': { city: 'Stuttgart', tonne: 'Gelbe Tonne', bio: 'Biotonne' },
  '30159': { city: 'Hannover', tonne: 'Gelber Sack', bio: 'Biotonne' },
};

export default function AbfallRatgeber({ onBack }) {
  const [plz, setPlz] = useState('');
  const [location, setLocation] = useState(null);
  const [geolocError, setGeolocError] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Méthode 1 : Recherche par PLZ
  const searchByPLZ = () => {
    if (plz.length === 5 && plzMapping[plz]) {
      setLocation({ ...plzMapping[plz], source: 'PLZ-Suche' });
    } else {
      // Fallback honnête et professionnel
      setLocation({ 
        city: 'Region nicht in Demo-Datenbank', 
        tonne: 'Gelbe Tonne (Standard)', 
        bio: 'Biotonne (Standard)', 
        source: 'PLZ-Suche (Fallback)' 
      });
    }
  };

  // Méthode 2 : Géolocalisation GPS + Nominatim (API OpenStreetMap gratuite)
  const detectLocation = () => {
    setGeolocError('');
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      setGeolocError('Dein Browser unterstützt keine Ortung.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=de`
          );
          const data = await res.json();
          
          const city = data.address?.city || data.address?.town || data.address?.village || 'Unbekannte Region';
          const plzFound = data.address?.postcode || '';
          const mapping = plzMapping[plzFound] || { tonne: 'Gelbe Tonne (Standard)', bio: 'Biotonne (Standard)' };
          
          setLocation({ city, ...mapping, source: 'GPS-Ortung' });
        } catch (err) {
          setGeolocError('Fehler bei der Standorterkennung.');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setGeolocError('Ortung wurde verweigert. Bitte erlauben Sie den Standortzugriff.');
        setIsLocating(false);
      }
    );
  };

  const wasteTypes = [
    {
      id: 'gelber_sack',
      name: 'Gelber Sack / Gelbe Tonne',
      color: 'bg-yellow-400',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-900',
      icon: '💛',
      description: 'Leichtverpackungen aus Kunststoff, Metall und Verbundstoffen.',
      examples: ['Joghurtbecher (löffelrein)', 'Konservendosen', 'Milchtüten (Tetra Pak)', 'Plastikflaschen (ohne Pfand)'],
      forbidden: ['Glas', 'Batterien', 'Elektrogeräte']
    },
    {
      id: 'papiermuell',
      name: 'Papiertonne (Blau)',
      color: 'bg-blue-400',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-900',
      icon: '📦',
      description: 'Papier, Pappe und Kartonagen.',
      examples: ['Zeitungen und Zeitschriften', 'Kartons (zerkleinert)', 'Briefumschläge', 'Eierkartons'],
      forbidden: ['Verschmutztes Papier (z.B. Pizzakarton mit Fett)', 'Backpapier', 'Fotos']
    },
    {
      id: 'biomuell',
      name: 'Biotonne (Braun)',
      color: 'bg-amber-700',
      borderColor: 'border-amber-800',
      textColor: 'text-amber-50',
      icon: '🌱',
      description: 'Organische und kompostierbare Abfälle.',
      examples: ['Obst- und Gemüsereste', 'Kaffeesatz und Filter', 'Eierschalen', 'Verdorbene Lebensmittel (ohne Verpackung)'],
      forbidden: ['Plastiktüten (auch "biologisch abbaubare")', 'Knochen', 'Asche']
    },
    {
      id: 'restmuell',
      name: 'Restmüll (Grau/Schwarz)',
      color: 'bg-gray-600',
      borderColor: 'border-gray-700',
      textColor: 'text-gray-50',
      icon: '🗑️',
      description: 'Alles, was nicht recycelt werden kann.',
      examples: ['Staubsaugerbeutel', 'Windeln', 'Zigarettenstummel', 'Kaugummi'],
      forbidden: ['Sondermüll', 'Elektrogeräte', 'Wertstoffe']
    },
    {
      id: 'glas',
      name: 'Altglas-Container',
      color: 'bg-green-100',
      borderColor: 'border-green-600',
      textColor: 'text-green-900',
      icon: '🍾',
      description: 'Getrennt nach Weiß-, Grün- und Braunglas.',
      examples: ['Leere Glasflaschen', 'Marmeladengläser (ohne Deckel)', 'Parfümflakons'],
      forbidden: ['Fensterglas', 'Spiegel', 'Keramiktassen', 'Trinkgläser']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="text-pfand-green hover:text-green-700 p-2" aria-label="Zurück">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 text-center flex-1">
            Abfall-Ratgeber
          </h1>
        </div>

        {/* Sélecteur de localisation intelligent (Argument massue B2G) */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-3 text-gray-700">
            <MapPin size={18} className="text-pfand-green" />
            <span className="text-sm font-bold">Ihr Standort</span>
          </div>

          {/* Recherche par PLZ */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              inputMode="numeric"
              maxLength="5"
              placeholder="PLZ (z.B. 10115)"
              value={plz}
              onChange={(e) => setPlz(e.target.value.replace(/\D/g, ''))}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pfand-green focus:border-transparent"
              aria-label="Postleitzahl eingeben"
            />
            <button
              onClick={searchByPLZ}
              className="bg-pfand-green text-white px-4 py-2 rounded-md flex items-center gap-1 hover:bg-green-700 transition"
              aria-label="PLZ suchen"
            >
              <Search size={16} />
            </button>
          </div>

          {/* Ou géolocalisation */}
          <button
            onClick={detectLocation}
            disabled={isLocating}
            className="w-full bg-gray-100 text-gray-700 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-gray-200 transition text-sm disabled:opacity-50"
          >
            <LocateFixed size={16} className={isLocating ? 'animate-spin' : ''} />
            {isLocating ? 'Standort wird erkannt...' : 'Meinen Standort automatisch erkennen'}
          </button>

          {geolocError && <p className="text-xs text-red-600 mt-2">{geolocError}</p>}

          {/* Résultat affiché */}
          {location && (
  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
    <div className="flex items-center justify-between mb-1">
      <p className="text-sm font-bold text-green-800">📍 {location.city}</p>
      <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-medium">
        {location.source}
      </span>
    </div>
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-green-700">
      <span>🟡 <strong>{location.tonne}</strong></span>
      <span>🟤 <strong>{location.bio}</strong></span>
    </div>
  </div>
)}

          <p className="text-xs text-gray-500 mt-3 flex items-start gap-1">
            <Info size={12} className="mt-0.5 flex-shrink-0" />
            <span>
              Die genauen Regeln variieren je Landkreis. In der Vollversion werden die Daten direkt von Ihrem lokalen Abfallwirtschaftsbetrieb geladen.
            </span>
          </p>
        </div>

        {/* Liste des poubelles */}
        <div className="space-y-4">
          {wasteTypes.map((waste) => (
            <div 
              key={waste.id} 
              className={`bg-white rounded-lg shadow-sm border-l-4 ${waste.borderColor} overflow-hidden`}
            >
              <div className={`p-4 ${waste.color} ${waste.textColor}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl" role="img" aria-label={waste.name}>{waste.icon}</span>
                  <h2 className="text-lg font-bold">{waste.name}</h2>
                </div>
                <p className="text-sm mt-2 opacity-90">{waste.description}</p>
              </div>
              
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-green-700 flex items-center gap-1 mb-1">
                    <CheckCircle2 size={16} /> Das gehört hinein:
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1 ml-5 list-disc">
                    {waste.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-red-700 flex items-center gap-1 mb-1">
                    <span className="text-lg">✕</span> Das gehört NICHT hinein:
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1 ml-5 list-disc">
                    {waste.forbidden.map((fb, i) => <li key={i}>{fb}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer informatif dynamique */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-sm text-blue-800 font-medium mb-1">Wussten Sie schon?</p>
          <p className="text-xs text-blue-700">
            Richtige Mülltrennung spart der Stadt {location ? location.city : 'Ihrer Region'} jährlich tausende Euro an Sortierkosten und schont die Umwelt.
          </p>
        </div>

        <button
          onClick={onBack}
          className="mt-6 w-full bg-pfand-green text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition font-medium"
        >
          <ArrowLeft size={20} />
          Zurück zum Scanner
        </button>
      </div>
    </div>
  );
}