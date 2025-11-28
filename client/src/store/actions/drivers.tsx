import { state } from "../state";
import { Driver } from "../interface";
import { getDrivers } from "../../api/driver/getDrivers";
import { updateDriver } from "../../api/driver/updateDriver";
import { addDriver } from "../../api/driver/addDriver";
import { deleteDriver } from "../../api/driver/deleteDriver";
import { actions } from ".";

/**
 * Actions relative alla gestione dei conducenti
 */
export const driverActions = {
    /**
     * Recupera tutti i conducenti dal server
     */
    async getDrivers() {
        state.session.drivers.loading = true;
        try {
            const data = await getDrivers();
            state.session.drivers.data = data.drivers;
            return data.drivers;
        } catch (error) {
            console.error('Errore nel caricamento dei conducenti:', error);
        } finally {
            state.session.drivers.loading = false;
        }
    },

    /**
     * Aggiorna i dati di un conducente
     */
    async updateDriver(driver: Driver) {
        state.session.drivers.loading = true;
        try {
            await updateDriver(driver.id, driver);
        } catch (error) {
            console.error('Errore nell\'aggiornamento del conducente:', error);
        } finally {
            state.session.drivers.loading = false;
            
            // Aggiorno i conducenti
            await actions.getDrivers()
        }
    },

    /**
     * Aggiungo un nuovo conducente
     */
    async addDriver(driver: Driver) {
        state.session.drivers.loading = true;
        try {
            const response = await addDriver(driver);
            return response;
        } catch (error) {
            console.error('Errore nel caricamento dei conducenti:', error);
        } finally {
            state.session.drivers.loading = false;
            
            // Aggiorno i conducenti
            await actions.getDrivers()
        }
    },

    /**
     * Elimino un conducente
     */
    async deleteDriver(id: number) {
        state.app.loading = true;
        try {
            const response = await deleteDriver(id);
            return response;    
        } catch (error) {
            console.error('Errore nel caricamento dei conducenti:', error);
        } finally {
            state.app.loading = false;

            // Aggiorno i conducenti
            await actions.updatePrimaryDriver()
        }
    },

    /**
     * Imposto il conducente primario se non c'e' nessuno settato
     */
    async updatePrimaryDriver() {
        // Avvio il loader dell'app
        state.app.loading = true;

        // Scarico i conducenti
        let drivers = await actions.getDrivers();
        
        if(drivers.length === 0){
            state.app.loading = false;
            return;
        }
        // Verfico se almeno uno dei conducenti e' primario
        const hasPrimary = drivers.some((d: Driver) => d.primary);

        if(hasPrimary){
            state.app.loading = false;
            return;
        }
        
        // Se non c'e' nessuno primario, setto il primo come primario
        const driversWithoutPrimary = drivers.filter((d: Driver) => !d.primary);

        // Setto il primo come primario
        await actions.updateDriver({ ...driversWithoutPrimary[0], primary: true });

        // Disabilito il loader dell'app
        state.app.loading = false;

        // Aggiorno i conducenti
        await actions.getDrivers()
    },


}; 