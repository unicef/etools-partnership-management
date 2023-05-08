declare const dayjs: any;
import Dexie from 'dexie';
import {store} from '../../../../redux/store';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {setPartners} from '../../../../redux/actions/partners';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {GenericObject} from '@unicef-polymer/etools-types';
import {customElement, LitElement, property} from 'lit-element';
import ListDataMixinLit from '../../../common/mixins/list-data-mixin-lit';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin ListDataMixin
 */

@customElement('partners-list-data')
export class PartnersListData extends ListDataMixinLit(LitElement) {
  @property({type: String})
  endpointName = 'partners';

  @property({type: String})
  dataLoadedEventName = 'partners-loaded';

  @property({type: Array})
  filteredPartners!: any[];

  @property({type: Object})
  currentQuery: GenericObject | null = null;

  // @property({type: Boolean})
  // prepareDropdownData = false;

  public _handleMyResponse(res: any) {
    this._handleResponse(res);
    store.dispatch(setPartners(res));
  }

  public async query(
    field: string,
    order: string,
    searchString: string,
    partnerTypes: string[],
    csoTypes: string[],
    riskRatings: string[],
    seaRiskRatings: string[],
    seaDateBefore: string,
    seaDateAfter: string,
    pageNumber: number,
    pageSize: number,
    showHidden: boolean,
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
      fireEvent(self, 'list-loading', {
        active: true
      });
    }

    // WARN: Fix for .orderBy excluding items with null values in 'field' property
    if (field) {
      await window.EtoolsPmpApp.DexieDb.partners
        .filter(function (i: any) {
          return i[field] == null;
        })
        .modify({[field]: ''});
    }

    const partnersDexieTable = window.EtoolsPmpApp.DexieDb.partners;
    window.EtoolsPmpApp.DexieDb.transaction('r', partnersDexieTable, function () {
      self.currentQuery = Dexie.currentTransaction;

      let queryResult = partnersDexieTable;
      if (field) {
        // note: null values don't appear in result set of sort
        queryResult = queryResult.orderBy(field);
      }
      if (order === 'desc') {
        queryResult = queryResult.reverse();
      }

      queryResult = queryResult.filter(function (partner: any) {
        if (!isEmptyObject(partnerTypes) && partnerTypes.indexOf(partner.partner_type) === -1) {
          return false;
        }

        if (!isEmptyObject(csoTypes) && csoTypes.indexOf(partner.cso_type) === -1) {
          return false;
        }

        if (!isEmptyObject(riskRatings) && riskRatings.indexOf(partner.rating) === -1) {
          return false;
        }

        if (!isEmptyObject(seaRiskRatings) && seaRiskRatings.indexOf(partner.sea_risk_rating_name) === -1) {
          return false;
        }

        if (
          seaDateBefore &&
          seaDateBefore.length &&
          (!partner.psea_assessment_date || !dayjs.utc(partner.psea_assessment_date).isBefore(dayjs.utc(seaDateBefore)))
        ) {
          return false;
        }

        if (
          seaDateAfter &&
          seaDateAfter.length &&
          (!partner.psea_assessment_date || !dayjs.utc(partner.psea_assessment_date).isAfter(dayjs.utc(seaDateAfter)))
        ) {
          return false;
        }

        if (searchString && searchString.length) {
          let vnMatch = true;
          if (partner.vendor_number) {
            vnMatch = partner.vendor_number.toString().toLowerCase().indexOf(searchString) < 0;
          }
          if (
            partner.name.toLowerCase().indexOf(searchString) < 0 &&
            partner.short_name.toLowerCase().indexOf(searchString) < 0 &&
            vnMatch
          ) {
            return false;
          }
        }

        if (!showHidden && partner.hidden) {
          return false;
        }

        return true;
      });

      // This special Dexie function allows the work of counting
      // the number of query results to be done in a parallel process,
      // instead of blocking the main query
      Dexie.ignoreTransaction(function () {
        queryResult.count(function (count: number) {
          // @ts-ignore
          fireEvent(self, 'total-results-changed', count);
        });
      });

      return queryResult
        .offset((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .toArray();
    })
      .then(function (result: any[]) {
        // @ts-ignore
        fireEvent(self, 'filtered-partners-changed', result);
        fireEvent(self, 'list-loading', {
          active: false
        });
      })
      .catch(function (error: any) {
        if (error.name === 'DatabaseClosedError') {
          window.location.reload();
        }
        EtoolsLogger.error('Error querying partners!', 'partners-list-data', error);
        fireEvent(self, 'list-loading', {
          active: false
        });
      });
  }
}
