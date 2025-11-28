import { toast } from "react-toastify";
import { getProfile } from "../../api/profile/getProfile";
import { updateProfile } from "../../api/profile/updateProfile";
import { passwordChange } from "../../api/account/passwordChange";
import { passwordForgot } from "../../api/account/passwordForgot";
import { state } from "../state";
import i18n from "../../i18n";

/**
 * Actions relative alla gestione dell'utente e del profilo
 */
export const userActions = {
    /**
     * Recupera il profilo dell'utente dal server
     */
    async getProfile() {        
        if(!state.session.token){
            state.user.loading = false;
            return;
        }
        
        state.user.loading = true;
        try {
            const result = await getProfile();        
            state.user.data = result;
        } finally {
            state.user.loading = false;
        }
    },

    /**
     * Aggiorna il numero di telefono dell'utente
     */
    async updatePhone(phone: string) {
        state.user.loading = true;
        try {
            const result = await updateProfile({phone});

            if(result?.status === "400") {
                console.error(result.messages);
                return;
            }
            
            toast.success(i18n.t("actions.profilePhone.success"));
            state.user.data = result;
            return result;
        } catch (error) {
            console.error('Errore nella registrazione:', error);
        } finally {
            state.user.loading = false;
        }
    },

    /**
     * Aggiorna il numero di telefono dell'utente
     */
    async updateProfile(content: any) {
        state.user.loading = true;
        try {
            const result = await updateProfile(content);
            
            toast.success(i18n.t("actions.profilePhone.success"));

            state.user.data = result;
            return result;
        } catch (error) {
            console.error('Errore nell\'aggiornamento del telefono:', error);
        } finally {
            state.user.loading = false;
        }
    },

    /**
     * Gestisce il cambio password dell'utente
     */
    async changePassword(data: { 
        old_password: string; 
        password: string; 
        password_confirmation: string;
    }) {
        state.app.loading = true;
        try {
            return await passwordChange(data);
        } catch (error) {
            console.error('Errore nel cambio password:', error);
        } finally {
            state.app.loading = false;
        }
    },

    /**
     * Gestisce la richiesta di reset password
     */
    async forgotPassword(data: {email: string}) {
        state.app.loading = true;
        try {
            const response = await passwordForgot(data);
            toast.success(i18n.t("actions.forgotPassword.success"));
            return response;
        } catch (error) {
            console.error('Errore nel reset password:', error);
            toast.error(i18n.t("actions.forgotPassword.error"));
        } finally {
            state.app.loading = false;
        }
    },

    /**
     * Gestisce l'eliminazione dell'account
     */
    async deleteAccount() {
        state.app.loading = true;
        try {
            //await deleteAccount();
            toast.success(i18n.t("actions.profileDelete.success"));
            // Cancello il token
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Resetto lo stato
            state.session.token = null;
            state.user.data = null;
       
        } catch (error) {
            toast.error(i18n.t("actions.profileDelete.error"));
            console.error('Errore nell\'eliminazione dell\'account:', error);
        } finally {
            state.app.loading = false;
        }
    }
};