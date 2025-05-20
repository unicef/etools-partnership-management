import {html, LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-checkbox/etools-checkbox';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {store} from '../../../redux/store';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import EtoolsDialog from '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import pmpEdpoints from '../../endpoints/endpoints';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {setPartners} from '../../../redux/actions/partners';
import {setShouldReGetList} from '../../pages/interventions/pages/intervention-tab-pages/common/actions/interventions';
import {setAgreements} from '../../../redux/actions/agreements';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {DexieRefresh} from '@unicef-polymer/etools-utils/dist/singleton/dexie-refresh';

/**
 * @LitElement
 * @customElement
 * @mixinFunction
 * @appliesMixin EtoolsPageRefreshMixin
 */
class DataRefreshDialog extends EndpointsLitMixin(LitElement) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        [hidden] {
          display: none !important;
        }
        .col-12 {
          padding-left: 40px !important;
        }
        .title-indent {
          padding: 0 24px 18px 24px;
          font-size: var(--etools-font-size-16, 16px);
        }
      </style>
      <etools-dialog
        id="refreshDialog"
        size="sm"
        no-padding
        ok-btn-text="${translate('REFRESH_DATA')}"
        cancel-btn-text="${translate('GENERAL.CANCEL')}"
        dialog-title="${translate('REFRESH_DATA')}"
        .disableConfirmBtn="${!this.anySelected}"
        @close="${this._handleDialogClosed}"
      >
        <div class="container-dialog">
          <div class="title-indent">${translate('SELECT_DATA_TO_REFRESH')}</div>
          <div class="row row-indent">
            <div class="col-12">
              <etools-checkbox
                ?checked="${this.partnersSelected}"
                @sl-change="${(e: any) => {
                  this.partnersSelected = e.target.checked;
                  this._singleSectionChanged();
                }}"
                >${translate('PARTNERS_GOVERNMENT')}</etools-checkbox
              >
            </div>
            <div class="col-12">
              <etools-checkbox
                ?checked="${this.agreementsSelected}"
                @sl-change="${(e: any) => {
                  this.agreementsSelected = e.target.checked;
                  this._singleSectionChanged();
                }}"
                >${translate('AGREEMENTS')}</etools-checkbox
              >
            </div>
            <div class="col-12">
              <etools-checkbox
                ?checked="${this.allSelected}"
                @sl-change="${(e: any) => {
                  this.allSelected = e.target.checked;
                  this._allSelectedChanged();
                }}"
                >${translate('ALL')}
              </etools-checkbox>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Boolean})
  partnersSelected = false;

  @property({type: Boolean})
  agreementsSelected = false;

  @property({type: Boolean})
  allSelected = false;

  @property({type: Boolean})
  anySelected = false;

  @property({type: String})
  page!: string | null;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('close', () => {
      (this.shadowRoot!.querySelector('#refreshDialog') as EtoolsDialog).opened = false;
    });
  }
  open() {
    if (!(this.shadowRoot!.querySelector('#refreshDialog') as EtoolsDialog).opened) {
      (this.shadowRoot!.querySelector('#refreshDialog') as EtoolsDialog).opened = true;
    }
  }

  _allSelectedChanged() {
    if (!this.allSelected) {
      return;
    }

    this.partnersSelected = true;
    this.agreementsSelected = true;
    this.anySelected = true;
  }

  _singleSectionChanged() {
    const allSelected = this.partnersSelected && this.agreementsSelected;
    const anySelected = this.partnersSelected || this.agreementsSelected;

    this.allSelected = allSelected;
    this.anySelected = anySelected;
  }

  _handleDialogClosed(closingReason: CustomEvent) {
    if (!closingReason.detail.confirmed) {
      return;
    }

    fireEvent(this, 'upload-status-reset');

    fireEvent(this, 'global-loading', {
      message: getTranslation('REFRESHING_DATA'),
      active: true
    });

    const afterDataRefreshLandingPage: string | null = this._getAfterRefreshLandingPage();
    const restampLandingPage: boolean =
      this.page === afterDataRefreshLandingPage ||
      (this.page === 'government-partners' && afterDataRefreshLandingPage === 'partners');

    if (this.allSelected) {
      fireEvent(this, 'update-main-path', {
        path: afterDataRefreshLandingPage + '/list'
      });
      DexieRefresh.refresh();
      return;
    }

    const endpointNames: string[] = [];
    // clear only data sets
    window.EtoolsPmpApp.DexieDb.transaction('rw', 'listsExpireMapTable', 'partners', 'agreements', () => {
      if (this.partnersSelected) {
        window.EtoolsPmpApp.DexieDb.partners.clear();
        window.EtoolsPmpApp.DexieDb.listsExpireMapTable.delete('partners');
        endpointNames.push('partners');
      }
      if (this.agreementsSelected) {
        window.EtoolsPmpApp.DexieDb.agreements.clear();
        window.EtoolsPmpApp.DexieDb.listsExpireMapTable.delete('agreements');
        endpointNames.push('agreements');
      }
      if (window.EtoolsPmpApp.DexieDb.interventions) {
        window.EtoolsPmpApp.DexieDb.interventions.clear();
        window.EtoolsPmpApp.DexieDb.listsExpireMapTable.delete('interventions');
      }
    })
      .then(() => {
        // transaction succeeded
        this.reloadData(endpointNames).then(() => {
          this._handleSuccess(afterDataRefreshLandingPage, restampLandingPage);
        });
      })
      .catch((error: any) => {
        // transaction failed
        EtoolsLogger.warn('Dexie data clearing failed.', 'data-refresh-dialog', error);
        this._handleFailure(afterDataRefreshLandingPage, restampLandingPage);
      });
  }

  reloadData(endpointNames: string[]) {
    const promisses = endpointNames.map((endpointName: string) => {
      return sendRequest({endpoint: this.getEndpoint(pmpEdpoints, endpointName)}).then((response) => {
        this.afterDataLoaded(endpointName, response);
      });
    });
    return Promise.allSettled(promisses);
  }

  afterDataLoaded(endpointName: string, response: []) {
    switch (endpointName) {
      case 'partners':
        store.dispatch(setPartners(response));
        break;
      case 'agreements':
        store.dispatch(setAgreements(response));
        break;
      case 'interventions':
        store.dispatch(setShouldReGetList(true));
        break;
      case 'gpd-interventions':
        store.dispatch(setShouldReGetList(true));
        break;
      default:
        break;
    }
  }

  _handleSuccess(afterDataRefreshLandingPage: string | null, restampLandingPage: boolean) {
    this._triggerMainRoutePathUpdate(afterDataRefreshLandingPage, restampLandingPage);
    fireEvent(this, 'toast', {
      text: getTranslation('DATA_SUCCESSFULLY_REFRESHED')
    });
  }

  _handleFailure(afterDataRefreshLandingPage: string | null, restampLandingPage: boolean) {
    this._triggerMainRoutePathUpdate(afterDataRefreshLandingPage, restampLandingPage);
    fireEvent(this, 'toast', {
      text: getTranslation('ERROR_REFRESH_DATA')
    });
  }

  _triggerMainRoutePathUpdate(afterDataRefreshLandingPage: string | null, restampLandingPage: boolean) {
    const routePath = afterDataRefreshLandingPage + '/list';
    if (restampLandingPage) {
      this.page = null;
      setTimeout(() => {
        fireEvent(this, 'global-loading', {active: false});
        this.page = afterDataRefreshLandingPage;
        fireEvent(this, 'update-main-path', {path: routePath});
      }, 10);
    } else {
      fireEvent(this, 'global-loading', {active: false});
      fireEvent(this, 'update-main-path', {path: routePath});
    }
    this._resetRefreshSelection();
  }

  _getAfterRefreshLandingPage() {
    if (this.allSelected) {
      return this.page;
    }
    if (this.partnersSelected) {
      return this.page === 'government-partners' ? 'government-partners' : 'partners';
    }
    if (this.agreementsSelected) {
      return 'agreements';
    }
    return this.page;
  }

  _resetRefreshSelection() {
    this.partnersSelected = false;
    this.agreementsSelected = false;
  }
}

window.customElements.define('data-refresh-dialog', DataRefreshDialog);

export {DataRefreshDialog};
