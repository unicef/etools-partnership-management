import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-tabs/paper-tab.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import EnvironmentFlagsMixin from '../../../../../../environment-flags/environment-flags-mixin';
import SaveIndicatorMixin from './mixins/save-indicator-mixin';
import IndicatorDialogTabsMixin from './mixins/indicator-dialog-tabs-mixin';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../../../store';
import {isEmptyObject, isJsonStrMatch, copy} from '../../../../../../utils/utils';
import {User, GenericObject} from '../../../../../../../typings/globals.types';
import {gridLayoutStyles} from '../../../../../../styles/grid-layout-styles';
import {requiredFieldStarredStyles} from '../../../../../../styles/required-field-styles';
import {SharedStyles} from '../../../../../../styles/shared-styles';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import './mixins/indicator-dialog-tabs-mixin.js';
import './mixins/save-indicator-mixin.js';
import './indicator-dissaggregations.js';
import './cluster-indicator-disaggregations.js';
import './cluster-indicator.js';
import './non-cluster-indicator.js';
import {Indicator, Location} from '../../../../../../../typings/intervention.types';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {userIsPme} from '../../../../../../user/user-permissions';
import {property} from '@polymer/decorators';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import {ClusterIndicatorEl} from './cluster-indicator.js';
import {NonClusterIndicatorEl} from './non-cluster-indicator.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin IndicatorDialogTabsMixin
 * @appliesMixin SaveIndicatorMixin
 * @appliesMixin EnvironmentFlagsMixin
 */
class IndicatorDialog extends connect(store)(
  IndicatorDialogTabsMixin(SaveIndicatorMixin(EnvironmentFlagsMixin(PolymerElement)))
) {
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
          }
        }
      </style>

      <etools-dialog
        id="indicatorDialog"
        size="lg"
        dialog-title="Indicator"
        on-close="_cleanUp"
        no-padding
        on-confirm-btn-clicked="_validateAndSaveIndicator"
        ok-btn-text="Save"
        keep-dialog-open
        disable-confirm-btn="[[disableConfirmBtn]]"
        spinner-text="[[spinnerText]]"
      >
        <etools-tabs
          id="indicatorTabs"
          tabs="[[indicatorDataTabs]]"
          active-tab="{{activeTab}}"
          border-bottom
          on-iron-select="_centerDialog"
        ></etools-tabs>

        <iron-pages id="indicatorPages" selected="{{activeTab}}" attr-for-selected="name" fallback-selection="details">
          <div name="details">
            <div class="row-h flex-c">
              <div class="col col-4">
                <etools-dropdown
                  id="sectionDropdw"
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
                  fit-into="etools-dialog"
                >
                </etools-dropdown>
              </div>
            </div>
            <div class="row-h">
              <paper-toggle-button
                disabled$="[[_clusterToggleIsDisabled(indicator)]]"
                checked="{{isCluster}}"
              ></paper-toggle-button>
              Cluster Indicator
            </div>
            <div class="indicator-content">
              <template is="dom-if" if="[[!isCluster]]">
                <non-cluster-indicator
                  id="nonClusterIndicatorEl"
                  indicator="{{indicator}}"
                  location-options="[[locationOptions]]"
                  intervention-status="[[interventionStatus]]"
                ></non-cluster-indicator>
              </template>
              <template is="dom-if" if="[[isCluster]]">
                <cluster-indicator
                  id="clusterIndicatorEl"
                  indicator="{{indicator}}"
                  prp-disaggregations="{{prpDisaggregations}}"
                  location-options="[[locationOptions]]"
                ></cluster-indicator>
              </template>
            </div>
          </div>
          <div class="row-padding" name="disaggregations">
            <div hidden$="[[_hideAddDisaggreations(isCluster, currentUser)]]" class="createDisaggreg">
              If disaggregation groups that you need are not pre-defined yet, you can create them
              <a href="/pmp/settings" target="_blank">here</a>.
            </div>
            <template is="dom-if" if="[[!isCluster]]" restamp>
              <indicator-dissaggregations data-items="{{disaggregations}}" on-add-new-disaggreg="_updateScroll">
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

  @property({type: Object})
  indicator!: Indicator;

  @property({type: Object})
  actionParams!: GenericObject;

  @property({type: Array})
  disaggregations: [] = [];

  @property({type: Array})
  prpDisaggregations: [] = [];

  @property({type: Array})
  sections!: GenericObject[];

  @property({type: Array})
  sectionOptionsIds!: [];

  @property({
    type: Array,
    computed: '_computeOptions(sectionOptionsIds, sections)'
  })
  sectionOptions!: GenericObject[];

  @property({type: Array})
  locations!: Location[];

  @property({type: Array})
  locationOptionsIds!: [];

  @property({
    type: Array,
    computed: '_computeOptions(locationOptionsIds, locations)'
  })
  locationOptions!: Location[];

  @property({type: Boolean})
  isCluster = false;

  @property({type: Object})
  toastEventSource!: PolymerElement;

  @property({type: Boolean})
  disableConfirmBtn = false;

  @property({type: String})
  spinnerText = 'Saving...';

  @property({type: String})
  interventionStatus!: string;

  @property({type: Object})
  currentUser!: User; // What???

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

    if (!isJsonStrMatch(this.currentUser, state.commonData!.currentUser)) {
      this.currentUser = copy(state.commonData!.currentUser!);
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
    (this.$.indicatorDialog as EtoolsDialog).scrollDown();
  }

  _initIndicatorDialogListeners() {
    this._startSpinner = this._startSpinner.bind(this);
    this._stopSpinner = this._stopSpinner.bind(this);
    this._showToast = this._showToast.bind(this);

    this.addEventListener('start-spinner', this._startSpinner as any);
    this.addEventListener('stop-spinner', this._stopSpinner as any);
    this.addEventListener('show-toast', this._showToast as any);
  }

  _removeIndicatorDialogListeners() {
    this.removeEventListener('start-spinner', this._startSpinner as any);
    this.removeEventListener('stop-spinner', this._stopSpinner as any);
    this.removeEventListener('show-toast', this._showToast as any);
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
    (this.$.indicatorDialog as EtoolsDialog).opened = true;
  }

  setTitle(title: string) {
    (this.$.indicatorDialog as EtoolsDialog).dialogTitle = title;
  }

  setIndicatorData(data: any, actionParams: any, interventionStatus: string) {
    this.set('actionParams', actionParams);
    this.set('interventionStatus', interventionStatus);

    if (!data) {
      // new indicator
      this.isCluster = false;
      this.set('indicator', new Indicator());
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
    return disaggregations.map(function (id: number) {
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

  _stopSpinner(e?: CustomEvent) {
    if (e) {
      e.stopImmediatePropagation();
    }
    (this.$.indicatorDialog as EtoolsDialog).stopSpinner();
    this.spinnerText = 'Saving...';
  }

  _startSpinner(e: CustomEvent) {
    if (e) {
      e.stopImmediatePropagation();
      this.set('spinnerText', e.detail.spinnerText);
    }
    (this.$.indicatorDialog as EtoolsDialog).startSpinner();
  }

  _showToast(e: CustomEvent) {
    parseRequestErrorsAndShowAsToastMsgs(e.detail.error, this.toastEventSource);
  }

  resetValidationsAndStyle(isCluster: boolean | undefined, skipUndefinedCheck: boolean) {
    if (typeof isCluster === 'undefined' && !skipUndefinedCheck) {
      return;
    }
    let indicatorEl: ClusterIndicatorEl | NonClusterIndicatorEl;
    if (this.isCluster) {
      indicatorEl = this.shadowRoot!.querySelector('#clusterIndicatorEl') as ClusterIndicatorEl;
      this.updateStyles({'--border-color': 'var(--ternary-color)'});
    } else {
      indicatorEl = (this.shadowRoot!.querySelector('#nonClusterIndicatorEl') as unknown) as NonClusterIndicatorEl;
      this.updateStyles({'--border-color': 'var(--dark-divider-color)'});
    }
    if (indicatorEl) {
      indicatorEl.resetValidations();
      this.updateStyles();
    }

    const sectionDropdown = this.shadowRoot!.querySelector('#sectionDropdw') as EtoolsDropdownEl;
    sectionDropdown.resetInvalidState();
  }

  resetFieldValues() {
    this.indicator = new Indicator();
    this.disaggregations = [];
    this.prpDisaggregations = [];
    const clusterIndicEl = this.shadowRoot!.querySelector('#clusterIndicatorEl') as ClusterIndicatorEl;
    if (this.isCluster && clusterIndicEl) {
      clusterIndicEl.resetFieldValues();
    }
  }

  _centerDialog() {
    (this.$.indicatorDialog as EtoolsDialog).notifyResize();
  }

  _computeOptions(optionsIds: string[], allOptions: GenericObject[]) {
    let options: GenericObject[] = [];
    if (!isEmptyObject(optionsIds) && !isEmptyObject(allOptions)) {
      // filter options
      const ids = optionsIds.map((id) => parseInt(id, 10));

      options = allOptions.filter((opt: any) => {
        return ids.indexOf(parseInt(opt.id, 10)) > -1;
      });
    }
    return options;
  }

  _hideAddDisaggreations(isCluster: boolean, currentUser: User) {
    return isCluster || !userIsPme(currentUser);
  }
}

window.customElements.define('indicator-dialog', IndicatorDialog);
export {IndicatorDialog as IndicatorDialogEl};
