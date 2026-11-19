import { SETTINGS_KEYS } from '../shared/contract';

function parseSafeJson(str) {
  if (!str || typeof str !== 'string') return null;
  try {
    return JSON.parse(str);
  } catch (_) {
    return null;
  }
}

function maskUid(uid) {
  if (!uid || typeof uid !== 'string') return '—';
  if (uid.length <= 8) return uid;
  return uid.slice(0, 4) + '...' + uid.slice(-4);
}

AppSettingsPage({
  state: {
    props: {},
    statusNotice: ''
  },

  savePairingInput(rawText) {
    const trimmed = String(rawText || '').trim();
    const parsed = parseSafeJson(trimmed);
    if (
      !parsed ||
      typeof parsed.projectId !== 'string' ||
      !parsed.projectId ||
      typeof parsed.apiKey !== 'string' ||
      !parsed.apiKey ||
      typeof parsed.uid !== 'string' ||
      !parsed.uid ||
      typeof parsed.refreshToken !== 'string' ||
      !parsed.refreshToken
    ) {
      this.state.statusNotice = 'Formato non valido: copia il JSON dal pulsante "Collega Orologio Zepp" in Pappa Pronta.';
      return;
    }

    const store = this.state.props.settingsStorage;
    store.setItem(
      SETTINGS_KEYS.PAIRING_JSON,
      JSON.stringify({
        projectId: parsed.projectId.trim(),
        apiKey: parsed.apiKey.trim(),
        uid: parsed.uid.trim(),
        refreshToken: parsed.refreshToken.trim()
      })
    );
    store.removeItem(SETTINGS_KEYS.CACHED_ID_TOKEN);
    store.removeItem(SETTINGS_KEYS.CACHED_TOKEN_EXP_SEC);
    this.state.statusNotice = 'Account Pappa Pronta collegato. Tocca ↻ sul quadrante per sincronizzare.';
  },

  clearPairing() {
    const store = this.state.props.settingsStorage;
    store.removeItem(SETTINGS_KEYS.PAIRING_JSON);
    store.removeItem(SETTINGS_KEYS.CACHED_ID_TOKEN);
    store.removeItem(SETTINGS_KEYS.CACHED_TOKEN_EXP_SEC);
    store.removeItem(SETTINGS_KEYS.LAST_DIAG_JSON);
    this.state.statusNotice = 'Account scollegato dalle impostazioni Zepp.';
  },

  build(props) {
    this.state.props = props;
    const store = props.settingsStorage;
    const pairing = parseSafeJson(store.getItem(SETTINGS_KEYS.PAIRING_JSON));
    const diag = parseSafeJson(store.getItem(SETTINGS_KEYS.LAST_DIAG_JSON));

    const isLinked = Boolean(pairing && pairing.uid && pairing.refreshToken);
    const connLine = isLinked
      ? 'Connesso (Progetto: ' + pairing.projectId + ' · Utente: ' + maskUid(pairing.uid) + ')'
      : 'Non collegato: incolla sotto il codice esportato da Pappa Pronta.';

    const diagLine = diag
      ? 'Ultima lettura: ' + (diag.time || '—') + ' · Esito: ' + (diag.msg || String(diag.status))
      : 'Nessuna sincronizzazione ancora eseguita.';

    return View(
      {
        style: {
          padding: '16px',
          backgroundColor: '#F6F8F7'
        }
      },
      [
        View(
          {
            style: {
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D8E2DC',
              marginBottom: '12px'
            }
          },
          [
            Text(
              {
                bold: true,
                style: { fontSize: '16px', color: '#145336', marginBottom: '6px', display: 'block' }
              },
              'Pappa Pronta · Ponte Orologio'
            ),
            Text(
              {
                style: { fontSize: '13px', color: isLinked ? '#1B6B46' : '#8A5A00', marginBottom: '6px', display: 'block' }
              },
              connLine
            ),
            Text(
              {
                style: { fontSize: '12px', color: '#4B5563', display: 'block' }
              },
              diagLine
            ),
            this.state.statusNotice
              ? Text(
                  {
                    style: { fontSize: '12px', color: '#1B6B46', marginTop: '6px', display: 'block' }
                  },
                  this.state.statusNotice
                )
              : null
          ]
        ),
        View(
          {
            style: {
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D8E2DC',
              marginBottom: '12px'
            }
          },
          [
            TextInput({
              label: isLinked ? 'Aggiorna codice collegamento JSON' : 'Incolla codice collegamento JSON da Pappa Pronta',
              placeholder: '{"projectId":"pappa-pronta-leo","apiKey":"...","uid":"...","refreshToken":"..."}',
              maxLength: 4096,
              onChange: (val) => {
                this.savePairingInput(val);
              }
            })
          ]
        ),
        isLinked
          ? Button({
              label: 'Scollega account Pappa Pronta',
              style: {
                fontSize: '13px',
                borderRadius: '8px',
                background: '#B91C1C',
                color: '#FFFFFF',
                padding: '8px 14px'
              },
              onClick: () => {
                this.clearPairing();
              }
            })
          : null
      ]
    );
  }
});
