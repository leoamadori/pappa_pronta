# 🥗 Pappa Pronta — Nutrizione Clinica, Sportiva & Spesa Intelligente

[![Build Android APK](https://github.com/leoamadori/pappa_pronta/actions/workflows/build-apk.yml/badge.svg)](https://github.com/leoamadori/pappa_pronta/actions/workflows/build-apk.yml)
![PWA Offline-Ready](https://img.shields.io/badge/PWA-Offline--Ready-1B6B46)
![Architettura](https://img.shields.io/badge/Privacy-Local--First%20%2B%20Cloud%20Sync-145336)

**Pappa Pronta** è un'applicazione web progressiva (**PWA**) e **app nativa Android (Capacitor)** progettata per trasformare quello che hai già in dispensa in pasti sani, bilanciati e su misura per i tuoi obiettivi clinici e sportivi — anche completamente offline al supermercato.

🌐 **Apri subito l'app live:**
- **Cloud & Login Google immediato:** [https://pappa-pronta-leo.web.app](https://pappa-pronta-leo.web.app)
- **GitHub Pages:** [https://leoamadori.github.io/pappa_pronta/](https://leoamadori.github.io/pappa_pronta/)

---

## ✨ Caratteristiche Principali

### 🚀 Pensata per tutti (Onboarding Multi-Utente & Multi-Dieta)
Al primo avvio un wizard guidato in **4 passi** configura automaticamente fabbisogno calorico, BMI, macronutrienti e filtri alimentari:
- **3 Regimi alimentari a scelta:** `🌱 100% Plant-Based / Vegano`, `🥚 Vegetariano` o `🐟 Mediterraneo / Onnivoro Salutare`.
- **Moduli salute personalizzabili:** Prevenzione Ipertensione (`< 1.500 mg` sodio/die, rapporto `K:Na ≥ 3,1:1`), Soglia Anabolica Sport / Over-50 (`30–35 g` proteine/pasto), Scudo Parodontale & Controllo Infiammazione/Zuccheri (`DII`), Colesterolo, Glicemia e **12 allergeni UE**.
- **Login Google / Email (opzionale):** l'app funziona al 100% in locale senza registrazione; chi desidera sincronizzare profilo, dispensa e progressi tra smartphone e PC può accedere con un tocco tramite **Firebase Cloud Sync** (con dati strettamente privati per singolo utente).

### 🏠 Tab «Oggi» — Digiuno 16:8, Daily Dozen & Dispensa
- **Tracker Digiuno Intermittente `16:8`:** sincronizzato in automatico con il primo e l'ultimo pasto registrato, barra di avanzamento, indicatore della fase metabolica (calo insulinico, lipolisi, autofagia), rettifica rapida `HH:MM` e chiusura finestra serale.
- **Daily Dozen & Bilancio Elettroliti:** griglia interattiva delle 12 categorie del Dr. Michael Greger (`X/24`) + monitoraggio live di **Sodio** (`max 1500 mg`) e **Potassio** (`target 4700 mg`).
- **Trend SVG 7 Giorni:** grafico vettoriale nativo a doppio quadrante con curva Daily Dozen e barre normalizzate Sodio/Potassio.
- **Dispensa Italiana (105+ alimenti):** ricerca istantanea, contatore live delle ricette pronte subito, aggiunta alimenti personalizzati (*Altro*), **tap singolo** = *in casa* (`✅`), **doppio tap** = *da consumare presto* (`⏳`).

### 🍳 Tab «Cucina» — Generatore Piatti, Ricettario Regionale & Analisi Pasto
- **Inventa Piatto dalla Dispensa:** genera colazioni, spuntini, pranzi e cene dando priorità agli alimenti in scadenza (`⏳`), adattando i carboidrati tra **`⚡ Giorno Workout`** e **`🧘 Giorno Riposo`** (*Carb Cycling*), abbinando automaticamente **Ferro + Vitamina C** (limone/peperoni) e spezie vasodilatatrici a zero sale aggiunto.
- **Scaling Porzioni & Grammature Live:** bottoni `80% – 150%` e regolatori `− / +` per singolo ingrediente + salvataggio nelle **Ricette Salvate**.
- **Ricettario Italiano (30 piatti):** 20 piatti regionali italiani 100% vegetali + colazioni/spuntini sportivi e varianti mediterranee, ordinati automaticamente in base agli ingredienti che hai già in casa.
- **«Cosa ho mangiato oggi?»:** analizzatore testuale libero con stima nutrienti e suggerimenti intelligenti **«Completa il pasto»** dalla tua dispensa.

### 📷 Tab «Scanner» — Codice a Barre, OCR Offline & Semaforo Clinico
- **Cascata veloce al supermercato:** `1. Cache locale EAN istantanea` → `2. Open Food Facts API` → `3. Ritaglio fotografico 100g + OCR Offline`.
- **Ritaglio `<canvas>` a 4 maniglie touch:** isola la colonna per `100 g` con upscaling `1.5x`, filtro **Alto Contrasto B/N** ed estrazione testo tramite **Tesseract.js v5 (`ita+eng`)** funzionante anche nei supermercati senza segnale dati.
- **Semaforo Nutrizionale (`VERDE` / `GIALLO` / `ROSSO`):** valuta Sodio, Zuccheri fermentabili, Grassi saturi, Oli raffinati ricchi di Omega-6 (`girasole`, `mais`, `palma`, `colza`), conformità alla dieta scelta ed eventuali allergeni personali.
- **«Posso mangiarlo?»:** prontuario rapido ricercabile di oltre 110 alimenti sfusi e comuni.

### 📅 Tab «Menu & Spesa» — Pianificazione Settimanale a Ciclo Chiuso
- **Menu 7 Giorni:** genera la settimana completa (`4 pasti/giorno` oppure `Pranzo + Cena`) alternando giornate *Workout* e *Riposo* con indicatori semaforici di copertura dispensa e copia rapida negli appunti.
- **Lista della Spesa Automatica:** aggrega solo gli ingredienti mancanti; toccando **`✓ Preso`** al supermercato l'ingrediente entra direttamente in **Dispensa**.
- **Backup Locale:** esportazione e ripristino completo in formato `.json`.

---

## ❤️ Google Health Connect & Apple Salute

- **Su Android (tramite APK nativo):** integrazione diretta con **Google Health Connect** (`@capgo/capacitor-health`) per leggere **Passi**, **Calorie attive** e **Peso** e inviare **Kcal assunte, Proteine, Acqua e Peso**.
- **Su iPhone / iOS (PWA Safari):** ponte rapido tramite **Comandi Rapidi (Apple Shortcuts)** per importare Passi/Kcal/Peso da **Apple Salute** ed esportare i nutrienti giornalieri.
- **Automazione Carb Cycling:** al superamento di **`7.500 passi`** o **`300 kcal attive`**, l'app imposta automaticamente **`⚡ Giorno Workout`** e spunta **`🏃 Movimento`** nella Daily Dozen.

---

## 📲 Come Installarla

### 1. Come App Web (PWA — Android, iPhone, PC/Mac)
1. Apri [https://pappa-pronta-leo.web.app](https://pappa-pronta-leo.web.app).
2. **Android (Chrome):** tocca il banner **«Installa ora»** (oppure `⋮ → Installa app`).
3. **iPhone / iPad (Safari):** tocca **Condividi (`↑`) → Aggiungi alla schermata Home**.
4. *(Consigliato sotto Wi-Fi)* Vai in **`📅 Menu & Spesa`** e tocca **`📥 Pre-scarica OCR Offline`** per salvare sul telefono i dizionari OCR italiano/inglese.

### 2. Come APK Nativo Android (con Google Health Connect)
Ad ogni modifica sul branch `main`, **GitHub Actions** compila automaticamente l'APK Android:
1. Apri la scheda **[Actions](https://github.com/leoamadori/pappa_pronta/actions)** di questo repository.
2. Clicca sull'ultima esecuzione completata col segno di spunta verde (`Build Pappa Pronta Android APK`).
3. Scorri in fondo alla sezione **Artifacts** e scarica **`app-debug.apk`**.

---

## 🛠️ Struttura del Progetto

| File | Ruolo |
| :--- | :--- |
| `index.html` | Applicazione single-file mobile-first (UI, database alimenti/ricette, motore clinico, OCR, Firebase Sync e Health Bridge) |
| `manifest.json` | Web App Manifest standalone con icone adattive e scorciatoie rapide da schermata Home |
| `sw.js` | Service Worker offline-first per App Shell, `Tesseract.js` v5 e modelli `.traineddata.gz` |
| `icons/` | Icone PNG anti-aliasate (`180x180`, `192x192`, `512x512`, `512x512 maskable`) |
| `firestore.rules` | Regole di sicurezza Cloud Firestore con isolamento rigoroso per singolo utente (`/users/{uid}`) |
| `.github/workflows/build-apk.yml` | Pipeline CI/CD GitHub Actions con `@capacitor/android` e `@capgo/capacitor-health` |

---

## ⚖️ Note & Privacy

- **Privacy by Design:** nessun tracciamento pubblicitario. In modalità locale i dati risiedono unicamente sul dispositivo (`localStorage` con `navigator.storage.persist()`); con Cloud Sync attivo ogni utente accede esclusivamente al proprio documento privato.
- **Fonti Dati Prodotti:** ricerca codici EAN tramite [Open Food Facts](https://world.openfoodfacts.org/) (licenza ODbL).
- **Avvertenza Medica:** i calcoli e le valutazioni nutrizionali hanno finalità puramente informativa e organizzativa e non sostituiscono in alcun modo il parere di un medico, biologo nutrizionista o dietista.
