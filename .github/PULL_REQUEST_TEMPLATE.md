## 📋 Descrizione

Descrivi brevemente cosa fa questa PR e perché è necessaria.

Fixes #(issue_number) <!-- Se risolve una issue, indicala qui -->

## 🎯 Tipo di Modifica

Che tipo di modifica introduce questa PR? (segna con una X)

- [ ] 🐛 Bug fix (modifica non-breaking che risolve un problema)
- [ ] ✨ Nuova feature (modifica non-breaking che aggiunge funzionalità)
- [ ] 💥 Breaking change (fix o feature che causerebbe il malfunzionamento di funzionalità esistenti)
- [ ] 📚 Documentazione (aggiornamento o aggiunta di documentazione)
- [ ] 🎨 Refactoring (modifiche al codice senza cambiare funzionalità)
- [ ] ⚡ Performance (miglioramenti di performance)
- [ ] 🔧 Configurazione (modifiche a file di config, build, dipendenze)
- [ ] 🧪 Test (aggiunta o correzione di test)

## 🔧 Componenti Modificati

- [ ] Client (React/Frontend)
- [ ] Server (Node.js/Backend)
- [ ] Configurazione GPIO
- [ ] Servizi (OBD/Sensori/WebSocket)
- [ ] Documentazione
- [ ] Build/Deploy
- [ ] Altro: _________

## 🧪 Testing

Descrivi i test che hai eseguito per verificare le modifiche:

- [ ] Test in modalità mock
- [ ] Test con server reale (Raspberry Pi)
- [ ] Test hardware (GPIO/Sensori)
- [ ] Test su veicolo reale
- [ ] Test cross-browser (se frontend)
- [ ] Test build production

**Configurazione di test:**
- Hardware: [es. Raspberry Pi 4B / Mac M1]
- OS: [es. Raspberry Pi OS / macOS]
- Node.js: [es. v18.17.0]
- Browser: [es. Chromium 120]

## 📸 Screenshot/Video

Se applicabile, aggiungi screenshot o video che mostrano le modifiche (specialmente per UI).

## ✅ Checklist

Prima di aprire la PR, verifica:

### Codice
- [ ] Il mio codice segue lo stile del progetto
- [ ] Ho aggiunto l'header di licenza GPL v3 ai nuovi file sorgente
- [ ] Ho commentato il codice, specialmente nelle parti complesse
- [ ] Le mie modifiche non generano nuovi warning
- [ ] Ho testato localmente che tutto funzioni
- [ ] Non ci sono file/log/debug dimenticati nel commit

### Documentazione
- [ ] Ho aggiornato la documentazione relativa alle modifiche
- [ ] Ho aggiornato il README se necessario
- [ ] Ho aggiornato i file di configurazione di esempio se necessario
- [ ] Ho aggiornato ARCHITETTURA.md se ho modificato flussi/servizi

### Git
- [ ] Ho fatto rebase sul branch main più recente
- [ ] I miei commit sono atomici e ben descritti
- [ ] Non ci sono conflitti di merge
- [ ] Ho verificato che la mia PR non includa modifiche non correlate

### Sicurezza & Qualità
- [ ] Le mie modifiche non introducono vulnerabilità di sicurezza
- [ ] Non ho committato credenziali, token o dati sensibili
- [ ] Ho considerato l'impatto su prestazioni e memoria
- [ ] Ho verificato la compatibilità con le versioni target

## 🔗 Issue Collegate

Collega le issue rilevanti:
- Closes #
- Relates to #
- Depends on #

## 📝 Note per i Reviewer

Informazioni aggiuntive utili per chi revisiona la PR:
- Aree specifiche su cui focalizzare l'attenzione
- Decisioni di design da discutere
- Trade-off considerati
- Limitazioni note

## ⚠️ Breaking Changes

Se questa PR introduce breaking changes, descrivili qui:
- Cosa si rompe?
- Come migrare alla nuova versione?
- Impatto su configurazioni esistenti?

## 📊 Performance

Se rilevante, indica l'impatto sulle performance:
- Benchmark prima/dopo
- Utilizzo memoria
- Tempo di risposta

---

**⚠️ Reminder**: Ricorda che questo progetto è rilasciato sotto licenza GPL-3.0-or-later. Contribuendo, accetti che il tuo codice sia rilasciato sotto la stessa licenza.

