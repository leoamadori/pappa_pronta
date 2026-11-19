# Pappa Pronta — Riprogettazione Usabilità a Basso Attrito

* **Author:** Leo Amadori
* **Status:** Proposed
* **Date:** 2026-11-19

--------------------------------------------------------------------------------

## Overview

Pappa Pronta ([index.html](../../index.html)) è una PWA mobile-first distribuita anche come APK Android Capacitor, collegata a Firebase Cloud Sync ([firestore.rules](../../firestore.rules)), Android Health Connect e all'ecosistema **Amazfit / Zepp OS** ([amazfit-watchface.md](./amazfit-watchface.md): Mini-App companion + Watchface per Amazfit Active 2 Round e GTS 4 Mini, sincronizzati via `users/{uid}/integrations/watch` e 3 promemoria locali inoltrati via Bluetooth). Oggi l'app espone un motore nutrizionale e clinico completo (semaforo etichette, allergeni EU, celiachia, sodio/potassio, 12 Cibi Sani, ricettario, digiuno intermittente), ma la sua schermata iniziale e i suoi flussi richiedono troppa manutenzione manuale per un uso quotidiano sostenibile.

Questo documento definisce la riorganizzazione dell'interfaccia e dei flussi dati attorno a **2–3 aperture quotidiane** e all'uso **al supermercato**, in modo che l'utente integri il maggior numero dei **12 Cibi Sani** (raggiungendo automaticamente gli obiettivi di proteine, sodio, potassio e limiti clinici) e mantenga regolare il **digiuno intermittente** con il minimo numero di tocchi possibile.

## The Problem

L'audit sul codice e sui flussi reali ha evidenziato quattro cause principali di attrito e abbandono:

1. **Inventario dispensa in prima pagina:** aprendo `Oggi`, il primo blocco è la griglia della Dispensa (`#pantryCard`), che richiede aggiornamento continuo dopo ogni pasto e ogni spesa. Quando la dispensa non viene più tenuta aggiornata, occupa comunque lo spazio principale senza riflettere ciò che c'è davvero in cucina.
2. **Doppia sorgente di verità tra pasti e qualità giornaliera:** l'utente può registrare i pasti in `Cucina` o spuntare le 24 caselle dei `12 Cibi Sani` in `Oggi`. Se si limita alle spunte rapide, `log.meals` resta vuoto e il punteggio/coach segnala `0g` di proteine; se vuole coprire i cibi sani mancanti, deve cercare da solo le ricette adatte.
3. **Digiuno nascosto e privo di storico reale:** il timer del digiuno è chiuso dentro `Strumenti Avanzati` in fondo a `Oggi` e lo stato salva solo l'ultima finestra. Per i giorni passati, il punteggio stima il digiuno dagli orari dei pasti registrati: senza un registro giornaliero editabile, la cronologia non è affidabile.
4. **Attrito e latenza al supermercato:** `Lista Spesa` e `Scanner` vivono in due schede diverse. In corsia l'utente perde tempo a leggere etichette per confrontare due prodotti, fatica a capire quali ingredienti mancano per completare le ricette prima di andare in cassa, e su APK Android (dove [sw.js](../../sw.js) è disattivato per preservare il bridge Capacitor) la rete mobile instabile può bloccare per 4–8 secondi la ricerca su Open Food Facts.

La soluzione riorganizza l'app in **4 schede orientate al compito** (`🏠 Oggi`, `🛒 Spesa`, `🍳 Cucina`, `📈 Progressi`), trasforma i `12 Cibi Sani` mancanti nel motore che suggerisce le ricette del giorno, introduce uno storico digiuno editabile su 7 giorni e aggiunge in `🛒 Spesa` il confronto A vs B con fallback offline a foto etichetta per analisi differita.

## Goals

* **G1 — Home `Oggi` contestuale senza inventario in cima:** la schermata iniziale mette subito in evidenza i `12 Cibi Sani` mancanti di oggi e propone 2–3 ricette o preparazioni veloci che li coprono rispettando proteine, sodio, potassio e profilo clinico, con cambio vista a 1 tocco verso stato digiuno e chiusura giornata. La Dispensa diventa uno strumento occasionale dentro `🍳 Cucina`.
* **G2 — Gesto unico per qualità e nutrizione:** confermare in 1 tocco una ricetta proposta aggiorna insieme `12 Cibi Sani`, `meals` (proteine, sodio, potassio, kcal) e la coda di sincronizzazione Health Connect. In assenza di pasti dettagliati, la spunta manuale dei `12 Cibi Sani` valuta la giornata sulla qualità senza falsi allarmi di `0g` proteine.
* **G3 — Storico digiuno reale a 7 giorni modificabile:** se il digiuno è attivo (`protocol !== 'off'`), l'utente vede l'andamento degli ultimi 7 giorni e può correggere data e ora di inizio e fine per ciascun giorno. Se il digiuno è spento, non occupa spazio né in `Oggi` né nei grafici.
* **G4 — Modalità Supermercato unificata e resiliente a rete lenta:** in un'unica scheda `🛒 Spesa` usabile con una mano (`min-height: 44px`), l'utente spunta in modo reversibile ciò che mette nel carrello, vede subito 2–3 ricette quasi pronte con gli ingredienti mancanti prima della cassa, confronta due prodotti (A vs B) sul semaforo clinico e, se la rete supera 2,5 secondi o è assente, salva una foto etichetta in locale per completare l'analisi e memorizzarla in `eanCache` per le visite future.
* **G5 — Grafici e cronologia leggibili su mobile:** la scheda `📈 Progressi` separa in viste leggibili su schermi da 360px l'andamento dei `12 Cibi Sani` (`7g | 14g | 30g`), la regolarità del digiuno (`7g` editabile) e l'aderenza agli obiettivi clinici e Health Connect.
* **G6 — Zero regressioni su sicurezza clinica, Amazfit/Zepp, sync e migrazione:** restano invariati `evaluateClinicalProduct`, tutti i blocchi allergeni/celiachia/dieta, Health Connect, l'integrazione **Amazfit/Zepp** (`buildWatchSummaryPayload` verso `users/{uid}/integrations/watch` con contratto `v: 1` di [contract.js](../../zepp/shared/contract.js), accoppiamento `#fbCopyZeppPairingBtn` e 3 promemoria locali `07:00 · 13:00 · 20:00` in `#watchRemindersDetails`), la compatibilità con [firestore.rules](../../firestore.rules) attuali e i dati locali esistenti in `pappa_pronta_v2`.

## Non-Goals

* **NG1:** Nessun backend esterno, nuovo server o modifica alle 14 chiavi top-level di [firestore.rules](../../firestore.rules).
* **NG2:** Nessun salvataggio di foto grezze su Cloud/Firestore (limite 1 MiB) o in `localStorage`.
* **NG3:** Nessuno storico digiuno oltre la finestra mobile di 7 giorni.
* **NG4:** Nessun obbligo di pesare o inserire grammature per ogni alimento consumato nella giornata.
* **NG5:** Nessuna gestione prezzi, scontrini, negozi multipli o checkout obbligatorio in cassa.
* **NG6:** Nessuna riscrittura con framework SPA (React/Vue/Vite): si mantiene l'architettura vanilla single-file PWA + APK Capacitor.

## Open Questions

Nessuna domanda bloccante aperta.

## Critical User Journeys (CUJs)

### CUJ 1: Mattina / Pre-lavoro — Scegliere e preparare un piatto che copre i 12 Cibi Sani mancanti

* **Given:** Sono le 09:30, l'utente ha completato l'avvio rapido, ha impostato dieta e limiti clinici e ha già fatto colazione (o non ha ancora registrato pasti).
* **When:** L'utente apre `🏠 Oggi`, vede i `12 Cibi Sani` scoperti oggi e le 2–3 ricette/preparazioni veloci ordinate per coprire il maggior numero di cibi mancanti (nel rispetto di proteine, sodio, potassio e allergeni), ne sceglie una e tocca `✓ Fatto / Mangiato`.
* **Then:** La ricetta viene registrata in un solo tocco in `log.meals`, aggiorna automaticamente le caselle dei `12 Cibi Sani` coperte, ricalcola sodio/potassio/proteine del giorno e prepara i dati per Health Connect senza chiedere inserimenti duplicati.

### CUJ 2: Pomeriggio / Sera — Controllare o correggere il digiuno (7 giorni) e chiudere la giornata

* **Given:** L'utente ha attivato un protocollo di digiuno (es. `16:8` o `14:10`) ed è pomeriggio/sera; in un giorno precedente della settimana ha dimenticato di premere "Cena chiusa" all'orario reale.
* **When:** L'utente apre `🏠 Oggi` (o passa alla vista `Digiuno & Chiusura` in 1 tocco), vede stato e barra del digiuno corrente, apre la voce di ieri nello storico 7 giorni e corregge data/ora di inizio e fine, poi spunta i `12 Cibi Sani` residui della giornata.
* **Then:** Lo storico in `logs[YYYY-MM-DD].fasting` salva gli orari corretti (validando `inizio < fine`), ricalcola ore di digiuno e stato obiettivo nel grafico 7 giorni, e la qualità della giornata si aggiorna senza falsi avvisi di `0g` proteine.

### CUJ 3: Supermercato — Spesa, ricette completabili prima della cassa e confronto prodotti (anche offline)

* **Given:** L'utente è tra le corsie del supermercato con una mano occupata; il segnale mobile può essere buono oppure lento/assente (`Lie-Fi`).
* **When:** L'utente apre `🛒 Spesa`, spunta gli articoli che mette nel carrello, guarda le 2–3 ricette quasi pronte e aggiunge in 1 tocco un ingrediente mancante alla lista; poi inquadra due prodotti confezionati per confrontarli (A vs B). Se la rete supera 2,5 secondi o è assente, preme `📷 Salva foto etichetta per dopo`.
* **Then:** Gli articoli presi aggiornano subito le ricette completabili (con annullamento in 1 tocco dalla sezione "Presi oggi"); se i prodotti sono in rete o in `eanCache`, vede subito le differenze cliniche A vs B; se ha salvato la foto in locale (`IndexedDB`), a casa completa OCR/confronto e salva il verdetto in `eanCache`, così alla visita successiva la scansione risponde offline in meno di 150 ms.

### CUJ 4: Verifica periodica — Leggere progressi e sincronizzare Health Connect

* **Given:** L'utente usa l'app da 2 settimane e vuole capire se qualità alimentare e digiuno stanno migliorando.
* **When:** L'utente apre `📈 Progressi`, seleziona `14g` o `30g` sul grafico dei `12 Cibi Sani`, controlla i 7 giorni del digiuno (se attivo) e preme `❤️ Sincronizza Salute`.
* **Then:** I grafici risultano leggibili senza etichette sovrapposte su schermo mobile da 360px, mostrano media e aderenza agli obiettivi clinici, e la sincronizzazione con Health Connect aggiorna passi, peso e nutrizione senza duplicare i pasti già inviati.

## Technical Plan (Architecture)

L'architettura preserva il formato single-file vanilla di [index.html](../../index.html) (PWA + APK Capacitor) applicando una regola **net-zero** sulla superficie UI: i pannelli ridondanti vengono rimossi o accorpati prima di introdurre i nuovi flussi, mantenendo invariati il motore clinico, `integrations/watch` e lo schema di [firestore.rules](../../firestore.rules).

```text
+-------------------------------------------------------------------------+
|                    HEADER FISSO (Giorno Attivo/Leggero | 👤 Profilo)    |
+-------------------------------------------------------------------------+
|                                                                         |
|  [🏠 Oggi]            [🛒 Spesa]          [🍳 Cucina]     [📈 Progressi]|
|  - Switch 1-tocco     - Lista/Carrello    - Ricettario    - 12 Cibi Sani|
|    Cucina / Sera        reversibile       - Genera piatto   (7/14/30g)  |
|  - 12 Cibi Sani       - 2-3 Ricette       - Menu 7gg      - Digiuno 7g  |
|    mancanti ->          quasi pronte      - Dispensa        (editabile) |
|    Ricette veloci     - Scanner + A vs B    (occasionale) - Obiettivi & |
|  - Digiuno attivo     - Coda foto offline                   Health Sync |
+-------------------------------------------------------------------------+
           |                      |                               |
           v                      v                               v
   state.logs[YYYY-MM-DD]   IndexedDB locale              Firebase Firestore
   - dozen, meals, na, k    (solo foto etichette          users/{uid} (14 chiavi
   - fasting (rolling 7g)    pendenti, max 1200px)        invariate, debounce 3.8s)
           |                      |
           +---------> state.eanCache (max 500 prodotti, offline <150ms)
```

### 1. Architettura delle 4 Schede e Consolidamento DOM

* **Barra inferiore (4 tab, `min-height: 54px`):**
  1. `🏠 Oggi` (`#panel-oggi`): contiene solo il contesto attivo del momento, i `12 Cibi Sani` e le proposte del giorno. Rimuove in cima `#pantryCard` e `#quickCompassBar`.
  2. `🛒 Spesa` (`#panel-spesa`): unifica le attuali sezioni Lista Spesa e Scanner/Semaforo in un unico ambiente usabile con una mano (`min-height: 44px` sui pulsanti primari).
  3. `🍳 Cucina` (`#panel-cucina`): ospita Generatore Piatto, Ricettario Italiano, Menu 7 Giorni e la **Dispensa** come pannello richiudibile (`<details>`) per uso occasionale. Elimina la duplicazione del diario pasti rispetto a `Oggi`.
  4. `📈 Progressi` (`#panel-progressi`): ospita i 3 grafici separati, lo storico digiuno 7g editabile, la card Health Connect / Cloud Sync e il riepilogo Profilo/Backup (raggiungibile anche dal pulsante header `👤`).

### 2. Motore Giornaliero `12 Cibi Sani → Ricette & Obiettivi`

* **Ranking deterministico (`rankRecipesForToday`):**
  1. Filtra `RECIPES` escludendo rigorosamente tutti i piatti incompatibili con `state.profile.dietType`, `allergens`, `extraConditions` (es. `celiac`) e `avoidFoods` tramite `hasBlockedAllergen` e `isFoodBlockedByProfile`.
  2. Calcola l'insieme `missingDozen` delle categorie `12 Cibi Sani` non ancora completate in `todayLog.dozen`.
  3. Assegna a ogni ricetta un punteggio pesato:
     - **Copertura `missingDozen` (peso principale):** numero di categorie mancanti oggi coperte dalla ricetta.
     - **Aderenza obiettivi residui:** bonus se copre il gap proteico/potassio del giorno senza superare il margine residuo di sodio (`getDailySodiumLimitMg()`).
     - **Rapidità:** bonus per preparazioni `<= 20 min` nella fascia mattina/pre-lavoro.
     - **Dispensa/Scadenza (bonus secondario):** priorità leggera agli ingredienti già presenti o in scadenza, senza bloccare la proposta se la dispensa non è aggiornata.
* **Registrazione in un solo tocco:** premere `✓ Fatto / Mangiato` su una ricetta proposta in `Oggi` chiama `logMealAndSync()`, aggiornando atomicamente `todayLog.meals`, `todayLog.dozen`, `todayLog.na/k` e la coda Health Connect.
* **Coerenza con il check-in rapido:** quando `todayLog.meals.length === 0` ma `computeDozenTotal(todayLog.dozen) > 0`, `computeDayGoalScore()` e `computeCoachAdvice()` riconoscono la modalità "solo qualità" ed evitano falsi allarmi su `0g` di proteine, continuando invece a suggerire ricette che coprano i `12 Cibi Sani` mancanti.

### 3. Home `Oggi` Contestuale (Stato + Orario + Switch Esplicito)

* Un selettore rapido in cima a `Oggi` (`🍳 Pasti di oggi` | `⏳ Digiuno & Sera`) permette di invertire la vista in 1 tocco in qualsiasi momento (turni, weekend, cena alle 18:30).
* La vista predefinita all'apertura usa una regola leggera combinata:
  - Prima delle `13:30` (oppure se `fasting.protocol === 'off'`): apre su `🍳 Pasti di oggi`.
  - Dalle `13:30` in poi quando `fasting.protocol !== 'off'`: apre su `⏳ Digiuno & Sera` (mostrando stato corrente del digiuno, pulsante apertura/chiusura finestra, accesso allo storico 7g e chiusura `12 Cibi Sani`).
* Se `fasting.protocol === 'off'`, il blocco digiuno non viene mostrato né in `Oggi` né in `Progressi`, lasciando solo un link discreto nel profilo per attivarlo.

### 4. Storico Digiuno Reale a 7 Giorni Editabile

* **Modello dati (retrocompatibile al 100% con [firestore.rules](../../firestore.rules)):**
  Ogni giornata degli ultimi 7 giorni può contenere `state.logs[YYYY-MM-DD].fasting`:
  ```text
  {
    proto: "16:8" | "14:10" | "12:12",
    startIso: "2026-11-18T20:15",   // inizio digiuno (fine cena)
    endIso:   "2026-11-19T12:20",   // fine digiuno (primo pasto)
    fastHours: 16.08,               // calcolato da (endIso - startIso)
    completed: true,                // fastHours >= FASTING_PROTOCOLS[proto].fastH
    edited: false                   // true se corretto manualmente dall'utente
  }
  ```
* **Scrittura e potatura (`pruneFastingHistory7d`):**
  - Ogni chiusura/apertura finestra (`toggleDinnerClosed`, `applyManualFastingTime`, primo/ultimo pasto) aggiorna `logs[dateKey].fasting`.
  - All'avvio e al salvataggio, le proprietà `.fasting` su chiavi `logs` più vecchie di 7 giorni rispetto a oggi vengono rimosse (lasciando intatti `dozen`, `meals` e `health` per i grafici 14–30g).
  - Non aggiunge alcuna chiave top-level né chiavi in `state.fasting`, evitando errori `permission-denied` su [firestore.rules](../../firestore.rules).
* **Editor per singola giornata:** toccare una delle 7 righe/barre apre un `<dialog>` compatto con due input `datetime-local` (`Inizio digiuno`, `Fine digiuno`). Valida `start < end` e durata tra `0.5h` e `48h`, ricalcola `fastHours` e `completed`, aggiorna il grafico 7g e, se la riga modificata è la più recente, riallinea `state.fasting` in modo coerente.

### 5. Modalità Supermercato Unificata (`🛒 Spesa`) e Coda Offline `IndexedDB`

* **Lista & Carrello reversibile:**
  - Toccando `✓ Preso` su un articolo della lista, l'alimento entra in `state.pantry` e in un elenco transitorio locale "Presi oggi" (visibile in fondo con bottone `↩ Annulla` a 1 tocco), così il blocco **Ricette quasi pronte** ricalcola subito in corsia le 2–3 ricette a cui mancano 1–2 ingredienti (filtrate per dieta/allergeni) con azione unica `＋ Aggiungi mancanti alla spesa`.
* **Confronto A vs B sul Semaforo Clinico:**
  - Dopo la scansione di un prodotto, il pulsante `⚖️ Confronta con un altro` fissa il **Prodotto A** in una barra compatta in cima allo scanner (solo stato in memoria) e riapre la fotocamera per il **Prodotto B**.
  - Appena B è letto, compare una scheda comparativa a 2 colonne con le sole differenze cliniche decisive (`Verdetto`, `Punteggio /100`, `Sale/Sodio`, `Zuccheri`, `Grassi saturi / Oli`, `Allergeni`) e l'indicazione diretta del prodotto più favorevole per il profilo clinico attivo.
* **Fallback offline / Lie-Fi con coda `IndexedDB`:**
  - Timeout della fetch Open Food Facts in `lookupEanCode()` ridotto da `4000ms` a `2500ms`.
  - Se il codice è già in `state.eanCache`, risponde offline in `<150ms`.
  - Se scatta il timeout o `!navigator.onLine`, compare subito il pulsante `📷 Salva foto etichetta per dopo`: acquisisce la foto tramite fotocamera di sistema, la ridimensiona su `<canvas>` (lato lungo max `1200px`, JPEG qualità `0.78`, tipicamente `120–220 KB`) e la salva nello store `pending_labels` di **`IndexedDB` (`pappa_pronta_offline_labels`)** insieme all'eventuale EAN e a un'etichetta breve.
  - Un badge `📷 Da analizzare (N)` in `🛒 Spesa` permette, una volta tornati a casa o con rete, di riaprire le foto salvate, completare OCR/confronto A vs B e salvare il verdetto strutturato in `state.eanCache` (sincronizzato nel Cloud), eliminando automaticamente il blob da `IndexedDB`.

### 6. Grafici Mobile-First (`📈 Progressi`), Integrazione Amazfit/Zepp, Sync Cloud e Fix Latenti

* **Grafici separati (leggibili su 360px):**
  1. **Qualità alimentare (`12 Cibi Sani`):** selettore `7g | 14g | 30g`, barre verticali/griglia giornaliera con soglia visiva a `18/24` e media del periodo.
  2. **Regolarità digiuno (`7g`):** 7 blocchi/barre cliccabili (verde = centrato, giallo = parziale, grigio = non registrato) con apertura diretta dell'editor data/ora; sezione omessa quando `fasting.protocol === 'off'`.
  3. **Obiettivi clinici & Salute:** riepilogo percentuale giorni entro soglia sodio, giorni con proteine a target (escludendo dal denominatore i giorni solo-check-in senza pasti dettagliati) e stato sync Health Connect.
* **Integrazione end-to-end Amazfit / Zepp OS ([amazfit-watchface.md](./amazfit-watchface.md)):**
  - **Contratto invariato `integrations/watch` (`v: 1`):** `buildWatchSummaryPayload(nowMs)` continua a produrre esattamente i 12 campi richiesti da [firestore.rules](../../firestore.rules) e [contract.js](../../zepp/shared/contract.js) (`dateYmd`, `fastMode`, `protoFastH`, `protoEatH`, `anchorSec`, `targetSec`, `lastMealSec`, `foodDozen` `0..23`, `exerciseLogged`, `cloudSteps`, `updatedAtSec`), senza richiedere modifiche a `zepp/companion`, `zepp/watchface` né a `.github/workflows/build-zepp.yml`.
  - **Propagazione immediata dei nuovi flussi al polso:**
    1. La conferma 1-tocco di una ricetta in `🏠 Oggi` aggiorna `todayLog.dozen` e riflette subito il nuovo punteggio `foodDozen` nel payload `integrations/watch`.
    2. La correzione manuale di data/ora della finestra più recente tramite `saveFastingDayEdit()` riallinea `state.fasting` (`anchorSec`, `targetSec`, `lastMealSec`, `fastMode`) così il quadrante Amazfit mostra immediatamente gli orari corretti dopo il sync.
  - **UI Amazfit & 3 Promemoria Giornalieri (`07:00 · 13:00 · 20:00`):**
    - `#watchRemindersDetails` (`#watchRemStatusBadge`, `#watchRemPermInfo`, `#toggleWatchRemindersBtn`, `#testWatchReminderBtn`, canale `pappa_pronta_watch_reminders`, chiave `pappa_pronta_watch_reminders_v1`) resta integralmente disponibile dentro `#panel-progressi` nell'area Profilo & Dispositivi; `#fbCopyZeppPairingBtn` (`⌚ Collega Orologio Zepp`) resta nel modale Account (`#accountHealthDialog`, accessibile da header `👤` e da `📈 Progressi`).
    - I testi dei 3 `WATCH_REMINDER_SLOTS` (`07:00`, `13:00`, `20:00`) restano allineati alle 2–3 aperture quotidiane dell'app (mattina: piatti veloci/12 Cibi Sani; pranzo: registrazione 1-tocco + `↻`; sera: chiusura finestra digiuno e riepilogo).
* **Ottimizzazione Cloud Sync:** debounce di `cloudSyncHook` aumentato da `1800ms` a `3800ms` per accorpare le spunte ravvicinate al supermercato in un unico `setDoc` (incluso il push coerente di `integrations/watch`).
* **Fix parser testo libero:** correzione degli alias `ricotta` (`ricotta_vaccina` → `ricotta_magra`) e `salmone` (`salmone_selvaggio` → `salmone`) in `analyzeFreeTextMeal()`.

## Alternatives Considered

### Alternative A: Aggiungere una 5ª tab inferiore (`Oggi`, `Cucina`, `Spesa`, `Scanner`, `Grafici`)

* **Pros:** Mantiene separati i concetti di Lista Spesa e Scanner senza accorpare i due flussi.
* **Cons:** Su schermi mobili da 360px 5 tab riducono la leggibilità delle etichette e restringono i target touch; inoltre obbliga l'utente al supermercato a saltare continuamente tra due schede diverse mentre spinge il carrello.
* **Reason for Rejection:** L'unificazione in 4 tab (`🏠 Oggi`, `🛒 Spesa`, `🍳 Cucina`, `📈 Progressi`) risolve direttamente l'attrito in corsia e mantiene pulsanti grandi a una mano.

### Alternative B: Storico digiuno a 30+ giorni stimato dagli orari dei pasti

* **Pros:** Nessun editor manuale per giornata e nessuna gestione di potatura a 7 giorni.
* **Cons:** Con 2–3 aperture al giorno e check-in rapidi sui `12 Cibi Sani`, `log.meals` non contiene sempre gli orari esatti di apertura e chiusura finestra; i grafici a 30 giorni mostrerebbero dati stimati e spesso falsati.
* **Reason for Rejection:** Una finestra mobile di 7 giorni con dati reali in `logs[YYYY-MM-DD].fasting` e correzione di data/ora inizio e fine garantisce accuratezza e semplicità d'uso.

### Alternative C: Salvare le foto etichette pendenti ("Analizza dopo") in `localStorage` o Firestore

* **Pros:** Nessun codice per gestire `IndexedDB` e disponibilità automatica delle foto su altri dispositivi.
* **Cons:** Anche una singola foto JPEG compressa pesa 150–300 KB: 3–4 foto saturano il limite di 1 MiB del documento unico Firestore `users/{uid}` (bloccando l'intera sincronizzazione Cloud) e consumano rapidamente la quota di `localStorage`.
* **Reason for Rejection:** Archiviare i blob temporanei solo in `IndexedDB` locale e sincronizzare nel Cloud esclusivamente i dati numerici estratti in `state.eanCache` elimina il rischio di blocco del sync e rispetta i limiti di quota.

### Alternative D: Carrello separato dalla Dispensa con passaggio obbligatorio "Ho pagato"

* **Pros:** Distingue formalmente ciò che è nel carrello da ciò che è già arrivato in cucina.
* **Cons:** In cassa l'utente chiude il telefono per pagare e riporre la spesa; dimenticando il bottone di conferma, la dispensa e le ricette restano disallineate.
* **Reason for Rejection:** La spunta immediata con elenco reversibile "Presi oggi" (`↩ Annulla` in 1 tocco) aggiorna in tempo reale le ricette completabili in corsia senza dipendere da un gesto in cassa.

### Alternative E: Aggiungere nuovi campi top-level in Firestore (`cart`, `fastingHistory`, `schedule`)

* **Pros:** Separazione esplicita delle nuove strutture dati a livello radice del documento utente.
* **Cons:** Viola l'allowlist rigida delle 14 chiavi di [firestore.rules](../../firestore.rules), esponendo a errori `permission-denied` e a incompatibilità tra client vecchi e nuovi durante il rollout.
* **Reason for Rejection:** Salvare lo storico digiuno dentro `logs[YYYY-MM-DD].fasting` e tenere lo stato transitorio del supermercato in locale mantiene compatibilità al 100% con le regole di sicurezza già in produzione.

--------------------------------------------------------------------------------

## Non-Functional Requirements

* **Security & Privacy:** Tutte le nuove viste applicano `escHtml()` su nomi prodotto, etichette OCR, nomi ricetta e note utente. Le foto delle etichette salvate in `IndexedDB` restano esclusivamente sul dispositivo dell'utente, vengono eliminate al completamento dell'analisi e vengono svuotate anche da `#resetAllDataBtn`.
* **Performance & Latency:** Lookup prodotti già in `state.eanCache` sotto `150 ms` offline; timeout Open Food Facts fissato a `2500 ms` per evitare attese in corsia con segnale `Lie-Fi`; debounce Cloud Sync portato a `3800 ms` per accorpare le spunte della spesa.
* **Rollout & Rollback:** Nessuna modifica richiesta a [firestore.rules](../../firestore.rules) né al formato `integrations/watch` (`v == 1`). La migrazione dello stato locale `pappa_pronta_v2` in `normalizeAndMergeState()` è puramente additiva (`logs[d].fasting` opzionale): un eventuale rollback alla versione precedente di [index.html](../../index.html) continua a leggere senza errori tutti i dati esistenti.

--------------------------------------------------------------------------------

## Detailed Implementation Plan

Tutte le modifiche restano confinate ai file del repository esistente; [firestore.rules](../../firestore.rules) **non viene modificato** perché lo storico digiuno 7g vive dentro `logs[YYYY-MM-DD].fasting` e le foto pendenti restano in `IndexedDB` locale.

### Target Files to Create/Modify

#### 1. [`index.html`](../../index.html) (`Modify`)

* **Type / Scope:** Single-file PWA + APK Capacitor (CSS, HTML, logica client-side Vanilla JS).
* **Proposed Changes:**
  * **Navigazione e Layout 4 Tab (regola net-zero):**
    - Aggiornare `.bottom-nav` con le 4 tab `#tab-oggi` (`🏠 Oggi`), `#tab-spesa` (`🛒 Spesa`), `#tab-cucina` (`🍳 Cucina`), `#tab-progressi` (`📈 Progressi`) e i corrispondenti pannelli `#panel-oggi`, `#panel-spesa`, `#panel-cucina`, `#panel-progressi`.
    - Rimuovere `#quickCompassBar` e la duplicazione del diario pasti tra `Oggi` e `Cucina`; spostare `#pantryCard` dentro `<details id="cucinaPantryDetails">` in `#panel-cucina` (chiuso di default).
    - Garantire `min-height: 44px` su tutti i pulsanti primari in `#panel-spesa` (spunta spesa, scanner, confronta A/B, aggiungi mancante, salva foto offline).
  * **Home `Oggi` contestuale e Motore `12 Cibi Sani → Ricette`:**
    - Aggiungere lo switch rapido a 1 tocco `#oggiContextSwitch` (`🍳 Pasti di oggi` | `⏳ Digiuno & Sera`) con selezione iniziale automatica basata su ora locale (`< 13:30` o `fasting.protocol === 'off'` → `Pasti di oggi`, altrimenti `Digiuno & Sera`).
    - Implementare `rankRecipesForToday(missingDozen, todayStats, pantrySet, expiringSet)` che filtra prima tramite `hasBlockedAllergen` / `isFoodBlockedByProfile`, poi ordina `RECIPES` per copertura di `missingDozen`, rispetto dei margini residui di proteine/potassio/sodio, rapidità (`<= 20 min` al mattino) e bonus secondario dispensa/scadenza.
    - Renderizzare la card `#oggiRecommendedRecipesCard` con le prime 2–3 ricette proposte, i badge dei `12 Cibi Sani` che ciascuna copre e il pulsante unico `✓ Fatto / Mangiato` (collega direttamente `logMealAndSync()`).
    - Aggiornare `computeDayGoalScore()` e `computeCoachAdvice()` in modo che, quando `meals.length === 0 && dozenVal > 0`, il giorno sia valutato sulla qualità (`12 Cibi Sani`) senza emettere falsi allarmi `0g` proteine.
  * **Storico Digiuno a 7 Giorni Editabile:**
    - Estendere `normalizeAndMergeState()` per preservare `logs[dateKey].fasting` e invocare `pruneFastingHistory7d()` (mantiene `.fasting` solo sulle ultime 7 date locali).
    - Implementare `recordDailyFastingSnapshot(dateKey, patch)` richiamata da `toggleDinnerClosed()`, `applyManualFastingTime()` e `logMealAndSync()`.
    - Aggiungere `<dialog id="fastingDayEditDialog">` con input `datetime-local` (`#fastEditStartInput`, `#fastEditEndInput`), validazione `start < end` e durata `0.5h..48h`, salvataggio tramite `saveFastingDayEdit(dateKey, startIso, endIso)` e riallineamento di `state.fasting` se viene modificata la finestra più recente.
    - Nascondere integralmente i blocchi digiuno in `Oggi` e `Progressi` quando `state.fasting.protocol === 'off'`.
  * **Modalità Supermercato Unificata (`#panel-spesa`) e Coda Offline `IndexedDB`:**
    - Unificare Lista Spesa + sezione reversibile `#boughtTodayWrap` ("Presi oggi" con `↩ Annulla` a 1 tocco) + blocco `#almostReadyRecipesWrap` (max 2–3 ricette a cui mancano 1–2 ingredienti, con bottone unico `＋ Aggiungi mancanti alla spesa`).
    - Aggiungere stato in memoria `compareProductA` e pannello `#productComparePanel` (2 colonne con differenze cliniche decisive: Verdetto, Score, Sale/Sodio, Zuccheri, Saturi/Oli, Allergeni).
    - Ridurre il timeout `AbortController` di `lookupEanCode()` da `4000 ms` a `2500 ms`.
    - Implementare il wrapper locale `OfflineLabelQueue` su `IndexedDB` (`db: pappa_pronta_offline_labels`, `store: pending_labels`, record `{ id, createdAt, ean, label, blobDataUrl }`) con resize `<canvas>` lato lungo `<= 1200px` JPEG `0.78`.
    - Esporre il pulsante fallback `📷 Salva foto etichetta per dopo` su timeout/offline e il badge `#pendingLabelsBadge` (`📷 Da analizzare (N)`) per aprire le foto salvate, eseguire OCR/confronto A vs B, salvare il risultato in `state.eanCache` e cancellare automaticamente il record da `IndexedDB`. Svuotare `OfflineLabelQueue` anche dentro `#resetAllDataBtn`.
  * **Grafici Mobile-First (`#panel-progressi`), Amazfit/Zepp, Cloud Sync e Fix Alias:**
    - Sostituire il singolo SVG denso con 3 viste verticali leggibili su `360px`: `renderDozenTrendChart(rangeDays)` (`7 | 14 | 30`), `renderFasting7dChart()` (7 blocchi cliccabili collegati a `fastingDayEditDialog`) e `renderClinicalGoalsSummary()` (aderenza sodio/proteine + Health Connect).
    - Spostare il pannello Profilo & Dispositivi (inclusi `#watchRemindersDetails`, `#toggleWatchRemindersBtn`, `#testWatchReminderBtn` e l'accesso al modale `#accountHealthDialog` con `#fbCopyZeppPairingBtn`) dentro `#panel-progressi`, preservando `WATCH_REMINDERS_KEY`, `WATCH_REMINDER_CHANNEL_ID`, `WATCH_REMINDER_SLOTS`, `copyZeppWatchPairingJson()` e lo schema a 12 campi di `buildWatchSummaryPayload(nowMs)`.
    - Collegare `saveFastingDayEdit()` al riallineamento di `state.fasting` così che il successivo sync aggiorni `users/{uid}/integrations/watch` per il quadrante Amazfit.
    - Portare il debounce di `cloudSyncHook` da `1800 ms` a `3800 ms`.
    - Correggere in `analyzeFreeTextMeal()` gli alias `ricotta_vaccina` → `ricotta_magra` e `salmone_selvaggio` → `salmone`.

#### 2. [`sw.js`](../../sw.js) (`Modify`)

* **Type / Scope:** Service Worker PWA.
* **Proposed Changes:** Incrementare `CACHE_NAME` da `pappa-pronta-shell-v14` a `pappa-pronta-shell-v15` per forzare l'aggiornamento della nuova UI sui browser con PWA già installata.

#### 3. [`manifest.json`](../../manifest.json) (`Modify`)

* **Type / Scope:** Manifest PWA.
* **Proposed Changes:** Allineare gli `shortcuts` della schermata Home (`Oggi`, `Spesa e Scanner`, `Cucina`, `Progressi`) alle nuove 4 tab.

#### 4. [`README.md`](../../README.md) (`Modify`)

* **Type / Scope:** Documentazione progetto.
* **Proposed Changes:** Aggiornare la descrizione delle 4 tab, del flusso `12 Cibi Sani → Ricette`, dello storico digiuno 7g modificabile e della modalità supermercato offline con coda foto etichette.

#### 5. [`.github/workflows/build-apk.yml`](../../.github/workflows/build-apk.yml) (`Modify`)

* **Type / Scope:** Pipeline CI/CD build APK Release Android.
* **Proposed Changes:** Aggiornare `versionCode` e `versionName` a `v3.6` per pubblicare l'APK Release aggiornato.

### Verification Plan

* **Static Analysis & Lint:**
  - Eseguire `impeccable detect --json index.html` verificando `0` anti-pattern/warning UI.
  - Verificare sintassi JS (`new Function` sul blocco `<script>`), `0` inline `onclick`, tutti gli ID `getElementById` presenti nel DOM, sanitizzazione `escHtml()` su ogni nuovo `innerHTML`, e validità JSON di `manifest.json`.
* **Unit Tests (script Node in `scratch/verify_usability_v36.cjs`):**
  - `rankRecipesForToday()`: verifica esclusione allergeni/celiachia/dieta, ordinamento per copertura `missingDozen`, rispetto tetto sodio residuo.
  - `pruneFastingHistory7d()` e `saveFastingDayEdit()`: verifica potatura oltre 7 giorni, rifiuto `start >= end` o `> 48h`, ricalcolo `fastHours` e `completed`, assenza di chiavi non ammesse da `firestore.rules`.
  - `computeDayGoalScore()`: verifica assenza falsi allarmi `0g` proteine in modalità solo check-in `12 Cibi Sani`.
  - `analyzeFreeTextMeal()`: verifica riconoscimento effettivo di `ricotta` (`ricotta_magra`) e `salmone` (`salmone`).
* **E2E / Mobile QA (Browser Subagent su viewport 360×800):**
  - Verificare i 4 CUJ end-to-end (mattina `Oggi` → 1-tap ricetta; sera digiuno + modifica data/ora 7g; `🛒 Spesa` spunta reversibile + ricette quasi pronte + confronto A vs B + simulazione offline/coda `IndexedDB`; `📈 Progressi` grafici 7/14/30g senza sovrapposizioni di testo + presenza `#watchRemindersDetails` e `#fbCopyZeppPairingBtn`).
  - Verificare `node --test zepp/shared/contract.test.mjs` (contratto Amazfit/Zepp `v: 1` invariato) e la validità del payload di `buildWatchSummaryPayload()` dopo 1-tap ricetta e `saveFastingDayEdit()`.
  - Verificare `firebase deploy --only firestore:rules --dry-run` (regole invariate e compatibili con payload esportato da `buildFirestoreSafePayload()` e `buildWatchSummaryPayload()`).

--------------------------------------------------------------------------------

*Drafted with EGM*
