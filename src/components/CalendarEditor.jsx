import { useState } from 'react';
import { ArrowLeft, Save, Trash2, X, Check } from 'lucide-react';

const WASTE_TYPES = [
  { id: 'gelber_sack', label: 'Gelber Sack', color: 'bg-yellow-400', text: 'text-yellow-900' },
  { id: 'papiermuell', label: 'Papiertonne', color: 'bg-blue-400', text: 'text-blue-900' },
  { id: 'biomuell', label: 'Biotonne', color: 'bg-green-600', text: 'text-white' },
  { id: 'restmuell', label: 'Restmüll', color: 'bg-gray-800', text: 'text-white' },
  { id: 'glas', label: 'Altglas', color: 'bg-green-100', text: 'text-green-900' },
];

// ✅ Normalise TOUTES les dates au format allemand TT.MM.AAAA
const formatDateDE = (dateKey) => {
  if (!dateKey) return '';
  const parts = dateKey.split('-');
  if (parts.length !== 3) return dateKey;
  const [y, m, d] = parts;
  return `${d}.${m}.${y}`;
};

export default function CalendarEditor({ city, onSave, onCancel }) {
  const [year, setYear] = useState(2027);
  const [month, setMonth] = useState(0);
  const [localDays, setLocalDays] = useState({ ...(city.collectionDays || {}) });
  const [selectedDate, setSelectedDate] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const currentMonthData = localDays[monthKey] || {};

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

  const assignType = (typeObj) => {
    if (!selectedDate) return;
    setLocalDays({
      ...localDays,
      [monthKey]: { ...currentMonthData, [selectedDate]: { type: typeObj.id, label: typeObj.label } }
    });
    setPickerOpen(false);
    setSelectedDate(null);
  };

  const removeDay = (dateKey) => {
    const copy = { ...currentMonthData };
    delete copy[dateKey];
    setLocalDays({ ...localDays, [monthKey]: copy });
  };

  const handleSave = () => onSave({ ...city, collectionDays: localDays });

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const months = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArrowLeft size={20} className="text-pfand-green" />
            <h2 className="text-xl font-bold text-gray-800">Kalender: {city.name}</h2>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Klicken Sie auf einen Tag, um die Abfallart zuzuweisen. 🟢 = bereits geplant.
        </p>

        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">←</button>
          <span className="font-bold text-gray-800">{months[month]} {year}</span>
          <button onClick={nextMonth} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">→</button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mo','Di','Mi','Do','Fr','Sa','So'].map(d => (
            <div key={d} className="text-center text-xs font-bold text-gray-500 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = `${monthKey}-${String(day).padStart(2, '0')}`;
            const entry = currentMonthData[dateKey];
            const typeObj = WASTE_TYPES.find(w => w.id === entry?.type);
            return (
              <button
                key={day}
                onClick={() => { setSelectedDate(dateKey); setPickerOpen(true); }}
                className={`h-12 rounded flex items-center justify-center text-sm font-medium transition ${
                  typeObj ? `${typeObj.color} ${typeObj.text}` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {Object.keys(currentMonthData).length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Abholungen {months[month]}:</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {Object.entries(currentMonthData)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([dateKey, info]) => (
                <div key={dateKey} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm">
                  {/* ✅ Format allemand uniforme */}
                  <span className="text-gray-700">📅 {formatDateDE(dateKey)} — {info.label}</span>
                  <button onClick={() => removeDay(dateKey)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {pickerOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-4 max-w-sm w-full shadow-xl">
              <p className="text-sm font-bold text-gray-700 mb-3">Abfallart für {formatDateDE(selectedDate)}:</p>
              <div className="grid grid-cols-2 gap-2">
                {WASTE_TYPES.map(w => (
                  <button
                    key={w.id}
                    onClick={() => assignType(w)}
                    className={`${w.color} ${w.text} py-3 rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition`}
                  >
                    <Check size={16} /> {w.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setPickerOpen(false)} className="mt-3 w-full text-gray-500 text-sm py-2 hover:text-gray-700">Abbrechen</button>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <button onClick={handleSave} className="flex-1 bg-pfand-green text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition font-medium">
            <Save size={18} /> Speichern
          </button>
          <button onClick={onCancel} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition">Abbrechen</button>
        </div>
      </div>
    </div>
  );
}