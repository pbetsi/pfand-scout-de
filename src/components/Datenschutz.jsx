import { ArrowLeft, Shield, Lock, Database, Eye, UserCheck } from 'lucide-react';

export default function Datenschutz({ onBack }) {
  const sections = [
    {
      icon: <Shield className="text-pfand-green" size={24} />,
      title: "Datenschutz nach DSGVO",
      content: "Pfand-Scout DE wurde entwickelt, um die Privatsphäre seiner Nutzer zu respektieren. Wir halten uns strikt an die Datenschutz-Grundverordnung (DSGVO) der Europäischen Union."
    },
    {
      icon: <Database className="text-blue-500" size={24} />,
      title: "Lokale Datenspeicherung",
      content: "Alle deine Daten (Öko-Punkte, Verlauf, Abzeichen) werden ausschließlich lokal auf deinem Gerät gespeichert (localStorage). Es werden KEINE personenbezogenen Daten an externe Server übertragen."
    },
    {
      icon: <Eye className="text-purple-500" size={24} />,
      title: "Kein Tracking",
      content: "Wir verwenden keine Cookies, keine Analytics-Tools (wie Google Analytics) und keine Tracker. Deine Nutzung bleibt komplett anonym."
    },
    {
      icon: <Lock className="text-red-500" size={24} />,
      title: "Kamera-Daten",
      content: "Die Kamera wird ausschließlich zum Scannen von Barcodes verwendet. Die Kamerabilder werden NICHT gespeichert oder übertragen. Die Verarbeitung erfolgt in Echtzeit im Browser."
    },
    {
      icon: <UserCheck className="text-orange-500" size={24} />,
      title: "Open Food Facts API",
      content: "Beim Scannen wird nur der Barcode (EAN-Code) anonym an die öffentliche Open Food Facts API gesendet, um Produktinformationen abzurufen. Es werden keine personenbezogenen Daten übermittelt."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="text-pfand-green hover:text-green-700">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-pfand-green text-center flex-1">
            Datenschutz 🔒
          </h1>
        </div>

        {/* Intro */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg mb-6 text-center">
          <Shield size={48} className="mx-auto mb-2" />
          <h2 className="text-xl font-bold mb-1">Deine Daten gehören dir</h2>
          <p className="text-sm opacity-90">
            Wir nehmen Datenschutz ernst — besonders in Deutschland.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">{section.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">{section.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
{/* Footer légal */}
<div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
  <p className="text-xs text-gray-500 mb-2">
    <strong>Verantwortlicher:</strong> Pfand-Scout DE
  </p>
  <p className="text-xs text-gray-500 mb-2">
    <strong>Kontakt:</strong>{' '}
    <a href="mailto:paulbetsi17@yahoo.com" className="text-pfand-green underline">
      paulbetsi17@yahoo.com
    </a>
  </p>
  <p className="text-xs text-gray-400">
    © 2026 Pfand-Scout DE
  </p>
</div>

        {/* Bouton retour */}
        <button
          onClick={onBack}
          className="mt-4 w-full bg-pfand-green text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition"
        >
          <ArrowLeft size={20} />
          Zurück zur App
        </button>
      </div>
    </div>
  );
}