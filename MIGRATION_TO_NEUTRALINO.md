# 🚀 Migrazione da Electron a Neutralinojs
Ho letto le plausibile "ottimizzazioni che vorreste fare con Qt, etc.. ma mi sono detto perchè non iniziare comunque senza tagliare ancora la testa al toro?

Questo documento descrive la migrazione dell'architettura desktop da **Electron** a **Neutralinojs**.

## 🎯 Perché questa migrazione?

Siccome il progetto deve girare su hardware embedded, con risorse limitate (Raspberry Pi). Electron introduceva un overhead eccessivo. e passare in media ad occupare 300 a circa 30 credo sia un piccolo passo in avanti.


potete meglio vedere ulteriori benchmark qui -----> https://github.com/neutralinojs/evaluation

---

# TESTATO SU PASSAGGIO CON SU WINDOWS 11. 
So che è da sistemare su Linux. proverò a farlo se non riuscite a testarlo voi.

## 🛠️ Modifiche Architetturali

### 1. Rimozione di Electron
* Rimosso `electron` dalle dipendenze (`package.json`).
* Eliminato il file `main.cjs` (che gestiva il Main Process di Node.js).
* La logica di backend (gestione finestra) è stata spostata da Node.js al binario nativo C++ di Neutralino.

### 2. Introduzione di Neutralinojs
* Aggiunto `neutralino.config.json`: file di configurazione principale (versione **5.3.0**).
* Creata la cartella `/resources`: contiene gli asset minimi per l'avvio (`icon.png`, `index.html`, `neutralino.js`).
* Aggiunta la cartella `/bin`: contiene i binari scaricati (`neutralino-linux_armhf`, `neutralino-win_x64.exe`, ecc).


## 📂 Nuova Struttura Cartelle: Spiegazione

Con il passaggio a Neutralinojs, è stata introdotta una nuova cartella fondamentale: **`/resources`**.

### Cosa contiene?
* **`icon.png`**: L'icona dell'applicazione desktop.
* **`neutralino.js`**: La libreria client (ponte tra JavaScript e C++).

### ⚠️ Nota per i Dev
Questa cartella **è inclusa nel repository** (a differenza di `/bin` che è git-ignored).
Tuttavia, il file `neutralino.js` viene automaticamente aggiornato/riscaricato quando lanciate il comando `npm run install:all` (grazie a `npx neu update`), garantendo che la versione del client JavaScript sia sempre allineata con i binari nativi.


### 3. Logica Frontend (`client/src/main.tsx`)
La gestione del posizionamento della finestra (Cockpit logic) è stata spostata nel frontend React.
* **Electron:** La finestra veniva creata e posizionata dal processo Node *prima* di caricare React.
* **Neutralino:** React si avvia, rileva `window.Neutralino`, e comanda al sistema operativo di spostare la finestra sul monitor corretto e ridimensionarla (1920x580).

### 4. Configurazione Vite (`client/vite.config.ts`)
* Porta fissata a **5173** (`strictPort: true`) per garantire che Neutralino trovi sempre il server di sviluppo.

---

## ⌨️ Nuovi Comandi di Sviluppo

A causa della dipendenza hardware del server (che richiede pin GPIO fisici del Raspberry Pi), sono stati separati i flussi di lavoro per Windows/Mac e per il Target Device.

### 💻 1. Sviluppo su PC 
**Comando:** `npm run dev`

* **Cosa fa:** Avvia **SOLO** il Client (React/Vite) e l'App Desktop (Neutralino).

### 🍓 2. Esecuzione su Raspberry Pi (Target)
**Comando:** `npm start`

* **Cosa fa:** Avvia l'intero stack: **Server Backend** + **Client** + **App Neutralino**.
* **Nota:** Richiede hardware Raspberry Pi reale.

---

## 📂 Struttura File Aggiornata

```text
Project Root/
├── package.json              <-- Scripts aggiornati (dev vs start)
├── neutralino.config.json    <-- Configurazione Desktop (Ex main.js)
├── resources/                <-- Cartella critica per Neutralino
│   ├── icon.png
│   ├── index.html            <-- Placeholder per avvio nativo
│   └── neutralino.js         <-- Libreria Client
├── bin/                      <-- Eseguibili nativi (gitignored)
├── client/
│   ├── src/main.tsx          <-- Logica gestione finestra aggiunta qui
│   ├── vite.config.ts        <-- Porta 5173 forzata
│   └── index.html            <-- Script __neutralino_globals.js aggiunto
└── server/                   <-- Invariato (ma non parte con npm run dev)

