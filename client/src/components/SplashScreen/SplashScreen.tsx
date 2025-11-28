import React, { useState, useEffect, useRef } from 'react';
import './SplashScreen.scss';
import { splashScreen as splashConfig, app as appConfig } from '../../config/environment';

interface SplashScreenProps {
  children: React.ReactNode;
}

/**
 * Componente SplashScreen
 * Visualizza un video splashscreen all'avvio dell'applicazione
 * Il video viene riprodotto fino alla fine e poi fa un fadeout
 */
const SplashScreen: React.FC<SplashScreenProps> = ({ children }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  /**
   * Handler per quando il video è pronto per essere riprodotto
   */
  const handleVideoCanPlay = () => {
    setVideoLoaded(true);
    // Avvia la riproduzione automatica
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Errore riproduzione video:', error);
        // Se la riproduzione automatica fallisce, nascondi comunque la splashscreen
        setShowSplash(false);
      });
    }
  };

  /**
   * Handler per quando il video finisce
   * Avvia il fadeout
   */
  const handleVideoEnded = () => {
    setIsFadingOut(true);
    // Dopo l'animazione di fadeout, nascondi completamente la splashscreen
    setTimeout(() => {
      setShowSplash(false);
    }, 500); // Durata del fadeout (deve corrispondere alla durata CSS)
  };

  /**
   * Handler per errore caricamento video
   */
  const handleVideoError = () => {
    console.error('Errore caricamento video splashscreen');
    setShowSplash(false);
  };

  /**
   * Gestisce il body scroll quando la splashscreen è attiva
   */
  useEffect(() => {
    if (showSplash) {
      document.body.classList.add('splash-active');
    } else {
      document.body.classList.remove('splash-active');
    }

    return () => {
      document.body.classList.remove('splash-active');
    };
  }, [showSplash]);

  return (
    <div className={`splash-container ${showSplash ? 'splash-active' : ''}`}>
      <div className="app-content">
        {children}
      </div>

      {showSplash && (
        <div className={`splash-overlay ${isFadingOut ? 'fade-out' : ''}`}>
          <video
            ref={videoRef}
            className="splash-video"
            src={splashConfig.path}
            autoPlay
            muted
            playsInline
            onCanPlay={handleVideoCanPlay}
            onEnded={handleVideoEnded}
            onError={handleVideoError}
          />
          
          {!videoLoaded && (
            <>
            <div className="splash-loading">
              <div className="loading-spinner"></div>
                <p>Avvio in corso...</p>
              </div>
              <div className="splash-app-info">
                <span className="splash-app-name">{appConfig.name}</span>
                <span className="splash-app-version">v{appConfig.version}</span>
            </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SplashScreen;
