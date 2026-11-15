import { useState } from 'react';
import Scanner from './components/Scanner';
import Quiz from './components/Quiz';
import Dashboard from './components/Dashboard';
import Datenschutz from './components/Datenschutz';
import AbfallRatgeber from './components/AbfallRatgeber';
import Abfallkalender from './components/Abfallkalender';
import Logo from './components/Logo';
import { loadUserData, addPointsAndLog } from './utils/storage';
import { Shield, BookOpen, Calendar } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('scanner');
  const [userData, setUserData] = useState(loadUserData());

  const MUNICIPAL_LOGO = null;

  const handleAddPoints = (points, action, product = null) => {
    const newData = addPointsAndLog(points, action, product);
    setUserData(newData);
  };

  return (
    <div>
      {/* Barre de navigation CITOYENNE (fond blanc, PAS d'icône admin) */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm py-2 px-4 flex justify-between items-center z-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Logo size={28} municipalLogo={MUNICIPAL_LOGO} />
          <h1 className="text-lg font-bold text-pfand-green tracking-tight">
            Pfand-Scout DE
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentView('kalender')} className="text-gray-500 hover:text-pfand-green p-2 rounded-full hover:bg-gray-100 transition" title="Abfallkalender" aria-label="Abfallkalender öffnen">
            <Calendar size={20} />
          </button>
          <button onClick={() => setCurrentView('ratgeber')} className="text-gray-500 hover:text-pfand-green p-2 rounded-full hover:bg-gray-100 transition" title="Abfall-Ratgeber" aria-label="Abfall-Ratgeber öffnen">
            <BookOpen size={20} />
          </button>
          <button onClick={() => setCurrentView('datenschutz')} className="text-gray-500 hover:text-pfand-green p-2 rounded-full hover:bg-gray-100 transition" title="Datenschutz" aria-label="Datenschutzerklärung öffnen">
            <Shield size={20} />
          </button>
          <button onClick={() => setCurrentView('dashboard')} className="ml-2 text-sm bg-pfand-green text-white px-3 py-1.5 rounded-full hover:bg-green-700 transition font-medium shadow-sm">
            🌱 {userData.totalPoints}
          </button>
        </div>
      </div>

      <div className="pt-16">
        {currentView === 'scanner' && (
          <Scanner onSwitchToQuiz={() => setCurrentView('quiz')} onAddPoints={handleAddPoints} onOpenRatgeber={() => setCurrentView('ratgeber')} onOpenDatenschutz={() => setCurrentView('datenschutz')} />
        )}
        {currentView === 'quiz' && <Quiz onBack={() => setCurrentView('scanner')} onAddPoints={handleAddPoints} />}
        {currentView === 'dashboard' && <Dashboard onBack={() => setCurrentView('scanner')} />}
        {currentView === 'datenschutz' && <Datenschutz onBack={() => setCurrentView('scanner')} />}
        {currentView === 'ratgeber' && <AbfallRatgeber onBack={() => setCurrentView('scanner')} />}
        {currentView === 'kalender' && <Abfallkalender onBack={() => setCurrentView('scanner')} />}
      </div>
    </div>
  );
}

export default App;