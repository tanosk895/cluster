import { useNavigate } from "react-router-dom";
import { useDeviceGeolocation } from "../../helpers/deviceGeolocation";
import { state } from "../state";

let pollingInterval: ReturnType<typeof setInterval> | undefined;

/**
 * Actions relative alle funzionalità base dell'applicazione
 */
export const appActions = {
    /**
     * Imposta lo stato di caricamento globale dell'applicazione
     */
    setLoading: (loading: boolean) => {
        state.app.loading = loading;
    },

    /**
     * Imposta un messaggio di errore globale
     */
    setError(error: string) {
        state.app.error = error;
    },

    /**
     * Imposta se il dispositivo ha un notch
     */
    setHasNotch(hasNotch: boolean) {
        state.app.hasNotch = hasNotch;
    },

     /**
     * Preleva la posizione dell'utente
     */
    async getPosition() {
        await useDeviceGeolocation();
    },

    /**
     * Cancella la posizione dell'utente
     */
    clearPosition() {
        state.session.position.data = null;
        localStorage.removeItem('position');
    },

    /**
     * Inizia la polling della posizione dell'utente
     */
    startPositionPolling() {
        state.session.position.polling = true;
        pollingInterval = setInterval(() => {
            this.getPosition();
        }, 20000);
    },

    /**
     * Ferma la polling della posizione dell'utente
     */
    stopPositionPolling() {
        state.session.position.polling = false;
        if (pollingInterval) {            
            clearInterval(pollingInterval);
        }
    },


    /**
     * Cancella la sessione dell'utente
     */
    clearSession() {
        this.stopPositionPolling();
        localStorage.removeItem('position');
        state.session.position.polling = false;
    },

    /**
     * Imposta la posizione dell'utente
     */
    setPosition(position: {
        latitude: string;
        longitude: string;
        address: string;
    }) {
        state.session.position.data = position;
    },

    /**
     * Logout dell'utente
     */
    logout() {
        state.app.loading = true;
        this.clearSession();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("position");
        state.session.token = null;
        state.user.data = null;

        setTimeout(() => {
            state.app.loading = false;
        }, 1500);
    },



}; 