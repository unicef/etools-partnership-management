import { PolymerElement, html } from '@polymer/polymer';
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin';
import {EtoolsMixinFactory} from 'etools-behaviors/etools-mixin-factory';
import 'etools-dropdown/etools-dropdown.js';
import 'etools-dropdown/etools-dropdown-multi.js';
import IndicatorsCommonMixin from './mixins/indicators-common-mixin';
import EndpointsMixin from '../../../../../../endpoints/endpoints-mixin';
import { fireEvent } from '../../../../../../utils/fire-custom-event';
import { gridLayoutStyles } from '../../../../../../styles/grid-layout-styles';
import { requiredFieldStarredStyles } from '../../../../../../styles/required-field-styles';
import { SharedStyles } from '../../../../../../styles/shared-styles';
import { RootState, store } from '../../../../../../../store';
import { connect } from 'pwa-helpers/connect-mixin';

/**
 * @polymer
 * @customElement
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin IndicatorsCommonMixin
 * @appliesMixin EndpointsMixin
 */
class ClusterIndicator extends connect(store)(EtoolsMixinFactory.combineMixins([
  EtoolsLogsMixin,
  IndicatorsCommonMixin,
  EndpointsMixin,
], PolymerElement)) {
  [x: string]: any;

  static get template() {
    return html`
     ${gridLayoutStyles} ${SharedStyles} ${requiredFieldStarredStyles}
      <style>
        :host {
          display: block;
        }

        paper-input {
          width: 100%;
        }

        .dash-separator {
          padding: 0 8px 0 8px;
          margin-bottom: 10px;
        }
      </style>
      <template is="dom-if" if="[[!isNewIndicator]]">
        <div class="row-h flex-c">
          <div class="col col-6">
            <div class="layout-vertical">
              <label class="paper-label">Response Plan</label>
              <label class="input-label"
                    empty$="[[!indicator.response_plan_name]]">[[indicator.response_plan_name]]</label>
            </div>
          </div>
          <div class="col col-6">
            <div class="layout-vertical">
              <label class="paper-label">Cluster</label>
              <label class="input-label" empty$="[[!indicator.cluster_name]]">[[indicator.cluster_name]]</label>
            </div>
          </div>
        </div>
        <div class="row-h flex-c">
          <div class="layout-vertical">
            <label class="paper-label">Indicator</label>
            <label class="input-label" empty$="[[!indicator.cluster_indicator_title]]">[[indicator.cluster_indicator_title]]</label>
          </div>
        </div>
      </template>

      <template is="dom-if" if="[[isNewIndicator]]">
        <div class="row-h flex-c">
          <div class="col col-6">
            <etools-dropdown id$="responsePlanDropdw"
                            label="Response Plan"
                            placeholder="&#8212;"
                            selected-item="{{responsePlan}}"
                            selected="{{responsePlanId}}"
                            options="[[responsePlans]]"
                            option-label="title"
                            option-value="id"
                            error-message="Please select Response Plan"
                            disable-on-focus-handling
                            fit-into="etools-dialog">
            </etools-dropdown>
          </div>
          <div class="col col-6">
            <etools-dropdown id$="clusterDropdw"
                            label="Cluster"
                            placeholder="&#8212;"
                            selected="{{clusterId}}"
                            selected-item="{{cluster}}"
                            options="[[clusters]]"
                            option-label="title"
                            option-value="id"
                            error-message="Please select Cluster"
                            disable-on-focus-handling
                            fit-into="etools-dialog">
            </etools-dropdown>
          </div>
        </div>
        <div class="row-h flex-c">
          <etools-dropdown id="clusterIndicatorDropdw"
                          label="Indicator"
                          placeholder="&#8212;"
                          selected="{{indicator.cluster_indicator_id}}"
                          selected-item="{{prpClusterIndicator}}"
                          options="[[prpClusterIndicators]]"
                          option-label="title"
                          option-value="id"
                          required
                          auto-validate
                          error-message="Please select Indicator"
                          disable-on-focus-handling
                          fit-into="etools-dialog">
          </etools-dropdown>
        </div>
      </template>

      <div class="row-h flex-c" hidden$="[[_typeMatches(prpClusterIndicator, 'number')]]">
        <div class="col col-4">
          <paper-input id="numeratorLbl" label="Numerator Label"
                      value="{{indicator.numerator_label}}" placeholder="&#8212;">
          </paper-input>
        </div>
        <div class="col col-4">
          <paper-input id="denomitorLbl" label="Denominator Label"
                      value="{{indicator.denominator_label}}" placeholder="&#8212;">
          </paper-input>
        </div>
      </div>

      <template is="dom-if" if="[[_typeMatches(prpClusterIndicator, 'ratio')]]">
        <div class="row-h flex-c">
          <div class="col-4 layout-horizontal">
            <paper-input id="baselineNumerator"
                        label="Baseline"
                        value="{{indicator.baseline.v}}"
                        placeholder="Numerator"
                        allowed-pattern="[0-9]"
                        pattern="[[digitsNotStartingWith0Pattern]]"
                        auto-validate
                        error-message="Invalid">
            </paper-input>
            <div class="layout-horizontal bottom-aligned dash-separator">/</div>
            <paper-input id="baselineDenominator"
                        value="{{indicator.baseline.d}}"
                        placeholder="Denominator"
                        allowed-pattern="[0-9]"
                        pattern="[[digitsNotStartingWith0Pattern]]"
                        auto-validate
                        error-message="Invalid">
            </paper-input>
          </div>
          <div class="col col-4">
            <paper-input id="targetNumerator"
                        label="Target"
                        value="{{indicator.target.v}}"
                        placeholder="Numerator"
                        allowed-pattern="[0-9]"
                        pattern="[[digitsNotStartingWith0Pattern]]"
                        auto-validate
                        required
                        auto-validate
                        error-message="Invalid">
            </paper-input>
            <div class="layout-horizontal bottom-aligned dash-separator">/</div>
            <paper-input id="targetDenominator"
                        placeholder="Denominator"
                        value="{{indicator.target.d}}"
                        readonly
                        allowed-pattern="[0-9]"
                        pattern="[[digitsNotStartingWith0Pattern]]"
                        required
                        auto-validate
                        error-message="Invalid">
            </paper-input>
          </div>
        </div>
      </template>

      <template is="dom-if" if="[[!_typeMatches(prpClusterIndicator, 'ratio')]]">
        <div class="row-h flex-c">
          <div class="col col-4">
            <paper-input id="baselineEl"
                        label="Baseline"
                        placeholder="&#8212;"
                        value="{{indicator.baseline.v}}"
                        allowed-pattern="[0-9\.\,]"
                        pattern="[[numberPattern]]"
                        auto-validate
                        error-message="Invalid number">
            </paper-input>
          </div>
          <div class="col col-4">
            <paper-input id="targetEl"
                        label="Target"
                        placeholder="&#8212;"
                        value="{{indicator.target.v}}"
                        required
                        allowed-pattern="[0-9\.\,]"
                        pattern="[[numberPattern]]"
                        auto-validate
                        error-message="Please add a valid target">
            </paper-input>
          </div>
        </div>
      </template>
      <div class="row-h flex-c">
        <div class="layout-vertical">
          <label class="paper-label">Means of Verification</label>
          <label class="input-label" empty$="[[!prpClusterIndicator.means_of_verification]]">
            [[prpClusterIndicator.means_of_verification]]
          </label>
        </div>
      </div>
      <div class="row-h flex-c">
        <etools-dropdown-multi id="locationsDropdw"
                              label="Locations"
                              placeholder="&#8212;"
                              selected-values="{{indicator.locations}}"
                              options="[[locationOptions]]"
                              option-label="name"
                              option-value="id"
                              required
                              auto-validate
                              error-message="Please select locations"
                              disable-on-focus-handling
                              fit-into="etools-dialog">
        </etools-dropdown-multi>
      </div>

    `;
  }

  static get properties() {
    return {
      indicator: {
        type: Object,
        observer: 'indicatorChanged'
      },
      isNewIndicator: {
        type: Boolean
      },
      clusters: {
        type: Array
      },
      clusterId: {
        type: String
      },
      locationOptions: {
        type: Array
      },
      responsePlanId: {
        type: String
      },
      cluster: {
        type: String,
        observer: '_clusterChanged'
      },
      prpClusterIndicators: {
        type: Array
      },
      responsePlan: {
        type: Object,
        observer: '_responsePlanChanged'
      },
      responsePlans: {
        type: Array
      },
      prpClusterIndicator: {
        type: Object,
        observer: '_selectedPrpClusterIndicatorChanged'
      },
      prpDisaggregations: {
        type: Array,
        notify: true
      }
    };
  }

  static get observers() {
    return [
      '_baselineChanged(indicator.baseline.v)',
      '_targetChanged(indicator.target.v)'
    ];
  }

  stateChanged(state: RootState) {
    this.endStateChanged(state);
  }

  connectedCallback() {
    super.connectedCallback();

    let self = this;
    this.fireRequest('getResponsePlans', {})
        .then(function(response: any) {
          self.responsePlans = response;
        })
        .catch(function(error: any) {
          fireEvent(self, 'show-toast', {error: {response: error.message || error.response}});
        });

    this.resetValidations();
  }

  indicatorChanged(indicator: any) {
    if (typeof indicator === 'undefined') {
      return;
    }
    if (!indicator || !indicator.id) {
      this.set('isNewIndicator', true);
    } else {
      this.set('isNewIndicator', false);
      if (indicator.cluster_indicator_id) {
        this._getPrpClusterIndicator(indicator.cluster_indicator_id);
      }
    }
  }

  _getPrpClusterIndicator(clusterIndicId: string) {
    fireEvent(this, 'start-spinner', {spinnerText: 'Loading...'});
    let self = this;
    this.fireRequest('getPrpClusterIndicator', {id: clusterIndicId})
        .then(function(response: any) {
          self.prpClusterIndicator = response;
          fireEvent(self, 'stop-spinner');
        })
        .catch(function(error: any) {
          fireEvent(self, 'stop-spinner');
          fireEvent(self, 'show-toast', {error: {response: error.message || error.response}});
        });
  }

  _responsePlanChanged(responsePlan: any) {
    this.clusterId = undefined;

    if (!responsePlan) {
      return;
    }
    this.indicator.response_plan_name = responsePlan.title;
    this._populateClusters(responsePlan.id);
  }

  _populateClusters(selectedRespPlanId: string) {
    if (!selectedRespPlanId) {
      this.clusters = [];
      return;
    }
    this.clusters = this.responsePlans.filter(function(r) {
      return parseInt(r.id) === parseInt(selectedRespPlanId);
    })[0].clusters;
  }

  _clusterChanged(cluster: any) {
    this.prpClusterIndicators = [];
    this.set('indicator.cluster_indicator_id', undefined);

    if (!cluster) {
      return;
    }
    this._populatePrpClusterIndicators(cluster.id);
    this.indicator.cluster_name = cluster.title;
  }

  _populatePrpClusterIndicators(clusterId: string) {
    if (!clusterId) {
      return;
    }
    fireEvent(this, 'start-spinner', {spinnerText: 'Loading...'});
    let self = this;
    this.fireRequest('getPrpClusterIndicators', {id: clusterId})
        .then(function(response: any) {
          self.prpClusterIndicators = self._unnestIndicatorTitle(response.results);
          fireEvent(self, 'stop-spinner');
        }).catch(function(error: any) {
      fireEvent(self, 'stop-spinner');
      fireEvent(self, 'show-toast', {error: {response: error.message || error.response}});
    });
  }

  /* ESM dropdown can't process a nested property as option-label
    and it was decided to not add that functionality to the dopdown yet */
  _unnestIndicatorTitle(indicators: []) {
    indicators.forEach(function(indic: any) {
      indic.title = indic.blueprint.title;
    });
    return indicators;
  }

  _selectedPrpClusterIndicatorChanged(prpClusterIndic: any) {
    if (!prpClusterIndic) {
      this.set('prpDisaggregations', []);
      if (this.indicator) {
        this.indicator.baseline = {};
        this.indicator.target = {};
      }
      return;
    }

    this.set('indicator.cluster_indicator_title', prpClusterIndic.title);
    this.set('prpDisaggregations', prpClusterIndic.disaggregations);

    if (prpClusterIndic.blueprint.display_type === 'number') {
      this._resetDenominator(1);
      this._resetRatioLabels();
    } else if (prpClusterIndic.blueprint.display_type === 'percentage') {
      this._resetDenominator(100);
    } else if (prpClusterIndic.blueprint.display_type === 'ratio') {
      this.indicator.target.d = prpClusterIndic.target.d;
    }
  }

  _resetDenominator(newD) {
    this.indicator.baseline.d = newD;
    this.indicator.target.d = newD;
  }

  _resetRatioLabels() {
    this.indicator.numerator_label = '';
    this.indicator.denominator_label = '';
  }

  validate() {
    let elemIds = ['clusterIndicatorDropdw', 'locationsDropdw'];
    elemIds.push(this._getIndicatorTargetElId());
    return this.validateComponents(elemIds);
  }

  _getIndicatorTargetElId() {
    if (!this.prpClusterIndicator || !this.prpClusterIndicator.blueprint) {
      return ['targetEl', 'baselineEl'];
    }
    if (this.prpClusterIndicator.blueprint.display_type === 'ratio') {
      return ['baselineNumerator', 'baselineDenominator', 'targetNumerator', 'targetDenominator'];
    }

    return ['targetEl', 'baselineEl'];
  }

  resetValidations() {
    setTimeout(() => {
      this._resetInvalid('#clusterIndicatorDropdw');

      this._resetInvalid('#locationsDropdw');

      this._resetInvalid('#targetEl');

      let targetNumerator = this.shadowRoot.querySelector('#targetNumerator');
      if (targetNumerator) {
        targetNumerator.invalid = false;

        this._resetInvalid('#targetDenominator');
        this._resetInvalid('#baselineNumerator');
        this._resetInvalid('#baselineDenominator');
      }

    }, 10);
  }

  _resetInvalid(elSelector: string) {
    let elem = this.shadowRoot.querySelector(elSelector);
    if (elem) {
      elem.invalid = false;
    }
  }

  resetFieldValues() {
    this.responsePlanId = undefined;
    this.clusterId = undefined;
    this.indicator.indicator = null;
  }

  _typeMatches(prpIndic: any, type: string) {
    if (!prpIndic || !prpIndic.blueprint) {
      return false;
    }
    return prpIndic.blueprint.display_type === type;
  }

}

window.customElements.define('cluster-indicator', ClusterIndicator);
