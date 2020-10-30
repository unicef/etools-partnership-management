import {UPDATE_CURRENT_INTERVENTION} from './actionsConstants';
import {Intervention} from '@unicef-polymer/etools-types';

export const updateCurrentIntervention = (intervention: Intervention) => {
  return {
    type: UPDATE_CURRENT_INTERVENTION,
    current: intervention
  };
};
