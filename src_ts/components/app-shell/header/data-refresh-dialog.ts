import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/paper-checkbox/paper-checkbox.js';
import 'etools-dialog/etools-dialog.js';
import '@polymer/iron-label/iron-label.js';
import { SharedStyles } from '../../styles/shared-styles';
import { gridLayoutStyles } from '../../styles/grid-layout-styles';
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import EtoolsPageRefreshMixin from 'etools-behaviors/etools-page-refresh-mixin.js';
import { store } from '../../../store';
import { RESET_UPLOADS_IN_PROGRESS, RESET_UNSAVED_UPLOADS } from '../../../actions/upload-status';
import { fireEvent } from '../../utils/fire-custom-event';


  /**
     * @polymer
     * @mixinFunction
     * @appliesMixin EtoolsLogsMixin
     * @appliesMixin EtoolsPageRefreshMixin
    */
   const DataRefreshDialogMixin = EtoolsMixinFactory.combineMixins([
    EtoolsLogsMixin,
    EtoolsPageRefreshMixin
  ], PolymerElement);
/**
 * @polymer
 * @customElement
 * @appliesMixin DataRefreshDialogMixin
 */
class DataRefreshDialog extends DataRefreshDialogMixin {
  [x: string]: any;
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
          on-close="_handleDialogClosed">
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

  static get properties() {
    return {
      interventionsSelected: {
        type: Boolean,
        value: false
      },
      partnersSelected: {
        type: Boolean,
        value: false
      },
      agreementsSelected: {
        type: Boolean,
        value: false
      },
      allSelected: {
        type: Boolean,
        value: false
      },
      anySelected: {
        type: Boolean,
        value: false
      },
      page: {
        type: String,
        notify: true
      }
    };
  }

  static get observers() {
    return [
      '_singleSectionChanged(interventionsSelected, partnersSelected, agreementsSelected)',
      '_allSelectedChanged(allSelected)'
    ];
  }

  open() {
    if (!this.$.refreshDialog.opened) {
      this.$.refreshDialog.opened = true;
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
    let allSelected = this.interventionsSelected && this.partnersSelected && this.agreementsSelected;
    let anySelected = this.interventionsSelected || this.partnersSelected || this.agreementsSelected;

    this.set('allSelected', allSelected);
    this.set('anySelected', anySelected);
  }

  _handleDialogClosed(closingReason: CustomEvent) {
    if (!closingReason.detail.confirmed) {
      return;
    }

    store.dispatch({type: RESET_UPLOADS_IN_PROGRESS});
    store.dispatch({type: RESET_UNSAVED_UPLOADS});

    fireEvent(this, 'global-loading', {message: 'Refreshing data...', active: true});

    let afterDataRefreshLandingPage = this._getAfterRefreshLandingPage();
    let restampLandingPage = this.page === afterDataRefreshLandingPage ||
        (this.page === 'government-partners' && afterDataRefreshLandingPage === 'partners');

    if (this.allSelected) {
      fireEvent(this, 'update-main-path', {path: afterDataRefreshLandingPage});
      this.refresh();
      return;
    }

    // clear only data sets
    let self = this;
    window.EtoolsPmpApp.DexieDb.transaction('rw', 'listsExpireMapTable', 'partners', 'agreements', 'interventions',
      function() {
        if (self.partnersSelected) {
          window.EtoolsPmpApp.DexieDb.partners.clear();
          window.EtoolsPmpApp.DexieDb.listsExpireMapTable.delete('partners');
        }
        if (self.agreementsSelected) {
          window.EtoolsPmpApp.DexieDb.agreements.clear();
          window.EtoolsPmpApp.DexieDb.listsExpireMapTable.delete('agreements');
        }
        if (self.interventionsSelected) {
          window.EtoolsPmpApp.DexieDb.interventions.clear();
          window.EtoolsPmpApp.DexieDb.listsExpireMapTable.delete('interventions');
        }
    }).then(function(result: any) {
      // transaction succeeded
      self._handleSuccess(afterDataRefreshLandingPage, restampLandingPage);
    }).catch(function(error: any) {
      // transaction failed
      self.logWarn('Dexie data clearing failed.', 'data-refresh-dialog', error);
      self._handleFailure(afterDataRefreshLandingPage, restampLandingPage);
    });
  }

  _handleSuccess(afterDataRefreshLandingPage: string, restampLandingPage: string) {
    this._triggerMainRoutePathUpdate(afterDataRefreshLandingPage, restampLandingPage);
    fireEvent(this, 'toast', {text: 'Data successfully refreshed', showCloseBtn: true});
  }

  _handleFailure(afterDataRefreshLandingPage: string, restampLandingPage: string) {
    this._triggerMainRoutePathUpdate(afterDataRefreshLandingPage, restampLandingPage);
    fireEvent(this, 'toast', {text: 'There was an error while refreshing the data', showCloseBtn: true});
  }

  _triggerMainRoutePathUpdate(afterDataRefreshLandingPage: string, restampLandingPage: string) {
    let routePath = afterDataRefreshLandingPage + '/list';
    if (restampLandingPage) {
      this.set('page', null);
      setTimeout(function() {
        fireEvent(this, 'global-loading', {active: false});
        this.set('page', afterDataRefreshLandingPage);
        fireEvent(this, 'update-main-path', {path: routePath});
      }.bind(this), 10);
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
  }

  _resetRefreshSelection() {
    this.set('partnersSelected', false);
    this.set('agreementsSelected', false);
    this.set('interventionsSelected', false);
  }
}

window.customElements.define(DataRefreshDialog.is, DataRefreshDialog);
