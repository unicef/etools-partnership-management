import {customElement} from 'lit-element';
import {store, RootState} from '../../../../../redux/store';

import {fireEvent} from '../../../../utils/fire-custom-event';
import {CommonDataState} from '../../../../../redux/reducers/common-data';
import {PartnersListBase} from './partners-list-base';
import {connect} from 'pwa-helpers/connect-mixin';
import {getPartnerFilters} from './partners-filters';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EtoolsCurrency
 * @appliesMixin EndpointsMixin
 * @appliesMixin ListFiltersMixins
 * @appliesMixin CommonMixin
 * @appliesMixin ListsCommonMixin
 * @appliesMixin PaginationMixin
 */
@customElement('partners-list')
export class PartnersList extends connect(store)(PartnersListBase) {
  connectedCallback() {
    /**
     * Disable loading message for main list elements load,
     * triggered by parent element on stamp
     */
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'partners-page'
    });
    super.connectedCallback();
  }

  stateChanged(state: RootState): void {
    if (state.app?.routeDetails?.routeName !== 'partners') {
      return;
    }
    this.baseStateChanged(state);
  }

  initFiltersForDisplay(commonData: CommonDataState) {
    const availableFilters = JSON.parse(JSON.stringify(getPartnerFilters()));
    this.populateDropdownFilterOptionsFromCommonData(commonData, availableFilters);
    this.allFilters = availableFilters;
  }

  getSelectedPartnerTypes(selectedPartnerTypes: any) {
    // return this.showOnlyGovernmentType
    //   ? this._governmentLockedPartnerTypes
    return this.getFilterUrlValuesAsArray(selectedPartnerTypes);
  }
}
