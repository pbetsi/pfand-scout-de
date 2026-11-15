# ♻️ Pfand-Scout DE

[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)](https://pfand-scout-de.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Made with React](https://img.shields.io/badge/Made_with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)

> **Intelligenter Müll-Coach für Deutschland** – Barcode-Scan, Sortier-Quiz, Pfand-Erkennung und kommunales White-Label. DSGVO-konform, keine Tracker, Daten bleiben lokal.

---

## 🎯 Das Problem

In Deutschland gibt es über **400 Landkreise** mit unterschiedlichen Mülltrennungsregeln. Bürger:innen sind oft überfordert, und **Fehlwürfe** verursachen erhebliche Mehrkosten für Kommunen. Gleichzeitig gehen Millionen von Pfandflaschen verloren, weil Bürger:innen sie nicht erkennen.

## 💡 Die Lösung

**Pfand-Scout DE** ist eine Progressive Web App (PWA), die:
- 📷 **Barcodes scannt** und sofort die richtige Tonne anzeigt
- 💶 **Pfand erkennt** und warnt: "Nicht wegwerfen – zurückgeben!"
- 🤔 **Quiz-Modus** für Produkte ohne Barcode (mit der deutschen "löffelrein"-Regel)
- 🌱 **Gamification** mit Öko-Punkten und Abzeichen motiviert zum richtigen Trennen
- 📍 **Geolokalisierung** (PLZ + GPS) für regionale Regeln
- 🔒 **100% DSGVO-konform** – keine Tracker, Daten bleiben lokal

---

## ✨ Features

### 🎯 Kernfunktionen
- **Intelligenter Scanner**: Lokale Datenbank + Open Food Facts API (3 Mio.+ Produkte)
- **Fallback-System**: 3-stufige Architektur (Lokal → API → Quiz) – die App stürzt nie ab
- **Pfand-Erkennung**: Warnt bei 0,08€ – 0,25€ Pfandflaschen
- **Sortier-Quiz**: Visuelle Auswahl (Material + Sauberkeit) mit deutscher "löffelrein"-Regel
- **Öko-Punkte & Badges**: 5 Abzeichen von "Anfänger" bis "Nachhaltigkeits-Meister"
- **Abfall-Ratgeber**: 5 Tonnen-Farben mit Beispielen (Gelber Sack, Papiertonne, etc.)
- **Standort-Erkennung**: PLZ-Suche + GPS-Ortung (Nominatim/OpenStreetMap)
- **White-Label-Ready**: Kommunale Logos und Farben in einer Zeile konfigurierbar

### 🔒 Datenschutz & Compliance
- ✅ **DSGVO-konform** – keine personenbezogenen Daten
- ✅ **Keine Tracker** – kein Google Analytics, keine Cookies
- ✅ **Lokale Speicherung** – localStorage im Browser
- ✅ **Barrierefreiheit** – ARIA-Labels, hohe Kontraste (BITV 2.0 ready)
- ✅ **Offline-fähig** – Basis-Funktionen ohne Internet

---

## 🚀 Live Demo

👉 **[https://pfand-scout-de.vercel.app](https://pfand-scout-de.vercel.app)**

Testen Sie die App direkt auf Ihrem Smartphone – die Kamera funktioniert nativ dank HTTPS.

---

## 🛠️ Tech Stack

| Technologie | Zweck |
|-------------|-------|
| **React 18** | UI-Framework |
| **Vite** | Build-Tool & Dev-Server |
| **Tailwind CSS** | Styling (mobile-first) |
| **html5-qrcode** | Barcode-Scanner |
| **Open Food Facts API** | Produktdatenbank (3M+ Produkte) |
| **Nominatim (OSM)** | Geolokalisierung |
| **Lucide React** | Icons |
| **localStorage** | Offline-Datenspeicherung |

---

## 📦 Installation & Entwicklung

```bash
# Repository klonen
git clone https://github.com/pbetsi/pfand-scout-de.git
cd pfand-scout-de

# Dependencies installieren
npm install

# Development-Server starten
npm run dev

# Production-Build erstellen
npm run build