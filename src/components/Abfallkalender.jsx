import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Info } from 'lucide-react';

export default function Abfallkalender({ onBack }) {
  const [currentMonth, setCurrentMonth] = useState(0); // 0 = Janvier 2027
  const [selectedDate, setSelectedDate] = useState(null);

  // Jours de collecte pour Hof (exemple réaliste)
  const hofSchedule = {
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
  };

  const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const year = 2027;

  const getColorForType = (type) => {
    const colors = {
      'restmuell': 'bg-gray-800 text-white',
      'gelber_sack': 'bg-yellow-400 text-yellow-900',
      'papiermuell': 'bg-blue-400 text-blue-900',
      'biomuell': 'bg-green-600 text-white',
      'glas': 'bg-green-100 text-green-900'
    };
    return colors[type] || 'bg-gray-200 text-gray-800';
  };

  const getDaysInMonth = (month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const monthKey = `${year}-${String(currentMonth + 1).padStart(2, '0')}`;
    const schedule = hofSchedule[monthKey] || {};

    // Jours vides avant le 1er
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const collection = schedule[dateKey];
      const isSelected = selectedDate === dateKey;

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(dateKey)}
          className={`h-12 rounded-lg flex items-center justify-center text-sm font-medium transition ${
            collection ? getColorForType(collection.type) : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${isSelected ? 'ring-2 ring-pfand-green ring-offset-2' : ''}`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const nextMonth = () => setCurrentMonth((prev) => (prev + 1) % 12);
  const prevMonth = () => setCurrentMonth((prev) => (prev - 1 + 12) % 12);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="text-pfand-green hover:text-green-700 p-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 text-center flex-1">
            Abfallkalender Hof
          </h1>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg mb-4 flex items-start gap-2">
          <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800">
            Abholtermine für Hof (Beispiel). In der Vollversion werden die Daten direkt vom Abfallwirtschaftsbetrieb Hof geladen.
          </p>
        </div>

        {/* Navigation mois */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-lg font-bold text-gray-800">
              {months[currentMonth]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendrier */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>

        {/* Légende */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-3">Legende</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gray-800"></div>
              <span className="text-sm text-gray-700">Restmüll (Graue Tonne)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-yellow-400"></div>
              <span className="text-sm text-gray-700">Gelber Sack / Gelbe Tonne</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-blue-400"></div>
              <span className="text-sm text-gray-700">Papiertonne (Blau)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-green-600"></div>
              <span className="text-sm text-gray-700">Biotonne (Braun/Grün)</span>
            </div>
          </div>
        </div>

        {/* Date sélectionnée */}
        {selectedDate && (
          <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-2">
              Ausgewählt: {selectedDate}
            </h3>
            {hofSchedule[`${year}-${String(currentMonth + 1).padStart(2, '0')}`]?.[selectedDate] ? (
              <p className="text-sm text-gray-700">
                🗑️ {hofSchedule[`${year}-${String(currentMonth + 1).padStart(2, '0')}`][selectedDate].label}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Keine Abholung an diesem Tag</p>
            )}
          </div>
        )}

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