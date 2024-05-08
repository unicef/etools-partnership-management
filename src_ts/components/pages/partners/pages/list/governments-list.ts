import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {customElement} from 'lit/decorators.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {RootState, store} from '../../../../../redux/store';
import {getGovernmentFilters, GovernmentFiltersHelper} from './governments-filters';
import {PartnersListBase} from './partners-list-base';

@customElement('governments-list')
export class GovernmentsList extends connect(store)(PartnersListBase) {
  connectedCallback() {
    /**
     * Disable loading message for main list elements load,
     * triggered by parent element on stamp
     */
    super.connectedCallback();
  }
  stateChanged(state: RootState): void {
    if (state.app?.routeDetails?.routeName !== 'government-partners') {
      return;
    }

    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'partners-page'
    });
    this.currentModule = 'government-partners';
    this.prevQueryStringObj.partner_types = 'Government';
    this.baseStateChanged(state);
  }

  getAllFilters() {
    return JSON.parse(JSON.stringify(getGovernmentFilters()));
  }

  getSelectedPartnerTypes() {
    return ['Government'];
  }

  getFiltersHelper() {
    return GovernmentFiltersHelper;
  }
}
