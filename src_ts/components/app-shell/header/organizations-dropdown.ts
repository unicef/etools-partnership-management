import {connect} from 'pwa-helpers/connect-mixin.js';
import {store, RootState} from '../../../redux/store';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import {customElement, LitElement, html, property, query} from 'lit-element';

import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsUser} from '@unicef-polymer/etools-types';
import EtoolsPageRefreshMixinLit from '@unicef-polymer/etools-behaviors/etools-page-refresh-mixin-lit.js';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {get as getTranslation, translate} from 'lit-translate';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import pmpEdpoints from '../../endpoints/endpoints.js';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {headerDropdownStyles} from './header-dropdown-styles';
import {ROOT_PATH} from '@unicef-polymer/etools-modules-common/dist/config/config.js';

/**
 * @LitElement
 * @customElement
 */
@customElement('organizations-dropdown')
export class organizationsDropdown extends connect(store)(EtoolsPageRefreshMixinLit(EndpointsLitMixin(LitElement))) {
  public render() {
    return html`
      ${headerDropdownStyles}
      <etools-dropdown
        transparent
        ?hidden=${isEmptyObject(this.organizations)}
        id="organizationSelector"
        placeholder="${translate('SELECT_ORGANIZATION')}"
        class="w100 ${this.checkMustSelectOrganization(this.user)}"
        .selected="${this.currentOrganizationId}"
        allow-outside-scroll
        no-label-float
        .options="${this.organizations}"
        option-label="name"
        option-value="id"
        trigger-value-change-event
        @etools-selected-item-changed="${this.onOrganizationChange}"
        hide-search
      ></etools-dropdown>
    `;
  }

  @property({type: Number})
  currentOrganizationId!: number | null;

  @property({type: Array})
  organizations: any[] = [];

  @property({type: Object})
  user!: any;

  @query('#organizationSelector') private organizationSelectorDropdown!: EtoolsDropdownEl;

  public connectedCallback() {
    super.connectedCallback();
  }

  public stateChanged(state: RootState) {
    if (!state.user || !state.user.data || JSON.stringify(this.user) === JSON.stringify(state.user.data)) {
      return;
    }

    this.user = state.user.data;
    this.organizations = this.user.organizations_available;
    this.currentOrganizationId = this.user.organization?.id || null;
  }

  checkMustSelectOrganization(user: EtoolsUser) {
    if (user && !user.organization) {
      setTimeout(() => {
        fireEvent(this, 'toast', {text: getTranslation('SELECT_ORGANIZATION')});
      }, 2000);
      return 'warning';
    }
    return '';
  }

  protected onOrganizationChange(e: CustomEvent) {
    if (!e.detail.selectedItem) {
      return;
    }

    const selectedOrganizationId = parseInt(e.detail.selectedItem.id, 10);

    if (selectedOrganizationId !== this.currentOrganizationId) {
      // send post request to change_organization endpoint
      this.triggerOrganizationChangeRequest(selectedOrganizationId);
    }
  }

  protected triggerOrganizationChangeRequest(selectedOrganizationId: number) {
    fireEvent(this, 'global-loading', {
      message: 'Please wait while organization data is changing...',
      active: true,
      loadingSource: 'organization-change'
    });

    sendRequest({
      endpoint: pmpEdpoints.changeOrganization,
      method: 'POST',
      body: {organization: selectedOrganizationId}
    })
      .then(() => {
        this._handleResponse();
      })
      .catch((error: any) => {
        this._handleError(error);
      });
  }

  protected _handleResponse() {
    // clear Dexie and storage
    this.refresh();
    this.clearLocalStorage();

    history.pushState(window.history.state, '', `${ROOT_PATH}partners`);
  }

  protected _handleError(error: any) {
    logError('organization change failed!', 'organization-dropdown', error);
    this.organizationSelectorDropdown.selected = this.currentOrganizationId;
    fireEvent(this, 'toast', {text: 'Something went wrong changing your organization. Please try again'});
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'organization-change'
    });
  }
}
