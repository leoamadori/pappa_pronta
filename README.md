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

### 🏠 Scheda «Oggi» — Pasti Guidati dai 12 Cibi Sani & Digiuno Contestuale
- **Switch contestuale 1-tocco (`🍳 Pasti di oggi` | `⏳ Digiuno & Sera`):** si adatta automaticamente alla fascia oraria (mattina/pre-lavoro: preparazioni veloci; pomeriggio/sera: stato digiuno se attivo) ma può essere invertito con un tocco in qualsiasi momento.
- **Motore `12 Cibi Sani → Ricette`:** mostra i cibi sani ancora mancanti oggi e propone 2–3 ricette veloci che li coprono rispettando proteine, sodio, potassio e allergeni; con **1 tocco (`✓ Fatto / Mangiato`)** aggiorna insieme `12 Cibi Sani`, diario pasti, Health Connect e il riepilogo per Amazfit.
- **Digiuno Intermittente a 7 Giorni Editabile:** quando attivato (`12:12`, `14:10`, `16:8`), tiene lo storico reale degli ultimi 7 giorni con modifica di data e ora di inizio/fine per ogni giornata; se spento (`Libero`), non occupa spazio nell'interfaccia.
- **Pasti & Testo Libero:** riepilogo unificato della giornata con analisi a parole tue e checklist integratori a scomparsa.

### 🛒 Scheda «Spesa» — Modalità Supermercato Unificata, Confronto A vs B & Coda Offline
- **Scanner Codici + Confronto Clinico A vs B:** lettura barcode su Android/iOS/Desktop (timeout `2,5s` anti-rete lenta) con barra di fissaggio **Prodotto A** e tabella comparativa immediata delle differenze cliniche decisive (`Verdetto`, `Sale/Sodio`, `Zuccheri`, `Saturi/Oli`, `Allergeni`).
- **Fallback Offline con Coda Foto Etichette (`IndexedDB`):** se tra le corsie manca campo, premendo **`📷 Salva foto per dopo`** l'etichetta resta solo sul telefono; a casa completi l'analisi OCR/confronto e salvi il prodotto in `eanCache` così alla visita successiva la scansione risponde offline in `<150 ms`.
- **Lista Spesa Reversibile & Ricette Quasi Pronte:** toccando **`✓ Preso`** l'articolo passa nel carrello (con **`↩ Annulla`** a 1 tocco) e aggiorna in tempo reale le **2–3 ricette quasi pronte** con gli ingredienti mancanti da aggiungere prima della cassa.
- **«Posso mangiarlo? (Cibi Sfusi)»:** prontuario ricercabile coerente con dieta e allergie del profilo.

### 🍳 Scheda «Cucina» — Crea un Piatto, Ricettario Italiano, Menu 7gg & Dispensa Occasionale
- **Crea un Piatto Bilanciato & Ricettario Italiano (34 piatti):** genera ciotole e scala porzioni (`80% – 150%`) rispettando dieta, celiachia e allergeni UE.
- **Menu della Settimana (7 Giorni):** pianifica `4 pasti` o `Pranzo + Cena` con alternanza giornaliera `⚡ Giorno Attivo` / `🧘 Giorno Leggero`.
- **Dispensa Occasionale (`📦` richiudibile):** spostata da cima `Oggi` a strumento su richiesta con 1 tocco per segnare un cibo in casa e pulsante `⏳` per i cibi in scadenza.

### 📈 Scheda «Progressi» — Grafici 7/14/30g, Health Connect, Amazfit & Profilo
- **Grafico `12 Cibi Sani` (`7g | 14g | 30g`)** con media del periodo e soglia obiettivo `18/24`, **Regolarità Digiuno (7g editabile)** e **Obiettivi Clinici (sodio/proteine)**.
- **Profilo, Dispositivi & Backup:** configurazione limiti clinici, **Orologio Amazfit & 3 Promemoria Giornalieri (`07:00 · 13:00 · 20:00`)**, condivisione backup `.json` e cancellazione locale sicura (inclusa la coda foto offline).

---

## ❤️ Google Health Connect & Apple Salute

- **Su Android (APK nativo):** integrazione diretta con **Google Health Connect** (con permessi Android 13–15 dedicati) per leggere **Passi**, **Calorie attive** e **Peso** e inviare i singoli pasti registrati (`kcal`, `proteine`, `acqua`, `peso`) senza duplicazioni.
- **Su iPhone / iOS (Safari):** ponte tramite **Comandi Rapidi (Apple Shortcuts)** con richiesta di conferma prima di aggiornare il peso.
- **Passaggio automatico a Giorno Attivo:** oltre **`7.500 passi`** o **`300 kcal attive`**, l'app attiva **`⚡ Giorno Attivo`** e spunta **`🏃 Movimento`** nei 12 Cibi Sani.

---

## ⌚ Watch Face Amazfit (`Active 2 Round` & `GTS 4 Mini`) + 3 Promemoria Giornalieri

Mostra al polso in sola lettura **Digiuno Intermittente** (fase e ore trascorse/rimanenti con scorrimento autonomo anche di notte), **Movimento** (`passi`, `kcal` sensore e obiettivo `7.500 passi` senza falsi positivi da metabolismo basale) e **12 Cibi Sani** (`X/24` con azzeramento automatico a mezzanotte), con aggiornamento a 1 tocco (`↻`) e Always-On Display a basso consumo:

1. **Attiva la Modalità Sviluppatore nell'App Zepp:** apri *App Zepp → Profilo → Impostazioni → Informazioni su* e tocca 7 volte il logo Zepp finché compare l'avviso di attivazione.
2. **Installa `Pappa Pronta Sync` e `Pappa Pronta WF`:**
   - **Da PC sulla stessa rete Wi-Fi (`zeus bridge` / `zeus preview`):** esegui `npm run build` o `npx zeus preview` dentro `zepp/companion` e `zepp/watchface` e scansiona il QR dalla sezione *Modalità Sviluppatore → Mini Programma* dell'App Zepp.
   - **Tramite pacchetti `.zab` compilati da GitHub Actions:** scarica l'artefatto `PappaPronta-Zepp-Amazfit-Packages` e carica i due file `.zab` come bozze personali non pubblicate su [Zepp Open Platform Console](https://console.zepp.com) per ottenere il QR permanente installabile sull'App Zepp sia per **GTS 4 Mini** (`336x384`) sia per **Active 2 Round** (`466x466`).
3. **Collega l'Account una sola volta:** nell'app Pappa Pronta apri **Account Cloud**, premi **`⌚ Collega Orologio Zepp (Copia codice accoppiamento)`** e incolla il testo in *App Zepp → Dispositivo → Mini-App Pappa Pronta Sync → Impostazioni* (condiviso automaticamente quando alterni i due orologi).
4. **Abilita i 3 Promemoria Giornalieri (`07:00`, `13:00`, `20:00`) al polso:** nell'APK Android vai in *`📅 Menu & Spesa` → Profilo → `⌚ Orologio Amazfit & 3 Promemoria Giornalieri`*, attiva l'interruttore e in *App Zepp → Profilo → [Active 2 / GTS 4 Mini] → Notifiche e promemoria → Avvisi app* attiva **Pappa Pronta** (disattivando *«Ricevi solo a schermo spento»* o testando a schermo bloccato col pulsante di prova a 5 secondi).
5. **Aggiornamento rapido dal quadrante:** dopo aver registrato un pasto sul telefono, tocca il pulsante **`↻`** sulla Watch Face: la Mini-App scarica il riepilogo Cloud (`~700 byte`), vibra e torna al quadrante.

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
| `.github/workflows/build-apk.yml` | Pipeline CI/CD GitHub Actions (`assembleRelease` firmato, `singleTask`, permessi Health Connect e notifiche locali Android 13–15) |
| `.github/workflows/build-zepp.yml` | Pipeline CI per test contratto condiviso e compilazione pacchetti `.zab` Zepp OS (`GTS 4 Mini` + `Active 2 Round`) |
| `zepp/` | Codice sorgente Watch Face (`zepp/watchface`), Mini-App ponte (`zepp/companion`) e contratto condiviso (`zepp/shared`) |
| `docs/designs/amazfit-watchface.md` | Documento di progettazione architetturale della Watch Face Amazfit |

---

## ⚖️ Note, Sicurezza & Privacy (GDPR)

- **Privacy & Isolamento Account:** nessun tracciamento pubblicitario. Senza login Cloud tutti i dati restano sul dispositivo (`localStorage`); con Cloud Sync ogni utente accede esclusivamente al proprio spazio privato su server europei (`eur3`), con protezione contro contaminazioni tra account dopo il logout e cancellazione definitiva con un tocco (**Diritto all'oblio**).
- **Fonti Dati Prodotti:** ricerca codici a barre tramite [Open Food Facts](https://world.openfoodfacts.org/) (licenza ODbL).
- **Avvertenza Medica:** i calcoli e le valutazioni nutrizionali hanno scopo puramente informativo e organizzativo e non sostituiscono il parere di un medico, biologo nutrizionista o dietista.
