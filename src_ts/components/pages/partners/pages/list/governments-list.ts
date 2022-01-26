import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {customElement} from 'lit-element';
import {connect} from 'pwa-helpers/connect-mixin';
import {CommonDataState} from '../../../../../redux/reducers/common-data';
import {RootState, store} from '../../../../../redux/store';
import {getGovernmentFilters} from './governments-filters';
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

  initFiltersForDisplay(commonData: CommonDataState) {
    const availableFilters = [...getGovernmentFilters()];
    this.populateDropdownFilterOptionsFromCommonData(commonData, availableFilters);
    this.allFilters = availableFilters;
  }

  getSelectedPartnerTypes() {
    return ['Government'];
  }
}
