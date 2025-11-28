/*
 * PandaOS - Neutralino Edition
 */
import { createRoot } from 'react-dom/client'
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import 'react-toastify/dist/ReactToastify.css';
import 'swiper/css';
import 'swiper/swiper-bundle.css';
import 'swiper/css/free-mode';
import './App.scss'
import App from './App';

// --- LOGICA NEUTRALINO PURE ---
const initPandaOS = async () => {
  // Helper per TypeScript
  const N = (window as any).Neutralino;

  if (!N) {
    console.warn("⚠️ Neutralino non rilevato. Esegui 'npm start' per vederlo funzionare.");
    return;
  }

  try {
    // 1. Inizializza
    N.init();

    await N.events.on("windowClose", () => {
        console.log("X premuta: Uccido il processo.");
        N.app.exit();
    });
    console.log("🐼 PandaOS: Neutralino inizializzato.");

    // 2. Gestione chiusura app
    await N.events.on("windowClose", () => N.app.exit());

    // 3. Gestione Monitor (Cockpit Logic)
    const displays = await N.computer.getDisplays();
    console.log(`Monitor rilevati: ${displays.length}`);

    // Seleziona monitor (0 = primo monitor)
    const targetDisplay = displays[0];

    if (targetDisplay) {
      console.log(`Spostamento su monitor: ${targetDisplay.bounds.width}x${targetDisplay.bounds.height}`);
      await N.window.move(targetDisplay.bounds.x, targetDisplay.bounds.y);
      await N.window.setSize(1920, 580);
      // await N.window.setFullScreen(); // Decommenta se vuoi fullscreen forzato
    }
    
    // Aggiungi classe CSS per styling specifico
    document.body.classList.add('neutralino-app');

  } catch (err) {
    console.error("Errore avvio PandaOS:", err);
  }
};

// Avvia
initPandaOS();

// --- LOGICA REACT STANDARD ---
window.addEventListener('scroll', () => {
  document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
});
document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <SkeletonTheme baseColor="#E7E9F3" highlightColor="#fff">
      <App />
    </SkeletonTheme>
  );
}