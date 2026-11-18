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

### 🏠 Tab «Oggi» — Digiuno Guidato, Daily Dozen, Riepilogo Sync & Dispensa
- **Digiuno Intermittente Guidato (`16:8` · `14:10` · `12:12` · `Libero`):** selettore rapido del ritmo preferito, stato spiegato in italiano semplice, **1 solo pulsante principale** (`🍽 Ho iniziato a mangiare` / `🌙 Ho finito di cenare`) e **guida interattiva alle 5 fasi metaboliche** (`0–4h Digestione`, `4–8h Calma Insulina`, `8–12h Cambio Carburante`, `12–16h Brucia-Grassi`, `16h+ Pulizia Cellulare / Autofagia`).
- **Daily Dozen & Bilancio Elettroliti:** griglia interattiva delle 12 categorie del Dr. Michael Greger (`X/24`) + monitoraggio live di **Sodio** (`max 1500 mg`) e **Potassio** (`target 4700 mg`).
- **Riepilogo Dati Scambiati, Cronologia Obiettivi & Consigli:** riepilogo trasparente dei dati **ricevuti** (Passi, Kcal attive, Peso) e **inviati** (Kcal pasti, Proteine, Acqua, Backup Cloud), **pagella ultimi 7 giorni** sui 5 pilastri giornalieri e **consigli personalizzati** con azioni rapide.
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

### 2. Come APK Nativo Android (con Icona Ufficiale, Health Connect & Login Google)
Ad ogni modifica sul branch `main`, **GitHub Actions** compila l'APK Android e lo pubblica già pronto:
1. **Download diretto in 1 tocco (senza file `.zip`):** apri **[Releases → Ultima Versione](https://github.com/leoamadori/pappa_pronta/releases)** e tocca direttamente **`pappa-pronta.apk`**.
2. *(In alternativa da **[Actions](https://github.com/leoamadori/pappa_pronta/actions)**)* scarica **`PappaPronta-APK-Estrai-ZIP`** ed estrai il file `pappa-pronta.apk` contenuto all'interno.
3. ⚠️ **Nota se avevi già installato una vecchia versione di test:** disinstalla **una sola volta** la precedente app *Pappa Pronta* dal telefono prima di installare la nuova (Android blocca la sovrascrittura se cambia il certificato di firma). Da ora in avanti, grazie al `versionCode` automatico e alla chiave fissa, tutti i futuri aggiornamenti si installeranno direttamente sopra senza perdere dati.

---

## 🛠️ Struttura del Progetto

| File | Ruolo |
| :--- | :--- |
| `index.html` | Applicazione single-file mobile-first (UI, database alimenti/ricette, motore clinico, OCR, Firebase Sync e Health Bridge) |
| `manifest.json` | Web App Manifest standalone con icone adattive e scorciatoie rapide da schermata Home |
| `sw.js` | Service Worker offline-first per App Shell, `Tesseract.js` v5 e modelli `.traineddata.gz` |
| `icons/` | Icone PNG anti-aliasate (`180x180`, `192x192`, `512x512`, `512x512 maskable`) |
| `firestore.rules` | Regole di sicurezza Cloud Firestore con isolamento rigoroso per singolo utente (`/users/{uid}`, `allow list: if false`) |
| `google-services.json` | Configurazione client Android OAuth pubblica per il Login Google nativo nell'APK |
| `.github/workflows/build-apk.yml` | Pipeline CI/CD GitHub Actions con `@capacitor/android`, `@capgo/capacitor-health` e `@capacitor-firebase/authentication` |

---

## ⚖️ Note, Sicurezza & Privacy (GDPR)

- **Privacy by Design & Zero Chiavi Esposte in UI:** nessun tracciamento pubblicitario, nessuna chiave o configurazione esposta nell'interfaccia o nei link d'invito. In modalità locale i dati risiedono unicamente sul dispositivo (`localStorage` con `navigator.storage.persist()`); con Cloud Sync attivo ogni utente accede esclusivamente al proprio documento privato su server europei (`eur3`) e può cancellare definitivamente i propri dati Cloud con un clic (**Diritto all'oblio**).
- **Fonti Dati Prodotti:** ricerca codici EAN tramite [Open Food Facts](https://world.openfoodfacts.org/) (licenza ODbL).
- **Avvertenza Medica:** i calcoli e le valutazioni nutrizionali hanno finalità puramente informativa e organizzativa e non sostituiscono in alcun modo il parere di un medico, biologo nutrizionista o dietista.
