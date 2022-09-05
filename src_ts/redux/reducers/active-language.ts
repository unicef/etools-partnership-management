import {SET_LANGUAGE, SET_LANGUAGE_FILE_LOADED} from '../actions/active-language';

export interface ActiveLanguageState {
  activeLanguage: string;
  languageFileLoaded: boolean;
}

const INITIAL_STATE: ActiveLanguageState = {
  activeLanguage: '',
  languageFileLoaded: false
};

export const activeLanguage = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case SET_LANGUAGE:
      return {...state, activeLanguage: action.payload};
    case SET_LANGUAGE_FILE_LOADED:
      return {...state, languageFileLoaded: action.payload};
    default:
      return state;
  }
};
