/**
 @license
 Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 Code distributed by Google as part of the polymer project is also
 subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import {Action, ActionCreator} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../store.js';

export const UPDATE_COUNTRY_PROGRAMMES = 'UPDATE_COUNTRY_PROGRAMMES';
export const UPDATE_DISAGGREGATIONS = 'UPDATE_DISAGGREGATIONS';

export interface CommonDataActionUpdateCountryProgrammes extends Action<'UPDATE_COUNTRY_PROGRAMMES'> {
  countryProgrammes: object[]
};

export interface CommonDataActionUpdateDisaggregations extends Action<'UPDATE_DISAGGREGATIONS'> {
  disaggregations: object[]
};
export type CommonDataAction = CommonDataActionUpdateCountryProgrammes | CommonDataActionUpdateDisaggregations;

// @ts-ignore - for now
type ThunkResult = ThunkAction<void, RootState, undefined, CommonDataAction>;

export const updateCountryProgrammes: ActionCreator<CommonDataActionUpdateCountryProgrammes> =
    (countryProgrammes: object[]) => {
      return {
        type: UPDATE_COUNTRY_PROGRAMMES,
        countryProgrammes
      };
    };

export const updateDisaggregations: ActionCreator<CommonDataActionUpdateDisaggregations> =
    (disaggregations: object[]) => {
      return {
        type: UPDATE_DISAGGREGATIONS,
        disaggregations
      };
    };

