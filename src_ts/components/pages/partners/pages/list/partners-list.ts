import {customElement} from 'lit/decorators.js';
import {store, RootState} from '../../../../../redux/store';

import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {PartnersListBase} from './partners-list-base';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {getPartnerFilters, PartnersFiltersHelper} from './partners-filters';

/**
 * @LitElement
 * @customElement
 * @mixinFunction
 * @appliesMixin EtoolsCurrency
 * @appliesMixin EndpointsMixin
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
    super.connectedCallback();
  }

  stateChanged(state: RootState): void {
    if (state.app?.routeDetails?.routeName !== 'partners') {
      return;
    }
    if(state.partners?.listIsLoaded) {
        setTimeout(() => {
          fireEvent(this, 'global-loading', {
            active: false,
            loadingSource: 'partners-page'
          });
        }, 50);      
    }
    this.currentModule = 'partners';
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
