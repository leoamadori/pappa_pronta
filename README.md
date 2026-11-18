# 🥗 Pappa Pronta — Cucina Sana dalla Dispensa, Scanner Etichette & Spesa Intelligente

[![Build Android APK](https://github.com/leoamadori/pappa_pronta/actions/workflows/build-apk.yml/badge.svg)](https://github.com/leoamadori/pappa_pronta/actions/workflows/build-apk.yml)
![PWA Offline-Ready](https://img.shields.io/badge/PWA-Offline--Ready-1B6B46)
![Architettura](https://img.shields.io/badge/Privacy-Local--First%20%2B%20Cloud%20Sync-145336)

**Pappa Pronta** è un'applicazione web progressiva (**PWA**) e **app nativa Android (Capacitor)** progettata per trasformare gli ingredienti che hai già in casa in pasti sani, veloci e adatti alle tue esigenze — anche completamente offline al supermercato.

🌐 **Apri subito l'app live:**
- **Web App & Login Cloud:** [https://pappa-pronta-leo.web.app](https://pappa-pronta-leo.web.app)
- **GitHub Pages:** [https://leoamadori.github.io/pappa_pronta/](https://leoamadori.github.io/pappa_pronta/)

---

## ✨ Caratteristiche Principali

### 🚀 Avvio Rapido in 30 Secondi + Configurazione Completa Opzionale
- **Avvio Rapido (`Passo 0`):** parte con un profilo neutro e **6 ingredienti base universali** (`Pasta integrale`, `Riso integrale`, `Pomodori`, `Ceci`, `Patate`, `Mele`) così chiunque può vedere subito ricette pronte senza trovarsi patologie o cibi particolari pre-attivati.
- **Configurazione Completa (4 passi) & Preset Sportivo:** chi vuole può impostare età, peso, altezza, obiettivo, allergie UE, esigenze di salute (pressione/sale, più proteine sport/over-50, salute gengive/zuccheri, celiachia, glicemia, colesterolo) oppure attivare con un tocco il **Preset Plant-Based Sport**.
- **3 Regimi alimentari:** `🐟 Mediterraneo / Di tutto`, `🥚 Vegetariano` o `🌱 100% Vegetale`.

### 🏠 Scheda «Oggi» — Dispensa, Pasti di Oggi, 12 Cibi Sani & Strumenti Avanzati
- **Dispensa Semplificata (100+ alimenti):** ricerca istantanea, contatore live delle ricette pronte subito, **1 tocco** per segnare un cibo in casa (`✅`) e pulsante dedicato **`⏳`** accanto agli ingredienti presenti per segnarli in scadenza (senza doppi tocchi a tempo). I cibi personalizzati aggiunti fuori elenco vengono collegati automaticamente agli ingredienti base del ricettario.
- **Pasti & Energia di Oggi:** riepilogo immediato di calorie e proteine assunte rispetto all'obiettivo giornaliero con elenco dei pasti segnati.
- **I 12 Cibi Sani di Oggi:** griglia interattiva (`0–24` porzioni) con pulsante rapido `−` per correggere una spunta, guida rapida alle quantità di 1 porzione e dettagli Sodio/Potassio a scomparsa.
- **Passi, Consigli & Cloud:** riepilogo di passi, calorie attive, consigli pratici personalizzati e storico degli ultimi 7 giorni.
- **Strumenti Avanzati a scomparsa:** timer **Digiuno Intermittente Guidato** (`Libero`, `12:12`, `14:10`, `16:8`) basato su timestamp continui anche oltre la mezzanotte con guida alle 5 fasi metaboliche, **Grafico SVG 7 Giorni** e promemoria giornalieri (`Vit. B12`, `Omega-3`, `Vit. D3`, acqua pre-pasto).

### 🍳 Scheda «Cucina» — Crea un Piatto, Ricettario Italiano & Pasto Libero
- **Crea un Piatto con Quello che Hai:** genera colazioni, spuntini, pranzi e cene dando priorità agli alimenti in scadenza (`⏳`), adattando l'energia tra **`⚡ Giorno Attivo`** e **`🧘 Giorno Leggero`** e rispettando sempre dieta e allergeni (incluse celiachia e allergia a frutta a guscio/lupini).
- **Scala Porzioni (`80% – 150%`):** regola al volo le grammature mantenendo aperta la scheda della ricetta e salva le tue combinazioni preferite.
- **Ricettario Italiano (34 piatti):** 22 piatti principali della tradizione + 8 colazioni/spuntini (incluse opzioni naturalmente senza glutine e senza allergeni comuni) + 4 ricette vegetariane/mediterranee.
- **Analisi Pasto a Parole Tue:** riconosce tutti gli alimenti del database con sinonimi italiani e grammature opzionali, proponendo come completare il piatto.

### 📷 Scheda «Scanner» — Codice a Barre Universale, Foto Etichetta Offline & Semaforo
- **Lettore Codici su Android, iPhone/iPad e Desktop:** usa `BarcodeDetector` nativo dove presente e carica automaticamente il lettore compatibile Safari iOS / Firefox quando necessario, con ricerca rapida su cache locale e Open Food Facts (timeout `4s` anti-rete debole).
- **Semaforo Nutrizionale (`🟢 VERDE` / `🟡 GIALLO` / `🔴 ROSSO`):** controlla sale/sodio, zuccheri aggiunti e sciroppi (distinguendo gli zuccheri naturali della frutta intera), grassi saturi, oli raffinati, celiachia e i 12 allergeni UE senza falsi allarmi su diciture *«senza glutine»*, *«senza lattosio»*, *burro di cacao* o bevande vegetali.
- **Azioni rapide sul prodotto controllato:** `＋ Aggiungi a Dispensa`, `🍽 Mangia ora (100g)` e `💾 Salva nei recenti`.
- **Ritaglio Etichetta a 4 Maniglie + Lettore Offline:** ritaglia la colonna per `100 g` o la lista ingredienti distinguendo automaticamente `kcal` da `kJ`.
- **«Posso mangiarlo? (Cibi Sfusi)»:** prontuario ricercabile coerente con il regime alimentare e le allergie scelte nel profilo.

### 📅 Scheda «Menu & Spesa» — Menu 7 Giorni, Lista Spesa con Grammi & Profilo
- **Menu della Settimana (7 Giorni):** pianifica `4 pasti` o `Pranzo + Cena` con badge cliccabili per alternare ogni singolo giorno tra `⚡ Giorno Attivo` e `🧘 Giorno Leggero`.
- **Lista della Spesa Automatica:** somma i grammi totali necessari nella settimana; toccando **`✓ Preso`** l'ingrediente passa subito in Dispensa.
- **Profilo, Obiettivi & Backup:** obiettivi giornalieri automatici o personalizzati, condivisione nativa del file di backup `.json` su smartphone/APK (`Web Share API`) e cancellazione locale sicura che scollega prima eventuale Cloud attivo.

---

## ❤️ Google Health Connect & Apple Salute

- **Su Android (APK nativo):** integrazione diretta con **Google Health Connect** (con permessi Android 13–15 dedicati) per leggere **Passi**, **Calorie attive** e **Peso** e inviare i singoli pasti registrati (`kcal`, `proteine`, `acqua`, `peso`) senza duplicazioni.
- **Su iPhone / iOS (Safari):** ponte tramite **Comandi Rapidi (Apple Shortcuts)** con richiesta di conferma prima di aggiornare il peso.
- **Passaggio automatico a Giorno Attivo:** oltre **`7.500 passi`** o **`300 kcal attive`**, l'app attiva **`⚡ Giorno Attivo`** e spunta **`🏃 Movimento`** nei 12 Cibi Sani.

---

## 📲 Come Installarla

### 1. Come App Web (PWA — Android, iPhone, PC/Mac)
1. Apri [https://pappa-pronta-leo.web.app](https://pappa-pronta-leo.web.app).
2. **Android (Chrome):** tocca **«Installa ora»** (oppure `⋮ → Installa app`).
3. **iPhone / iPad (Safari):** tocca **Condividi (`↑`) → Aggiungi alla schermata Home**.
4. *(Consigliato sotto Wi-Fi)* Vai in **`📅 Menu & Spesa → Backup su file, lettore etichette offline e installazione`** e tocca **`📥 Scarica lettore offline`**.

### 2. Come APK Nativo Android (`Release` firmato con Health Connect & Login Google)
Ad ogni push sul branch `main`, **GitHub Actions** compila l'APK Android `Release` firmato e aggiorna la release:
1. Apri **[Scarica `pappa-pronta.apk` (Ultima Versione)](https://github.com/leoamadori/pappa_pronta/releases/download/latest/pappa-pronta.apk)**.
2. Se avevi installato una vecchia versione `debug` precedente, disinstallala una volta prima di installare la versione `Release` firmata; gli aggiornamenti successivi si installeranno direttamente sopra mantenendo i dati.

---

## 🛠️ Struttura del Progetto

| File | Ruolo |
| :--- | :--- |
| `index.html` | Applicazione single-file mobile-first (UI, database alimenti/ricette, semaforo, lettore foto, Cloud Sync e Health Connect) |
| `manifest.json` | Web App Manifest standalone con icone adattive e scorciatoie rapide |
| `sw.js` | Service Worker offline-first per Web/PWA (disattivato automaticamente dentro l'APK nativo per preservare il bridge Capacitor) |
| `.well-known/assetlinks.json` | Verifica Android App Links (`it.pappapronta.app`) per il rientro OAuth su `https://pappa-pronta-leo.web.app/auth-callback` |
| `icons/` | Icone PNG (`180x180`, `192x192`, `512x512`, `512x512 maskable`) |
| `firestore.rules` | Regole Cloud Firestore con isolamento per singolo utente e validazione campi/limiti |
| `firebase.json` | Configurazione Firebase Hosting (`Cache-Control: no-cache` su HTML/SW/Manifest + security headers) |
| `google-services.json` | Configurazione client OAuth Android per il Login Google nativo |
| `.github/workflows/build-apk.yml` | Pipeline CI/CD GitHub Actions (`assembleRelease` firmato, `singleTask`, permessi Health Connect Android 13–15) |

---

## ⚖️ Note, Sicurezza & Privacy (GDPR)

- **Privacy & Isolamento Account:** nessun tracciamento pubblicitario. Senza login Cloud tutti i dati restano sul dispositivo (`localStorage`); con Cloud Sync ogni utente accede esclusivamente al proprio spazio privato su server europei (`eur3`), con protezione contro contaminazioni tra account dopo il logout e cancellazione definitiva con un tocco (**Diritto all'oblio**).
- **Fonti Dati Prodotti:** ricerca codici a barre tramite [Open Food Facts](https://world.openfoodfacts.org/) (licenza ODbL).
- **Avvertenza Medica:** i calcoli e le valutazioni nutrizionali hanno scopo puramente informativo e organizzativo e non sostituiscono il parere di un medico, biologo nutrizionista o dietista.
