import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-tabs/paper-tab.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import EnvironmentFlags from '../../../../../../environment-flags/environment-flags-mixin';
import UserPermissionsMixin from '../../../../../../user/user-permissions-mixin';
import SaveIndicatorMixin from './mixins/save-indicator-mixin';
import IndicatorDialogTabsMixin from './mixins/indicator-dialog-tabs-mixin';
import { connect } from 'pwa-helpers/connect-mixin';
import { store, RootState } from '../../../../../../../store';
import { isEmptyObject, isJsonStrMatch } from '../../../../../../utils/utils';
import { User } from '../../../../../../../typings/globals.types';
import { gridLayoutStyles } from '../../../../../../styles/grid-layout-styles';
import { requiredFieldStarredStyles } from '../../../../../../styles/required-field-styles';
import { SharedStyles } from '../../../../../../styles/shared-styles';
import 'etools-dropdown/etools-dropdown.js';
import 'etools-dialog/etools-dialog.js';
import './mixins/indicator-dialog-tabs-mixin.js';
import './mixins/save-indicator-mixin.js';
import './indicator-dissaggregations.js';
import './cluster-indicator-disaggregations.js';
import './cluster-indicator.js';
import './non-cluster-indicator.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin IndicatorDialogTabs
 * @appliesMixin SaveIndicator
 * @appliesMixin UserPermissions
 * @appliesMixin EnvironmentFlags
 */
class IndicatorDialog extends connect(store)(EtoolsMixinFactory.combineMixins([
  IndicatorDialogTabsMixin,
  SaveIndicatorMixin,
  UserPermissionsMixin,
  EnvironmentFlags
], PolymerElement)) {

  static get template() {
    return html`
     ${gridLayoutStyles} ${SharedStyles} ${requiredFieldStarredStyles}
      <style>
        [hidden] {
          display: none !important;
        }

        paper-input {
          width: 100%;
        }

        :host {
          --border-color: var(--dark-divider-color);
        }

        .indicator-content {
          margin: 16px 24px;
          margin-bottom: 40px;
          border: solid 1px var(--border-color);
          overflow-x: hidden; /*To avoid horizontal scroll in IE11 */
        }

        .createDisaggreg {
          color: var(--secondary-text-color);
          padding: 8px 0;
          font-weight: 500;
          font-size: 16px !important;
        }

        a {
          color: var(--primary-color);
        }

        etools-dialog {
          --etools-dialog-scrollable: {
            min-height: 400px;
            font-size: 16px;
          };
        }
      </style>

      <etools-dialog id="indicatorDialog" size="lg" dialog-title="Indicator"
                    on-close="_cleanUp" no-padding
                    on-confirm-btn-clicked="_validateAndSaveIndicator"
                    ok-btn-text="Save" keep-dialog-open disable-confirm-btn="[[disableConfirmBtn]]"
                    spinner-text="[[spinnerText]]">

        <etools-tabs id="indicatorTabs"
                    tabs="[[indicatorDataTabs]]"
                    active-tab="{{activeTab}}"
                    border-bottom
                    on-iron-select="_centerDialog"></etools-tabs>

        <iron-pages id="indicatorPages"
                    selected="{{activeTab}}"
                    attr-for-selected="name"
                    fallback-selection="details">
          <div name="details">
            <div class="row-h flex-c">
              <div class="col col-4">
                <etools-dropdown id="sectionDropdw"
                                label="Section"
                                selected="{{indicator.section}}"
                                placeholder="&#8212;"
                                options="[[sectionOptions]]"
                                option-label="name"
                                option-value="id"
                                required
                                auto-validate
                                error-message="Please select section(s)"
                                disable-on-focus-handling
                                fit-into="etools-dialog">
                </etools-dropdown>
              </div>
            </div>
            <div class="row-h">
              <paper-toggle-button disabled$="[[_clusterToggleIsDisabled(indicator)]]"
                                  checked$="{{isCluster}}"></paper-toggle-button>
              Cluster Indicator
            </div>
            <div class="indicator-content">
              <template is="dom-if" if="[[!isCluster]]">
                <non-cluster-indicator id="nonClusterIndicatorEl"
                                      indicator="{{indicator}}"
                                      location-options="[[locationOptions]]"
                                      intervention-status="[[interventionStatus]]"></non-cluster-indicator>
              </template>
              <template is="dom-if" if="[[isCluster]]">
                <cluster-indicator id="clusterIndicatorEl"
                                  indicator="{{indicator}}"
                                  prp-disaggregations="{{prpDisaggregations}}"
                                  location-options="[[locationOptions]]"></cluster-indicator>
              </template>
            </div>
          </div>
          <div class="row-padding" name="disaggregations">
            <div hidden$="[[_hideAddDisaggreations(isCluster, currentUser)]]" class="createDisaggreg">If disaggregation
              groups that you need are not
              pre-defined yet, you can create them <a href="/pmp/settings" target="_blank">here</a>.
            </div>
            <template is="dom-if" if="[[!isCluster]]" restamp>
              <indicator-dissaggregations data-items="{{disaggregations}}"
                                          on-add-new-disaggreg="_updateScroll">
              </indicator-dissaggregations>
            </template>
            <template is="dom-if" if="[[isCluster]]" restamp>
              <cluster-indicator-disaggregations disaggregations="[[prpDisaggregations]]">
              </cluster-indicator-disaggregations>
            </template>
          </div>
        </iron-pages>

      </etools-dialog>

    `;
  }

  static get properties() {
    return {
      indicator: {
        type: Object
      },
      indicatorModel: {
        type: Object,
        readOnly: true,
        value: {
          id: null,
          indicator: {
            id: null,
            title: null,
            unit: 'number',
            display_type: 'percentage'
          },
          section: null,
          baseline: {},
          target: {d: 1},
          means_of_verification: null,
          locations: [],
          disaggregation: [],
          cluster_indicator_title: null,
          cluster_indicator_id: null,
          cluster_name: null,
          response_plan_name: null
        }
      },
      actionParams: {
        type: Object
      },
      disaggregations: {
        type: Array,
        value: []
      },
      prpDisaggregations: {
        type: Array,
        value: []
      },
      sections: {
        type: Array,
        statePath: 'sections'
      },
      sectionOptionsIds: {
        type: Array
      },
      sectionOptions: {
        type: Array,
        computed: '_computeOptions(sectionOptionsIds, sections)'
      },
      locations: {
        type: Array,
        statePath: 'locations'
      },
      locationOptionsIds: {
        type: Array
      },
      locationOptions: {
        type: Array,
        computed: '_computeOptions(locationOptionsIds, locations)'
      },
      isCluster: {
        type: Boolean,
        value: false
      },
      toastEventSource: Object,
      disableConfirmBtn: {
        type: Boolean,
        value: false
      },
      spinnerText: {
        type: String,
        value: 'Saving...'
      },
      interventionStatus: {
        type: String
      }
    };
  }

  static get observers() {
    return ['resetValidationsAndStyle(isCluster)'];
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.sections, state.commonData!.sections)) {
      this.sections = state.commonData!.sections;
    }
    if (!isJsonStrMatch(this.locations, state.commonData!.locations)) {
      this.locations = state.commonData!.locations;
    }

    this.envStateChanged(state);
  }

  ready() {
    super.ready();
    this._initIndicatorDialogListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeIndicatorDialogListeners();
  }

  _updateScroll() {
    this.$.indicatorDialog.scrollDown();
  }

  _initIndicatorDialogListeners() {
    this._startSpinner = this._startSpinner.bind(this);
    this._stopSpinner = this._stopSpinner.bind(this);
    this._showToast = this._showToast.bind(this);

    this.addEventListener('start-spinner', this._startSpinner);
    this.addEventListener('stop-spinner', this._stopSpinner);
    this.addEventListener('show-toast', this._showToast);
  }

  _removeIndicatorDialogListeners() {
    this.removeEventListener('start-spinner', this._startSpinner);
    this.removeEventListener('stop-spinner', this._stopSpinner);
    this.removeEventListener('show-toast', this._showToast);
  }

  _clusterToggleIsDisabled(indicator: any) {
    if (indicator && indicator.id) {
      return true;
    }
    return !this.prpServerIsOn();
  }

  openIndicatorDialog() {
    this.updateActiveTab('details');
    this.disableConfirmBtn = false;
    this.$.indicatorDialog.opened = true;
  }

  setTitle(title: string) {
    this.$.indicatorDialog.dialogTitle = title;
  }

  setIndicatorData(data: any, actionParams: any, interventionStatus: string) {
    this.set('actionParams', actionParams);
    this.set('interventionStatus', interventionStatus);

    if (!data) { // new indicator
      this.isCluster = false;
      this.set('indicator', JSON.parse(JSON.stringify(this.indicatorModel)));
      this.set('disaggregations', []);
      this.preselectSectionAndLocation();
      return;
    }

    this.isCluster = !!data.cluster_indicator_id;
    this.set('indicator', data);
    if (!this.isCluster) {
      this.set('disaggregations', this._convertToArrayOfObj(this.indicator.disaggregation));
    }
  }

  preselectSectionAndLocation() {
    if (this.sectionOptions && this.sectionOptions.length === 1) {
      this.set('indicator.section', this.sectionOptions[0].id);
    }
    if (this.locationOptions && this.locationOptions.length === 1) {
      this.set('indicator.locations', [this.locationOptions[0].id]);
    }
  }

  // For dom-repeat to work ok
  _convertToArrayOfObj(disaggregations: any) {
    if (!disaggregations) {
      return [];
    }
    return disaggregations.map(function(id) {
      /**
       * disaggregId and not simply id to avoid repeatable-behavior
       * from trying to make an endpoint request on Delete
       */
      return {disaggregId: id};
    });
  }

  _cleanUp() {
    this._stopSpinner();
    this.disableConfirmBtn = false;
    // Anything else?
  }

  _stopSpinner(e: CustomEvent) {
    if (e) {
      e.stopImmediatePropagation();
    }
    this.$.indicatorDialog.stopSpinner();
    this.spinnerText = 'Saving...';
  }

  _startSpinner(e: CustomEvent) {
    if (e) {
      e.stopImmediatePropagation();
      this.set('spinnerText', e.detail.spinnerText);
    }
    this.$.indicatorDialog.startSpinner();
  }

  _showToast(e: CustomEvent) {
    this.parseRequestErrorsAndShowAsToastMsgs(e.detail.error, this.toastEventSource);
  }

  resetValidationsAndStyle(isCluster: boolean, skipUndefinedCheck: boolean) {
    if (typeof isCluster === 'undefined' && !skipUndefinedCheck) {
      return;
    }
    let indicatorEl;
    if (this.isCluster) {
      indicatorEl = this.shadowRoot.querySelector('#clusterIndicatorEl');
      this.updateStyles({'--border-color': 'var(--ternary-color)'});
    } else {
      indicatorEl = this.shadowRoot.querySelector('#nonClusterIndicatorEl');
      this.updateStyles({'--border-color': 'var(--dark-divider-color)'});
    }
    if (indicatorEl) {
      indicatorEl.resetValidations();
      this.updateStyles();
    }

    let sectionDropdown = this.shadowRoot.querySelector('#sectionDropdw');
    sectionDropdown.resetInvalidState();
  }

  resetFieldValues() {
    this.indicator = JSON.parse(JSON.stringify(this.indicatorModel));
    this.disaggregations = [];
    this.prpDisaggregations = [];
    if (this.isCluster && this.shadowRoot.querySelector('#clusterIndicatorEl')) {
      this.shadowRoot.querySelector('#clusterIndicatorEl').resetFieldValues();
    }
  }

  _centerDialog() {
    this.$.indicatorDialog.notifyResize();
  }

  _computeOptions(optionsIds: [], allOptions: []) {
    let options = [];
    if (!isEmptyObject(optionsIds) && !isEmptyObject(allOptions)) {
      // filter options
      optionsIds = optionsIds.map(id => parseInt(id, 10));
      options = allOptions.filter((opt: any) => {
        return optionsIds.indexOf(parseInt(opt.id, 10)) > -1;
      });
    }
    return options;
  }

  _hideAddDisaggreations(isCluster: boolean, currentUser: User) {
    return isCluster || !this.userIsPme(currentUser);
  }

}

window.customElements.define('indicator-dialog', IndicatorDialog);
