import { state } from "../state";
import { Service, ServiceUpdate } from "../interface";
import { getServices } from "../../api/services/getServices";
import { addService } from "../../api/services/addService";
import { updateService } from "../../api/services/updateService";
import { startService } from "../../api/services/startService";
import { endService } from "../../api/services/endService";
import { deleteService } from "../../api/services/deleteService";
import { hopOffService } from "../../api/services/hopOffService";
import moment from "moment";
import { toast } from "react-toastify";
import { actions } from ".";
import { hopOnService } from "../../api/services/hopOnService";
import { generateServiceVoucher } from "../../api/services/generateServiceVoucher";
import { t } from "i18next";
import { getPeriodServices } from "../../api/services/getPeriodServices";
import { getSingleServiceVoucher } from "../../api/services/getSingleServiceVoucher";
import { reverseGeocoding } from "../../helpers/reverseGeocoding";
import { getKm } from "../../api/getKm";


/**
 * Actions relative alla gestione dei servizi
 */
export const serviceActions = {
    /**
     * Recupera tutti i servizi dal server
     */
    async getServices() {        
        state.session.services.loading = true;
        try {
            const data = await getServices();
            const services = await actions.updateServicesWithDrivers(data.services);
            await actions.setServicesStart(services);
            state.session.services.data = services;
        } catch (error) {
            console.error('Errore nel caricamento dei servizi:', error);
            state.app.error = 'Errore nel caricamento dei servizi.';
        } finally {
            state.session.services.loading = false;
        }
    },

    /**
     * Imposta l'orario di inizio dei servizi del giorno
     */
    async setServicesStart(services: Service[]) {
        const timeStart = services
            .filter(service => 
                moment(service.start_time, "YYYY-MM-DD HH:mm:ss").isSame(moment(), 'day') &&
                service.status > 0
            )
            .sort((a, b) => 
                moment(a.start_time).diff(moment(b.start_time))
            )[0]?.effective_start_time;

        state.session.services.start = timeStart ? 
            moment(timeStart).format("HH:mm") : 
            null;
    },

    /**
     * Aggirno i driver dentro i servizi
     */
    async updateServicesWithDrivers(services: Service[]) {
        let drivers;
        if (!state.session.drivers.data) {
            const result = await actions.getDrivers();
            drivers = result
        } else {
            drivers = state.session.drivers.data
        }        
        
        if(drivers.length === 0){
            return;
        }
        
        services.forEach((service: Service) => {                    
            const driver = drivers.find(driver => driver.id === service.driver_id);

            if(!driver){
                return;
            }

            service.driver_name = driver.first_name + " " + driver.last_name;            
        });

        return services;
    },

    /**
     * Aggiungo un nuovo servizio
     */
    async addService(serviceData:Service) {
        state.app.loading = true;
        try {
            const response = await addService(serviceData);   
            state.app.loading = true;

            const data = await getServices();
            state.app.loading = true;
            
            
            const services = await actions.updateServicesWithDrivers(data.services);
            state.app.loading = true;

            await actions.setServicesStart(services);
            state.app.loading = true;
            state.session.services.data = services;
            
            return response;
        } catch (error) {
            console.error('Errore nel caricamento dei conducenti:', error);
        } finally {
            state.app.loading = false;            
        } 
    },
    
    /**
     * Aggiorno un servizio
     */
    async updateService(serviceData:any, id:number) {
        state.app.loading = true;
        try {
            const response = await updateService(serviceData, id);  

            if(response && response.status === "400"){
                toast.error(response.messages)
                return
            } 
                       
            await actions.getServices()
            return response;
        } catch (error) {
            console.error('Errore nel caricamento nel servizio:', error);
        } finally {
            state.app.loading = false;            
        } 
    },

    /**
     * Elimino un servizio
     */
    async deleteService(id:number) {
        state.app.loading = true;
        try {
            const response = await deleteService(id);   
            


        
            await actions.getServices()
            return response;
        } catch (error) {
            console.error('Errore nel caricamento dei conducenti:', error);
        } finally {
            state.app.loading = false;            
        } 
    },

    /**
     * Avvio un servizio
     */
    async startService(serviceUpdate: {
        km: number;
        latitude: string;
        longitude: string;
        address: string;
    }, id:number) {
        state.app.loading = true;
        try {

            if(serviceUpdate.address){
                const address = await reverseGeocoding(serviceUpdate.latitude, serviceUpdate.longitude);
                serviceUpdate.address = address;
            }

           // Limita i valori di lat/long a 10 cifre totali con 8 decimali per evitare overflow
           const lat = parseFloat(serviceUpdate.latitude);
           const lng = parseFloat(serviceUpdate.longitude);
           serviceUpdate.latitude = (Math.abs(lat) < 100 ? lat : lat/10).toFixed(8);
           serviceUpdate.longitude = (Math.abs(lng) < 100 ? lng : lng/10).toFixed(8);
           
            
            const response = await startService( id.toString(), serviceUpdate);
                       
            await actions.getServices()
            return response;
        } catch (error) {
            console.error('Errore nell\'avvio del servizio:', error);
        } finally {
            state.app.loading = false;            
        }
    },

    /**
     * Termino un servizio
     */
    async endService(serviceUpdate: {
        km: number;
        latitude: string;
        longitude: string;
        address: string;
    }, id:number) {
        state.app.loading = true;
        try {

            if(serviceUpdate.address){
                const address = await reverseGeocoding(serviceUpdate.latitude, serviceUpdate.longitude);
                serviceUpdate.address = address;
            }

            // Limita i valori di lat/long a 10 cifre totali con 8 decimali per evitare overflow
            const lat = parseFloat(serviceUpdate.latitude);
            const lng = parseFloat(serviceUpdate.longitude);
            serviceUpdate.latitude = (Math.abs(lat) < 100 ? lat : lat/10).toFixed(8);
            serviceUpdate.longitude = (Math.abs(lng) < 100 ? lng : lng/10).toFixed(8);

            const response = await endService( id.toString(), serviceUpdate);


            state.session.calendar.date = new Date();
                       
            await actions.getServices()
            return response;
        } catch (error) {
            console.error('Errore nel completamento del servizio:', error);
        } finally {
            state.app.loading = false;            
        } 
    },

    /**
     * Imposto la salita del cliente di un servizio
     */
    async hopOnService(serviceUpdate:{
        latitude: string;
        longitude: string;
        address: string;
    }, id:number) {
        try {
            state.app.loading = true;

            if(serviceUpdate.address){
                const address = await reverseGeocoding(serviceUpdate.latitude, serviceUpdate.longitude);
                serviceUpdate.address = address;
            }

            // Limita i valori di lat/long a 10 cifre totali con 8 decimali per evitare overflow
            const lat = parseFloat(serviceUpdate.latitude);
            const lng = parseFloat(serviceUpdate.longitude);
            serviceUpdate.latitude = (Math.abs(lat) < 100 ? lat : lat/10).toFixed(8);
            serviceUpdate.longitude = (Math.abs(lng) < 100 ? lng : lng/10).toFixed(8);

            const response = await hopOnService( id.toString(), {
                latitude: serviceUpdate.latitude,
                longitude: serviceUpdate.longitude,
                address: serviceUpdate.address,
            });
                       
            await actions.getServices()
            return response;
        } catch (error) {
            console.error('Errore nel completamento del servizio:', error);
        } finally {
            state.app.loading = false;            
        } 
    },


    /**
     * Imposto la discesa del cliente di un servizio
     */
    async hopOffService(serviceUpdate: {
        latitude: string;
        longitude: string;
        address: string;
    }, id:number) {
        try {
            state.app.loading = true;

            if(serviceUpdate.address){
                const address = await reverseGeocoding(serviceUpdate.latitude, serviceUpdate.longitude);
                serviceUpdate.address = address;
            }

            // Limita i valori di lat/long a 10 cifre totali con 8 decimali per evitare overflow
            const lat = parseFloat(serviceUpdate.latitude);
            const lng = parseFloat(serviceUpdate.longitude);
            serviceUpdate.latitude = (Math.abs(lat) < 100 ? lat : lat/10).toFixed(8);
            serviceUpdate.longitude = (Math.abs(lng) < 100 ? lng : lng/10).toFixed(8);

            const response = await hopOffService( id.toString(), {
                latitude: serviceUpdate.latitude,
                longitude: serviceUpdate.longitude,
                address: serviceUpdate.address,
            });
                       
            await actions.getServices()
            return response;
        } catch (error) {
            console.error('Errore nel completamento del servizio:', error);
        } finally {
            state.app.loading = false;            
        }
    },

    /**
     * Aggiorno i servizi del calendario in base alla data
     */
    async updateCalendarServices(newDate: Date | string) {
        state.session.calendar.loading = true;

        try {
            // Scarico i serivizi per la data selezionata in store.session.calendar.date
            const data = await getServices(moment(newDate).format("YYYY-MM-DD"));
            state.session.calendar.services = data.services && data.services.length > 0 ? data.services : null;
            state.session.calendar.count = data.services ? data.services.length : 0;


        } catch (error) {
            console.error('Errore:', error);
        } finally {
            state.session.calendar.loading = false;            
        } 
    },


    /**
     * Genero il foglio di servizio
     */
    async generateServiceVoucher(formData: any) {
        try {
            state.app.loading = true;
            await generateServiceVoucher(formData);

            //toast.success(t("actions.serviceVoucher.success"));
            return true;


        } catch (error) {
            console.error('Errore:', error);
            toast.error(t("actions.serviceVoucher.error"));
            return false;

        } finally {
            state.app.loading = false;
 
        } 
    },


    /**
     * Recupero i servizi di un periodo
     */
    async getPeriodDays(formData: any) {
        state.session.services.period.loading = true;
        
       
        // Dal period tra le due date in formato YYYY-MM-DD formData.from e formData.to prendo i giorni e li aggiungo allo store.session.services.period.days
        const from = moment(formData.from);
        const to = formData.to ? moment(formData.to) : null;

        // Calcolo i giorni tra le due date includendo il giorno di inizio e fine
        const days = [];
        let current = moment(from).startOf('day');
        const endDate = to ? moment(to).endOf('day') : null;

        if(endDate){
            while (current.isSameOrBefore(endDate)) {
                days.push(current.format('YYYY-MM-DD'));
                current.add(1, 'days');
            }

            // Aggiungo il giorno finale se non è presente
            if (!days.includes(endDate.format('YYYY-MM-DD'))) {
                days.push(endDate.format('YYYY-MM-DD'));
            }
        } else {
            days.push(from.format('YYYY-MM-DD'));
        }

        state.session.services.period.days = days as any; 
        state.session.services.period.loading = false;

        
        return days;
    },


    async removePeriodDay(day: string, days: string[]) {
        state.session.services.period.loading = true;

        let newDays = days;

        // Cerco il giorno nell'array e lo rimuovo
        newDays = days.filter(d => d !== day);
               
        // Aggiorno lo store.session.services.period.days
        state.session.services.period.days = newDays as any; 

        setTimeout(() => {
            state.session.services.period.loading = false;
        }, 1000);

    },


    /**
     * Recupero voucher di un singolo servizio
     */
    async getSingleServicePdfVoucher(day: string) {
        state.app.loading = true;
        try {   
            const rootUrl = import.meta.env.VITE_BASE_URL;
            const response = await fetch(`${rootUrl}/day-voucher/?date=${day.split('T')[0]}`, {
                method: 'GET', // o POST se serve
                headers: {
                'Accept': 'application/pdf', // opzionale ma consigliato
                'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            }).then((response) => {
                if (!response.ok) {
                    throw new Error('Errore nella risposta');
                }
                return response.blob(); 
            })
           
            .catch((error) => {
                console.error('Errore nella fetch del PDF:', error);
            });
            
            return response;
        } catch (error) {
            console.error('Errore nel caricamento del voucher del servizio:', error);
        } finally {
            state.app.loading = false;
        }
    },


    /**
     * Recupero i km
     */
    async getLastServiceKm() {
        state.app.loading = true;
        const response = await getKm();
        state.app.loading = false;
        return response;
    }
    



}; 