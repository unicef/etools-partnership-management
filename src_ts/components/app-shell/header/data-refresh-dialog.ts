import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@polymer/iron-label/iron-label.js';
import {SharedStyles} from '../../styles/shared-styles';
import {gridLayoutStyles} from '../../styles/grid-layout-styles';
import {logWarn} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import EtoolsPageRefreshMixin from '@unicef-polymer/etools-behaviors/etools-page-refresh-mixin';
import {store} from '../../../store';
import {RESET_UPLOADS_IN_PROGRESS, RESET_UNSAVED_UPLOADS} from '../../../actions/upload-status';
import {fireEvent} from '../../utils/fire-custom-event';
import {property} from '@polymer/decorators';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EtoolsPageRefreshMixin
 */
class DataRefreshDialog extends EtoolsPageRefreshMixin(PolymerElement) {
  static get is() {
    return 'data-refresh-dialog';
  }

  static get template() {
    return html`
      ${SharedStyles} ${gridLayoutStyles}
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
        disable-confirm-btn="[[!anySelected]]"
        on-close="_handleDialogClosed"
      >
        <div id="content-box">
          <div class="title-indent">Select the data you want to refresh:</div>
          <div class="row-h row-indent">
            <div class="col col-6">
              <paper-checkbox checked="{{partnersSelected}}">
                Partners/Government
              </paper-checkbox>
            </div>
            <div class="col col-6">
              <paper-checkbox checked="{{interventionsSelected}}">
                PD/SSFA
              </paper-checkbox>
            </div>
          </div>
          <div class="row-h row-indent">
            <div class="col col-6">
              <paper-checkbox checked="{{agreementsSelected}}">
                Agreements
              </paper-checkbox>
            </div>
            <div class="col col-6">
              <paper-checkbox checked="{{allSelected}}">
                All
              </paper-checkbox>
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

  @property({type: String, notify: true})
  page!: string;

  static get observers() {
    return [
      '_singleSectionChanged(interventionsSelected, partnersSelected, agreementsSelected)',
      '_allSelectedChanged(allSelected)'
    ];
  }

  open() {
    if (!(this.$.refreshDialog as EtoolsDialog).opened) {
      (this.$.refreshDialog as EtoolsDialog).opened = true;
    }
  }

  _allSelectedChanged() {
    if (!this.allSelected) {
      return;
    }

    this.set('interventionsSelected', true);
    this.set('partnersSelected', true);
    this.set('agreementsSelected', true);
    this.set('anySelected', true);
  }

  _singleSectionChanged() {
    const allSelected = this.interventionsSelected && this.partnersSelected && this.agreementsSelected;
    const anySelected = this.interventionsSelected || this.partnersSelected || this.agreementsSelected;

    this.set('allSelected', allSelected);
    this.set('anySelected', anySelected);
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

    const afterDataRefreshLandingPage: string = this._getAfterRefreshLandingPage();
    const restampLandingPage: boolean =
      this.page === afterDataRefreshLandingPage ||
      (this.page === 'government-partners' && afterDataRefreshLandingPage === 'partners');

    if (this.allSelected) {
      fireEvent(this, 'update-main-path', {
        path: afterDataRefreshLandingPage
      });
      this.refresh();
      return;
    }

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
        }
        if (this.agreementsSelected) {
          window.EtoolsPmpApp.DexieDb.agreements.clear();
          window.EtoolsPmpApp.DexieDb.listsExpireMapTable.delete('agreements');
        }
        if (this.interventionsSelected) {
          window.EtoolsPmpApp.DexieDb.interventions.clear();
          window.EtoolsPmpApp.DexieDb.listsExpireMapTable.delete('interventions');
        }
      }
    )
      .then(() => {
        // transaction succeeded
        this._handleSuccess(afterDataRefreshLandingPage, restampLandingPage);
      })
      .catch((error: any) => {
        // transaction failed
        logWarn('Dexie data clearing failed.', 'data-refresh-dialog', error);
        this._handleFailure(afterDataRefreshLandingPage, restampLandingPage);
      });
  }

  _handleSuccess(afterDataRefreshLandingPage: string, restampLandingPage: boolean) {
    this._triggerMainRoutePathUpdate(afterDataRefreshLandingPage, restampLandingPage);
    fireEvent(this, 'toast', {
      text: 'Data successfully refreshed',
      showCloseBtn: true
    });
  }

  _handleFailure(afterDataRefreshLandingPage: string, restampLandingPage: boolean) {
    this._triggerMainRoutePathUpdate(afterDataRefreshLandingPage, restampLandingPage);
    fireEvent(this, 'toast', {
      text: 'There was an error while refreshing the data',
      showCloseBtn: true
    });
  }

  _triggerMainRoutePathUpdate(afterDataRefreshLandingPage: string, restampLandingPage: boolean) {
    const routePath = afterDataRefreshLandingPage + '/list';
    if (restampLandingPage) {
      this.set('page', null);
      setTimeout(() => {
        fireEvent(this, 'global-loading', {active: false});
        this.set('page', afterDataRefreshLandingPage);
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
    this.set('partnersSelected', false);
    this.set('agreementsSelected', false);
    this.set('interventionsSelected', false);
  }
}

window.customElements.define(DataRefreshDialog.is, DataRefreshDialog);

export {DataRefreshDialog};
