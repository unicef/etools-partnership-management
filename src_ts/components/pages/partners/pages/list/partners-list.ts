import {customElement} from 'lit-element';
import {store, RootState} from '../../../../../redux/store';

import {fireEvent} from '../../../../utils/fire-custom-event';
import {PartnersListBase} from './partners-list-base';
import {connect} from 'pwa-helpers/connect-mixin';
import {getPartnerFilters, PartnersFiltersHelper} from './partners-filters';

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

  getSelectedPartnerTypes(selectedPartnerTypes: any) {
    return this.getFilterUrlValuesAsArray(selectedPartnerTypes);
  }

  getAllFilters() {
    return JSON.parse(JSON.stringify(getPartnerFilters()));
  }

  getFiltersHelper() {
    return PartnersFiltersHelper;
  }
}
