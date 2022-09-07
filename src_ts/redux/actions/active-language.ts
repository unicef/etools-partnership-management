import {ActionCreator, Action} from 'redux';
export const SET_ACTIVE_LANGUAGE = 'SET_ACTIVE_LANGUAGE';

export interface LanguageActionSet extends Action<'SET_ACTIVE_LANGUAGE'> {
  payload: string;
}

export const setActiveLanguage: ActionCreator<LanguageActionSet> = (payload: string) => {
  return {
    type: SET_ACTIVE_LANGUAGE,
    payload
  };
};

export type LanguageAction = LanguageActionSet;
