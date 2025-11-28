import { state } from "../state";
import { getGarages } from "../../api/garage/getGarages";
import { Garage } from "../interface";

/**
 * Actions relative alla gestione dei garage
 */
export const garageActions = {
    /**
     * Recupera tutti i garage dal server
     */
    async getGarages() {
        state.session.garages.loading = true;
        try {
            const data = await getGarages();
            state.session.garages.data = data.garages;
        } catch (error) {
            console.error('Errore nel caricamento dei garage:', error);
        } finally {
            state.session.garages.loading = false;
        }
    },

    /**
     * Imposta il garage corrente
     */
    setCurrentGarage(garage: Garage) {
        state.session.garages.currentGarage = garage;
    },

    
}; 