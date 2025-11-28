import i18n from "../i18n";

export const settings = {
    paymentTypes:  {
        0: "Carta di credito",
        1: "Bonifico bancario"
    },
    serviceStatus: {
        0: "Caricato",
        1: "In corso",
        2: "Terminato",
        3: "Eliminato",
        4: "Salita cliente",
        5: "Discesa cliente",
    },
    wardenHistoryTypes: {
        0: "Login",
        1: "Ricerca Targa",
        2: "Download Voucher"
    },
    deleteAccountConfirmString: i18n.t("pages.profileDelete.confirmString")
}