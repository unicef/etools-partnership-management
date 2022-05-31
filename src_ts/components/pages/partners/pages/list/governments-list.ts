import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {customElement} from 'lit-element';
import {connect} from 'pwa-helpers/connect-mixin';
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
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'partners-page'
    });

    super.connectedCallback();
  }
  stateChanged(state: RootState): void {
    if (state.app?.routeDetails?.routeName !== 'government-partners') {
      return;
    }

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
