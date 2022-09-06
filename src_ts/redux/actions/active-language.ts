import {ActionCreator, Action} from 'redux';
export const SET_LANGUAGE = 'SET_LANGUAGE';
export const SET_LANGUAGE_FILE_LOADED = 'SET_LANGUAGE_FILE_LOADED';

export interface LanguageActionSet extends Action<'SET_LANGUAGE'> {
  payload: string;
}

export interface LanguageFileLoadedSet extends Action<'SET_LANGUAGE_FILE_LOADED'> {
  payload: boolean;
}

export const setLanguage: ActionCreator<LanguageActionSet> = (payload: string) => {
  return {
    type: SET_LANGUAGE,
    payload
  };
};

export const setLanguageFileLoaded: ActionCreator<LanguageFileLoadedSet> = (payload: boolean) => {
  return {
    type: SET_LANGUAGE_FILE_LOADED,
    payload
  };
};

export type LanguageAction = LanguageActionSet | LanguageFileLoadedSet;
