import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
import {store} from '../../../../store.js';

import ListDataMixin from '../../../mixins/list-data-mixin';

import Dexie from 'dexie';
import {isEmptyObject} from "../../../utils/utils";
import {setPartners} from '../../../../actions/partners.js';
import { fireEvent } from '../../../utils/fire-custom-event.js';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin ListDataMixin
 */
const PartnersListDataRequiredMixins = EtoolsMixinFactory.combineMixins([
  EtoolsLogsMixin,
  ListDataMixin
], PolymerElement);

/**
 * @polymer
 * @customElement
 * @appliesMixin PartnersListDataRequiredMixins
 */
class PartnersListData extends (PartnersListDataRequiredMixins as any) {
  static get properties() {
    return {
      endpointName: String,
      dataLoadedEventName: String,
      filteredPartners: {
        type: Array,
        readOnly: true,
        notify: true
      },
      totalResults: {
        type: Number,
        readOnly: true,
        notify: true
      },
      currentQuery: {
        type: Object,
        value: null
      },
      partnersDropdownData: {
        type: Array,
        notify: true
      },
      partnersFilteredDropdownData: {
        type: Array,
        notify: true
      },
      prepareDropdownData: Boolean
    };
  }

  public endpointName: string = 'partners';
  public dataLoadedEventName: string = 'partners-loaded';
  public prepareDropdownData: boolean = false;

  public _handleMyResponse(res: any) {
    this._handleResponse(res);
    if (res && res.length) {
      store.dispatch(setPartners(res));
      // let preparedData = [];
      // let civilSocietyOrganizationPartners = [];
      // res.forEach(function(p) {
      //   if (!p.hidden && p.partner_type === 'Civil Society Organization') {
      //     civilSocietyOrganizationPartners.push(p);
      //   }
      //   if (!p.hidden) {
      //     preparedData.push({
      //       value: p.id,
      //       label: p.name
      //     });
      //   }
      // });

      // TODO - replaced by selector - to test
      // store.dispatch('setPartnersDropdown', preparedData);
      // store.dispatch('setCivilSocietyOrganizationPartners', civilSocietyOrganizationPartners);
    }
  }

  public query(field: string, order: string, searchString: string, partnerTypes: string[], csoTypes: string[],
               riskRatings: string[], pageNumber: number, pageSize: number, showHidden: boolean,
               showQueryLoading: boolean) {

    // If an active query transaction exists, abort it and start
    // a new one
    if (this.currentQuery) {
      this.currentQuery.abort();
    }

    let self = this;

    if (showQueryLoading) {
      fireEvent(this, 'global-loading', {
        message: 'Loading...',
        active: true,
        loadingSource: 'partners-list'
      });
    }

    let partnersDexieTable = window.EtoolsPmpApp.DexieDb.partners;
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

        if (searchString && searchString.length) {
          let vnMatch = true;
          if (partner.vendor_number) {
            vnMatch = partner.vendor_number.toString().toLowerCase().indexOf(searchString) < 0;
          }
          if (partner.name.toLowerCase().indexOf(searchString) < 0 &&
              partner.short_name.toLowerCase().indexOf(searchString) < 0 &&
              vnMatch) {
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
      // @ts-ignore
      Dexie.ignoreTransaction(function () {
        queryResult.count(function (count: number) {
          self._setTotalResults(count);
        });
      });

      return queryResult
          .offset((pageNumber - 1) * pageSize)
          .limit(pageSize)
          .toArray();

    }).then(function (result: any[]) {
      self._setFilteredPartners(result);
      fireEvent(self, 'global-loading', {
        active: false,
        loadingSource: 'partners-list'
      });
    }).catch(function (error: any) {
      self.logError('Error querying partners!', 'partners-list-data', error, true);
      fireEvent(self, 'global-loading', {
        active: false,
        loadingSource: 'partners-list'
      });
    });
  }
}

window.customElements.define('partners-list-data', PartnersListData);
