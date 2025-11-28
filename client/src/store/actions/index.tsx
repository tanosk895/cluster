import { state } from '../state';
import { appActions } from './app';
import { driverActions } from './drivers';
import { garageActions } from './garages';
import { serviceActions } from './services';
import { userActions } from './user';

/**
 * Combina tutte le actions dell'applicazione
 */
export const actions = {
    state,
    ...appActions,
    ...userActions,
    ...serviceActions,
    ...driverActions,
    ...garageActions,
}; 