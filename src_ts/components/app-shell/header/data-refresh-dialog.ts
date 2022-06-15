import {html, LitElement, property} from 'lit-element';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@polymer/iron-label/iron-label.js';
import {logWarn} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import EtoolsPageRefreshMixinLit from '@unicef-polymer/etools-behaviors/etools-page-refresh-mixin-lit';
import {store} from '../../../redux/store';
import {RESET_UPLOADS_IN_PROGRESS, RESET_UNSAVED_UPLOADS} from '../../../redux/actions/upload-status';
import {fireEvent} from '../../utils/fire-custom-event';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import pmpEdpoints from '../../endpoints/endpoints';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {setPartners} from '../../../redux/actions/partners';
import {setShouldReGetList} from '../../pages/interventions/pages/intervention-tab-pages/common/actions/interventions';
import {setAgreements} from '../../../redux/actions/agreements';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EtoolsPageRefreshMixin
 */
class DataRefreshDialog extends EndpointsLitMixin(EtoolsPageRefreshMixinLit(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        [hidden] {
          display: none !important;
        }

        #content-box {
          max-height: 600px;
          min-height: 160px;
          overflow-y: auto;
          height: 100%;
        }
        .row-indent {
          padding-left: 40px;
        }
        .title-indent {
          padding: 0 24px;
          font-size: 16px;
        }
        paper-checkbox {
          --paper-checkbox-label: {
            font-size: 16px;
          }
        }
      </style>
      <etools-dialog
        id="refreshDialog"
        size="sm"
        no-padding
        ok-btn-text="Refresh data"
        cancel-btn-text="Cancel"
        dialog-title="Refresh data"
        ?disableConfirmBtn="${!this.anySelected}"
        @close="${this._handleDialogClosed}"
      >
        <div id="content-box">
          <div class="title-indent">Select the data you want to refresh:</div>
          <div class="row-h row-indent">
            <div class="col col-6">
              <paper-checkbox
                ?checked="${this.partnersSelected}"
                @checked-changed="${(e: CustomEvent) => {
                  this.partnersSelected = e.detail.value;
                  this._singleSectionChanged();
                }}"
                >Partners/Government</paper-checkbox
              >
            </div>
            <div class="col col-6">
              <paper-checkbox
                ?checked="${this.interventionsSelected}"
                @checked-changed="${(e: CustomEvent) => {
                  this.interventionsSelected = e.detail.value;
                  this._singleSectionChanged();
                }}"
                >PD/SPD</paper-checkbox
              >
            </div>
          </div>
          <div class="row-h row-indent">
            <div class="col col-6">
              <paper-checkbox
                ?checked="${this.agreementsSelected}"
                @checked-changed="${(e: CustomEvent) => {
                  this.agreementsSelected = e.detail.value;
                  this._singleSectionChanged();
                }}"
                >Agreements</paper-checkbox
              >
            </div>
            <div class="col col-6">
              <paper-checkbox
                ?checked="${this.allSelected}"
                @checked-changed="${(e: CustomEvent) => {
                  this.allSelected = e.detail.value;
                  this._allSelectedChanged();
                }}"
                >All</paper-checkbox
              >
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Boolean})
  interventionsSelected = false;

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

  open() {
    if (!(this.shadowRoot!.querySelector('#refreshDialog') as EtoolsDialog).opened) {
      (this.shadowRoot!.querySelector('#refreshDialog') as EtoolsDialog).opened = true;
    }
  }

  _allSelectedChanged() {
    if (!this.allSelected) {
      return;
    }

    this.interventionsSelected = true;
    this.partnersSelected = true;
    this.agreementsSelected = true;
    this.anySelected = true;
  }

  _singleSectionChanged() {
    const allSelected = this.interventionsSelected && this.partnersSelected && this.agreementsSelected;
    const anySelected = this.interventionsSelected || this.partnersSelected || this.agreementsSelected;

    this.allSelected = allSelected;
    this.anySelected = anySelected;
  }

  _handleDialogClosed(closingReason: CustomEvent) {
    if (!closingReason.detail.confirmed) {
      return;
    }

    store.dispatch({type: RESET_UPLOADS_IN_PROGRESS});
    store.dispatch({type: RESET_UNSAVED_UPLOADS});

    fireEvent(this, 'global-loading', {
      message: 'Refreshing data...',
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
      this.refresh();
      return;
    }

    const endpointNames: string[] = [];
    // clear only data sets
    window.EtoolsPmpApp.DexieDb.transaction(
      'rw',
      'listsExpireMapTable',
      'partners',
      'agreements',
      'interventions',
      () => {
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
        if (this.interventionsSelected) {
          window.EtoolsPmpApp.DexieDb.interventions.clear();
          window.EtoolsPmpApp.DexieDb.listsExpireMapTable.delete('interventions');
          endpointNames.push('interventions');
        }
      }
    )
      .then(() => {
        // transaction succeeded
        this.reloadData(endpointNames).then(() => {
          this._handleSuccess(afterDataRefreshLandingPage, restampLandingPage);
        });
      })
      .catch((error: any) => {
        // transaction failed
        logWarn('Dexie data clearing failed.', 'data-refresh-dialog', error);
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
      default:
        break;
    }
  }

  _handleSuccess(afterDataRefreshLandingPage: string | null, restampLandingPage: boolean) {
    this._triggerMainRoutePathUpdate(afterDataRefreshLandingPage, restampLandingPage);
    fireEvent(this, 'toast', {
      text: 'Data successfully refreshed',
      showCloseBtn: true
    });
  }

  _handleFailure(afterDataRefreshLandingPage: string | null, restampLandingPage: boolean) {
    this._triggerMainRoutePathUpdate(afterDataRefreshLandingPage, restampLandingPage);
    fireEvent(this, 'toast', {
      text: 'There was an error while refreshing the data',
      showCloseBtn: true
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
    if (this.interventionsSelected) {
      return 'interventions';
    }
    return this.page;
  }

  _resetRefreshSelection() {
    this.partnersSelected = false;
    this.agreementsSelected = false;
    this.interventionsSelected = false;
  }
}

window.customElements.define('data-refresh-dialog', DataRefreshDialog);

export {DataRefreshDialog};
