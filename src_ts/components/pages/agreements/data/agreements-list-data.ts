import {customElement, LitElement, property} from 'lit-element';
import ListDataMixin from '../../../common/mixins/list-data-mixin-lit';
import {store} from '../../../../redux/store';

declare const dayjs: any;
import Dexie from 'dexie';

import {isEmptyObject} from '../../../utils/utils';
import {setAgreements} from '../../../../redux/actions/agreements';
import {fireEvent} from '../../../utils/fire-custom-event';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {MinimalAgreement, GenericObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin ListDataMixin
 */
@customElement('agreements-list-data')
export class AgreementsListData extends ListDataMixin(LitElement) {
  @property({type: String})
  endpointName = 'agreements';

  @property({type: String})
  dataLoadedEventName = 'agreements-loaded';

  @property({type: Array})
  filteredAgreements: [] = [];

  @property({type: Object})
  currentQuery: GenericObject | null = null;

  _handleMyResponse(res: any) {
    this._handleResponse(res);
    store.dispatch(setAgreements(res));
  }

  query(
    field: string,
    order: string,
    searchString: string,
    agreementTypes: string[],
    agreementStatuses: string[],
    selectedPartnerNames: string[],
    startDate: string,
    endDate: string,
    cpStructures: string[],
    isSpecialConditionsPca: string,
    pageNumber: number,
    pageSize: number,
    showQueryLoading = false
  ) {
    // If an active query transaction exists, abort it and start
    // a new one
    if (this.currentQuery) {
      this.currentQuery.abort();
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    if (showQueryLoading) {
      fireEvent(this, 'global-loading', {
        message: 'Loading...',
        active: true,
        loadingSource: 'ag-list'
      });
    }
    const agreementsDexieTable = window.EtoolsPmpApp.DexieDb.agreements;
    window.EtoolsPmpApp.DexieDb.transaction('r', agreementsDexieTable, function () {
      self.currentQuery = Dexie.currentTransaction;

      let queryResult = agreementsDexieTable;
      if (field) {
        // note: null values don't appear in result set of sort
        queryResult = queryResult.orderBy(field);
      }
      if (order === 'desc') {
        queryResult = queryResult.reverse();
      }

      queryResult = queryResult.filter(function (agreement: MinimalAgreement) {
        if (
          selectedPartnerNames &&
          selectedPartnerNames.length &&
          !selectedPartnerNames.includes(agreement.partner_name!)
        ) {
          return false;
        }

        if (!isEmptyObject(agreementTypes) && agreementTypes.indexOf(agreement.agreement_type!) === -1) {
          return false;
        }

        if (!isEmptyObject(agreementStatuses) && agreementStatuses.indexOf(agreement.status!) === -1) {
          return false;
        }

        if (
          startDate &&
          startDate.length &&
          (!agreement.start || !dayjs.utc(agreement.start).isAfter(dayjs.utc(startDate)))
        ) {
          return false;
        }

        if (endDate && endDate.length && (!agreement.end || !dayjs.utc(agreement.end).isBefore(dayjs.utc(endDate)))) {
          return false;
        }

        if (
          !isEmptyObject(cpStructures) &&
          cpStructures.indexOf(agreement.country_programme as unknown as string) === -1
        ) {
          return false;
        }

        if ([null, undefined, ''].indexOf(isSpecialConditionsPca) < 0) {
          if (agreement.special_conditions_pca !== (isSpecialConditionsPca === 'true')) {
            return false;
          }
        }

        if (
          searchString &&
          searchString.length &&
          agreement.agreement_number!.toLowerCase().indexOf(searchString) < 0 &&
          agreement.partner_name!.toLowerCase().indexOf(searchString) < 0
        ) {
          return false;
        }

        return true;
      });

      // This special Dexie function allows the work of counting
      // the number of query results to be done in a parallel process,
      // instead of blocking the main query
      Dexie.ignoreTransaction(function () {
        queryResult.count(function (count: number) {
          fireEvent(self, 'total-results-changed', count);
        });
      });

      return queryResult
        .offset((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .toArray();
    })
      .then(function (result: any) {
        fireEvent(self, 'filtered-agreements-changed', result);
        fireEvent(self, 'global-loading', {
          active: false,
          loadingSource: 'ag-list'
        });
      })
      .catch(function (error: any) {
        logError('Error querying agreements: ', 'agreements-list-data', error);
        fireEvent(self, 'global-loading', {
          active: false,
          loadingSource: 'ag-list'
        });
      });
  }
}
