import { useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera, X, AlertCircle, HelpCircle, CheckCircle, Loader,
  ScanLine, Hand, BookOpen, ShieldCheck, ChevronRight,
  Database, MapPin, Trophy
} from 'lucide-react';
import Logo from './Logo';
import productsData from '../data/products.json';
import { findProductByEAN, disposalRules } from '../utils/pfandRules';

export default function Scanner({ onSwitchToQuiz, onAddPoints, onOpenRatgeber, onOpenDatenschutz }) {
  const [isScanning, setIsScanning] = useState(false);
  const [product, setProduct] = useState(null);
  const [scanNotFound, setScanNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const html5QrCodeRef = useRef(null);
  const isProcessingRef = useRef(false);

  // --- FONCTIONS DE MAPPING ---
  const mapMaterialToDisposal = (material) => {
    if (!material) return null;
    const m = material.toLowerCase();
    if (m.includes('pet') || m.includes('plastic') || m.includes('kunststoff') || m.includes('pp') || m.includes('pe')) return 'gelber_sack';
    if (m.includes('glass') || m.includes('glas')) return 'glas_weiss';
    if (m.includes('paper') || m.includes('cardboard') || m.includes('papier') || m.includes('pappe')) return 'papiermuell';
    if (m.includes('metal') || m.includes('aluminium') || m.includes('metall') || m.includes('tin')) return 'gelber_sack';
    if (m.includes('organic') || m.includes('bio')) return 'biomuell';
    return 'restmuell';
  };

  const detectPfand = (nameLower, ean) => {
    const pfandKeywords = ['flasche', 'pfand', 'mehrweg', 'bier', 'wasser', 'limonade', 'cola', 'schorle', 'getränk'];
    const hasPfandKeyword = pfandKeywords.some(k => nameLower.includes(k));
    const isGermanBeverage = ean.startsWith('40') && (nameLower.includes('liter') || nameLower.includes('l ') || nameLower.includes('ml'));
    return hasPfandKeyword || isGermanBeverage;
  };

  const getPfandAmount = (nameLower) => {
    if (nameLower.includes('0.33') || nameLower.includes('330ml')) return 0.08;
    if (nameLower.includes('0.5') || nameLower.includes('500ml')) return 0.15;
    if (nameLower.includes('1l') || nameLower.includes('1 liter')) return 0.25;
    return 0.25; // Par défaut
  };

  const detectDisposalByName = (nameLower, categories) => {
    // Boîtes de conserve, canettes (RÉPOND AU PROBLÈME DES HARICOTS/BOHNEN)
    if (nameLower.includes('dose') || nameLower.includes('konserv') || nameLower.includes('can') || 
        nameLower.includes('bohnen') || nameLower.includes('mais') || nameLower.includes('erbse') ||
        nameLower.includes('suppe') || nameLower.includes('gemüse')) {
      return 'gelber_sack'; 
    }
    // Bouteilles en verre
    if (nameLower.includes('glas') || nameLower.includes('flasche') || nameLower.includes('wein') || 
        nameLower.includes('sekt') || nameLower.includes('bier')) {
      return 'glas_weiss';
    }
    // Bouteilles plastique
    if (nameLower.includes('pet') || nameLower.includes('plastik') || nameLower.includes('flasche')) {
      return 'gelber_sack';
    }
    // Papier/carton
    if (nameLower.includes('papier') || nameLower.includes('karton') || nameLower.includes('pappe') ||
        nameLower.includes('cornflakes') || nameLower.includes('cerealien')) {
      return 'papiermuell';
    }
    // Bio
    if (nameLower.includes('bio') || nameLower.includes('obst') || nameLower.includes('gemüse')) {
      return 'biomuell';
    }
    return 'gelber_sack'; // Défaut plus logique que restmuell pour les emballages
  };

  // --- LOGIQUE DE SCAN ---
  const startScan = async () => {
    try {
      setError(null); setProduct(null); setScanNotFound(false); setEarnedPoints(0);
      setIsScanning(true); isProcessingRef.current = false;
      await new Promise(resolve => setTimeout(resolve, 300));
      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (isProcessingRef.current) return;
          isProcessingRef.current = true;
          html5QrCode.stop().catch(err => console.log(err)).finally(() => {
            setIsScanning(false); handleScanResult(decodedText);
          });
        },
        () => {}
      );
    } catch (err) {
      console.error("Erreur démarrage:", err);
      setIsScanning(false);
      setError("Kamera konnte nicht gestartet werden.");
    }
  };

  const handleScanResult = async (ean) => {
    const cleanEan = ean.trim();
    const localProduct = findProductByEAN(cleanEan, productsData.products);
    if (localProduct) { showProduct(localProduct); return; }

    setIsLoading(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanEan}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const p = data.product;
        const packaging = p.packaging || [];
        const materialInfo = packaging[0]?.material || p.packaging_material || '';
        
        const nameLower = (p.product_name_de || p.product_name || '').toLowerCase();
        const isPfand = detectPfand(nameLower, cleanEan);
        
        if (isPfand) {
          showProduct({
            ean: cleanEan,
            name: p.product_name_de || p.product_name || 'Unbekanntes Produkt',
            category: 'getraenk',
            material: 'pfand',
            pfand: true,
            pfandAmount: getPfandAmount(nameLower),
            disposal: 'pfand_rueckgabe',
            description: 'Mehrwegflasche mit Pfand. Im Supermarkt zurückgeben.',
            icon: '🍾',
            source: 'Open Food Facts'
          });
          return;
        }
        
        let disposalKey = mapMaterialToDisposal(materialInfo);
        if (!disposalKey) {
          disposalKey = detectDisposalByName(nameLower, p.categories_tags || []);
        }
        
        const name = p.product_name_de || p.product_name || 'Unbekanntes Produkt';
        showProduct({
          ean: cleanEan, name, category: 'offen', material: materialInfo || 'unbekannt',
          pfand: false, pfandAmount: 0, disposal: disposalKey,
          description: disposalRules[disposalKey].description, icon: '📦', source: 'Open Food Facts'
        });
      } else { setScanNotFound(true); }
    } catch (err) { console.error("Erreur API:", err); setScanNotFound(true); }
    finally { setIsLoading(false); }
  };

  const showProduct = (found) => {
    setProduct(found);
    const points = found.pfand ? 50 : disposalRules[found.disposal]?.points || 10;
    const action = found.pfand ? `Pfand erkannt: ${found.name}` : `Sortiert: ${found.name}`;
    setEarnedPoints(points);
    if (onAddPoints) onAddPoints(points, action, found.name);
  };

  const stopScan = async () => {
    try { if (html5QrCodeRef.current) await html5QrCodeRef.current.stop(); }
    catch (err) { console.log(err); }
    finally { setIsScanning(false); setProduct(null); setScanNotFound(false); setEarnedPoints(0); }
  };

  // --- RENDU JSX ---
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">

        {!isScanning && !product && !scanNotFound && !error && !isLoading && (
          <div className="space-y-5">
            <div className="text-center pt-2">
              <div className="flex justify-center mb-2"><Logo size={56} /></div>
              <h2 className="text-2xl font-bold text-gray-800 leading-tight">Richtig trennen.<br /><span className="text-pfand-green">Ganz einfach.</span></h2>
              <p className="text-sm text-gray-500 mt-2">Dein intelligenter Müll-Coach für Deutschland 🇩🇪</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-100">
                <Database size={18} className="mx-auto text-pfand-green mb-1" />
                <p className="text-base font-bold text-gray-800">3 Mio.+</p>
                <p className="text-[10px] text-gray-500 leading-tight">Produkte erkannt</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-100">
                <MapPin size={18} className="mx-auto text-pfand-green mb-1" />
                <p className="text-base font-bold text-gray-800">400+</p>
                <p className="text-[10px] text-gray-500 leading-tight">Landkreise</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-100">
                <Trophy size={18} className="mx-auto text-pfand-green mb-1" />
                <p className="text-base font-bold text-gray-800">100%</p>
                <p className="text-[10px] text-gray-500 leading-tight">lokal &amp; gratis</p>
              </div>
            </div>

            <button onClick={startScan} className="w-full bg-pfand-green text-white py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-green-700 transition shadow-lg text-lg font-semibold">
              <ScanLine size={26} /> Barcode scannen
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={onSwitchToQuiz} className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-pfand-green hover:shadow-md transition">
                <Hand size={22} className="text-orange-500 mb-2" />
                <p className="text-sm font-bold text-gray-800">Ohne Barcode?</p>
                <p className="text-xs text-gray-500">Sortier-Quiz</p>
              </button>
              <button onClick={onOpenRatgeber} className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-pfand-green hover:shadow-md transition">
                <BookOpen size={22} className="text-blue-500 mb-2" />
                <p className="text-sm font-bold text-gray-800">Regeln &amp; Standorte</p>
                <p className="text-xs text-gray-500">Abfall-Ratgeber</p>
              </button>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">So funktioniert's</p>
              <div className="space-y-3">
                {[
                  { n: 1, t: 'Produkt scannen', d: 'Barcode oder Quiz nutzen', icon: <ScanLine size={16} /> },
                  { n: 2, t: 'Richtige Tonne', d: 'Sofortiger Sortiertipp', icon: <CheckCircle size={16} /> },
                  { n: 3, t: 'Punkte sammeln', d: 'Abzeichen freischalten', icon: <Trophy size={16} /> },
                ].map((s) => (
                  <div key={s.n} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-pfand-green text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{s.n}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 flex items-center gap-1">{s.icon} {s.t}</p>
                      <p className="text-xs text-gray-500">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={onOpenDatenschutz} className="w-full flex items-center justify-center gap-2 py-2 text-xs text-gray-500 hover:text-pfand-green transition">
              <ShieldCheck size={14} className="text-pfand-green" />
              DSGVO-konform · Keine Tracker · Daten bleiben lokal
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {error && !isScanning && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4">
            <p className="text-red-700 text-sm">{error}</p>
            <button onClick={startScan} className="mt-2 w-full bg-pfand-green text-white py-2 rounded-lg">Erneut versuchen</button>
          </div>
        )}

        {isScanning && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div id="reader" className="w-full" style={{ minHeight: '400px' }}></div>
            <button onClick={stopScan} className="w-full bg-red-500 text-white py-3 flex items-center justify-center gap-2 hover:bg-red-600 transition">
              <X size={20} /> Abbrechen
            </button>
          </div>
        )}

        {isLoading && (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Loader className="mx-auto text-pfand-green animate-spin mb-2" size={32} />
            <p className="text-gray-600">Produkt wird gesucht...</p>
          </div>
        )}

        {product && !isScanning && !isLoading && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            {earnedPoints > 0 && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded-lg text-center">
                <p className="text-sm text-green-800 font-medium">🌱 +{earnedPoints} Öko-Punkte erhalten!</p>
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{product.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
                <p className="text-sm text-gray-500">EAN: {product.ean}</p>
                {product.source && <p className="text-xs text-gray-400">Quelle: {product.source}</p>}
              </div>
            </div>

            {/* NOUVEAU BLOC PFAND TRÈS VISIBLE */}
            {product.pfand && (
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white p-2 rounded-full">
                    <span className="text-2xl">💶</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Pfand erkannt!</h3>
                    <p className="text-blue-100 text-sm">Dieses Produkt hat einen Pfandwert</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Pfandbetrag:</span>
                    <span className="text-2xl font-bold text-blue-600">{product.pfandAmount.toFixed(2)} €</span>
                  </div>
                </div>

                <div className="bg-yellow-100 border-l-4 border-yellow-400 p-3 rounded">
                  <p className="text-sm text-yellow-800 font-medium mb-1">⚠️ Nicht wegwerfen!</p>
                  <p className="text-xs text-yellow-700">
                    Bringen Sie diese Flasche/Dose zum Supermarkt und erhalten Sie <strong>{product.pfandAmount.toFixed(2)} €</strong> zurück.
                  </p>
                </div>

                <button className="mt-3 w-full bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 transition">
                  📍 Nächste Pfand-Automaten finden
                </button
              </div>
            )}

            <div className={`p-4 border-l-4 rounded ${disposalRules[product.disposal].color}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{disposalRules[product.disposal].icon}</span>
                <span className="font-bold text-gray-800">{disposalRules[product.disposal].bin}</span>
              </div>
              <p className="text-sm text-gray-700">{disposalRules[product.disposal].description}</p>
            </div>

            <button onClick={() => { setProduct(null); setEarnedPoints(0); }} className="mt-4 w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition">
              Weiteres Produkt scannen
            </button>
          </div>
        )}

        {scanNotFound && !isScanning && !isLoading && (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <AlertCircle className="mx-auto text-yellow-500 mb-2" size={48} />
            <h2 className="text-lg font-semibold mb-2">Produkt nicht gefunden</h2>
            <p className="text-gray-600 text-sm mb-4">Dieses Produkt ist weder in unserer Datenbank noch bei Open Food Facts vorhanden.</p>
            <button onClick={onSwitchToQuiz} className="w-full bg-orange-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition mb-3">
              <HelpCircle size={20} /> Manuelles Sortieren (Quiz)
            </button>
            <button onClick={() => setScanNotFound(false)} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition">
              Anderes Produkt scannen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}