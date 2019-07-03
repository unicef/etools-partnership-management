import {PolymerElement} from '@polymer/polymer';
import ListDataMixin from '../../../mixins/list-data-mixin';
import {store} from '../../../../store.js';
import Dexie from 'dexie';

declare const moment: any;

import {isEmptyObject} from '../../../utils/utils';
import {setAgreements} from '../../../../actions/agreements';
import {MinimalAgreement} from '../agreement.types';
import {fireEvent} from '../../../utils/fire-custom-event';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../typings/globals.types';

/**
* @polymer
* @customElement
* @mixinFunction
* @appliesMixin ListDataMixin
*/
class AgreementsListData extends ListDataMixin(PolymerElement) {

  @property({type: String})
  endpointName: string = 'agreements';

  @property({type: String})
  dataLoadedEventName: string = 'agreements-loaded';

  @property({type: Array, notify: true, readOnly: true})
  filteredAgreements: [] = [];

  @property({type: Number, readOnly: true, notify: true})
  totalResults!: number;

  @property({type: Object})
  currentQuery: GenericObject | null = null;

  _handleMyResponse(res: any) {
    this._handleResponse(res);
    store.dispatch(setAgreements(res));
  }

  query(field: string, order: string, searchString: string, agreementTypes: string[],
    agreementStatuses: string[], selectedPartnerNames: string[], startDate: string,
    endDate: string, cpStructures: string[], isSpecialConditionsPca: string,
    pageNumber: number, pageSize: number, showQueryLoading: boolean) {
    // If an active query transaction exists, abort it and start
    // a new one
    if (this.currentQuery) {
      this.currentQuery.abort();
    }

    const self = this;

    if (showQueryLoading) {
      fireEvent(this, 'global-loading', {
        message: 'Loading...',
        active: true,
        loadingSource: 'ag-list'
      });
    }
    const agreementsDexieTable = window.EtoolsPmpApp.DexieDb.agreements;
    window.EtoolsPmpApp.DexieDb.transaction('r', agreementsDexieTable, function() {
      self.currentQuery = Dexie.currentTransaction;

      let queryResult = agreementsDexieTable;
      if (field) {
        // note: null values don't appear in result set of sort
        queryResult = queryResult.orderBy(field);
      }
      if (order === 'desc') {
        queryResult = queryResult.reverse();
      }

      queryResult = queryResult.filter(function(agreement: MinimalAgreement) {
        if (selectedPartnerNames &&
            selectedPartnerNames.length &&
            !selectedPartnerNames.includes(agreement.partner_name!)) {
          return false;
        }

        if (!isEmptyObject(agreementTypes) && agreementTypes.indexOf(agreement.agreement_type!) === -1) {
          return false;
        }

        if (!isEmptyObject(agreementStatuses) && agreementStatuses.indexOf(agreement.status!) === -1) {
          return false;
        }

        if (startDate && startDate.length &&
            (!agreement.start || !moment.utc(agreement.start).isAfter(moment.utc(startDate)))) {
          return false;
        }

        if (endDate && endDate.length &&
            (!agreement.end || !moment.utc(agreement.end).isBefore(moment.utc(endDate)))) {
          return false;
        }

        if (!isEmptyObject(cpStructures) && cpStructures.indexOf(agreement.country_programme!) === -1) {
          return false;
        }

        if ([null, undefined, ''].indexOf(isSpecialConditionsPca) < 0) {
          if (agreement.special_conditions_pca !== (isSpecialConditionsPca === 'true')) {
            return false;
          }
        }

        if (searchString && searchString.length &&
            agreement.agreement_number!.toLowerCase().indexOf(searchString) < 0 &&
            agreement.partner_name!.toLowerCase().indexOf(searchString) < 0) {
          return false;
        }

        return true;
      });

      // This special Dexie function allows the work of counting
      // the number of query results to be done in a parallel process,
      // instead of blocking the main query
      // @ts-ignore
      Dexie.ignoreTransaction(function() {
        queryResult.count(function(count: number) {
          // @ts-ignore
          self._setTotalResults(count);
        });
      });

      return queryResult
        .offset((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .toArray();
    }).then(function(result: any) {
      // @ts-ignore
      self._setFilteredAgreements(result);
      fireEvent(self, 'global-loading', {active: false, loadingSource: 'ag-list'});
    }).catch(function(error: any) {
      logError('Error querying agreements: ', 'agreements-list-data', error);
      fireEvent(self, 'global-loading', {active: false, loadingSource: 'ag-list'});
    });
  }
}

window.customElements.define('agreements-list-data', AgreementsListData);

export {AgreementsListData};
