import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import 'etools-dropdown/etools-dropdown-multi.js';
import IndicatorsCommonMixin from './mixins/indicators-common-mixin';
import { gridLayoutStyles } from '../../../../../../styles/grid-layout-styles';
import { SharedStyles } from '../../../../../../styles/shared-styles';
import { requiredFieldStarredStyles } from '../../../../../../styles/required-field-styles';
import { Indicator } from '../../../../../../../typings/intervention.types';
import { property } from '@polymer/decorators';


/**
 * @polymer
 * @customElement
 * @appliesMixin IndicatorsCommonMixin
 */
class NonClusterIndicator extends IndicatorsCommonMixin(PolymerElement) {

  static get template() {
    return html`
      ${gridLayoutStyles} ${SharedStyles} ${requiredFieldStarredStyles}
      <style>
        *[hidden] {
          display: none !important;
        }

        :host {
          display: block;
        }

        .radioGroup {
          width: 320px;
        }

        paper-input,
        paper-textarea {
          display: inline-block;
          width: 100%;
        }

        paper-textarea {
          --paper-input-container-input: {
            display: block;
          }
        }

        .unknown {
          padding-left: 24px;
          padding-bottom: 16px;
        }

        .no-left-padding {
          padding-left: 0px !important;
        }

        .dash-separator {
          padding: 0 8px 0 8px;
          margin-bottom: 10px;
        }

      </style>

      <div class="row-h flex-c">
        <div class="layout-vertical">
          <label class="paper-label">Type </label>
          <div class="radioGroup">
            <paper-radio-group selected="{{indicator.indicator.unit}}">
              <paper-radio-button disabled$="[[readonly]]" class="no-left-padding" name="number">Quantity / Scale
              </paper-radio-button>
              <paper-radio-button disabled$="[[readonly]]" name="percentage">Percent/Ratio</paper-radio-button>
            </paper-radio-group>

          </div>
        </div>
        <div class="layout-vertical" hidden$="[[_unitIsNumeric(indicator.indicator.unit)]]">
          <label class="paper-label">Display Type </label>
          <div class="radioGroup">
            <paper-radio-group selected="{{indicator.indicator.display_type}}">
              <paper-radio-button disabled="[[readonly]]" class="no-left-padding" name="percentage">Percentage
              </paper-radio-button>
              <paper-radio-button disabled="[[readonly]]" name="ratio">Ratio</paper-radio-button>
            </paper-radio-group>
          </div>
        </div>
      </div>
      <div class="row-h flex-c">
        <paper-input id="titleEl" required label="Indicator"
                    value="{{indicator.indicator.title}}" placeholder="&#8212;"
                    error-message="Please add a title" auto-validate
                    readonly$="[[readonly]]">
        </paper-input>
      </div>

      <!-- Baseline & Target -->
      <div class="row-h flex-c" hidden$="[[_unitIsNumeric(indicator.indicator.unit)]]">
        <div class="col col-3">
          <paper-input id="numeratorLbl" label="Numerator Label"
                      value="{{indicator.numerator_label}}" placeholder="&#8212;">
          </paper-input>
        </div>
        <div class="col col-3">
          <paper-input id="denomitorLbl" label="Denominator Label"
                      value="{{indicator.denominator_label}}" placeholder="&#8212;">
          </paper-input>
        </div>
      </div>
      <div class="row-h flex-c">
        <template is="dom-if" if="[[!_isRatioType(indicator.indicator.unit, indicator.indicator.display_type)]]">
          <div class="col col-3">
            <template is="dom-if" if="[[_unitIsNumeric(indicator.indicator.unit)]]">
              <paper-input id="baselineNumeric"
                          label="Baseline"
                          value="{{indicator.baseline.v}}"
                          allowed-pattern="[0-9\.\,]"
                          pattern="[[numberPattern]]"
                          auto-validate
                          error-message="Invalid number"
                          placeholder="&#8212;"
                          disabled="[[baselineIsUnknown]]">
              </paper-input>
            </template>
            <template is="dom-if" if="[[!_unitIsNumeric(indicator.indicator.unit)]]">
              <paper-input id="baselineNonNumeric"
                          label="Baseline"
                          value="{{indicator.baseline.v}}"
                          allowed-pattern="[0-9]"
                          pattern="[[digitsPattern]]"
                          auto-validate
                          error-message="Invalid number"
                          placeholder="&#8212;"
                          disabled="[[baselineIsUnknown]]">
              </paper-input>
            </template>
          </div>
          <div class="col col-3">
            <paper-input label="Target" id="targetElForNumericUnit"
                        value="{{indicator.target.v}}"
                        placeholder="&#8212;"
                        allowed-pattern="[0-9\.\,]"
                        required
                        pattern="[[numberPattern]]"
                        auto-validate
                        error-message="Please add a valid target"
                        hidden$="[[!_unitIsNumeric(indicator.indicator.unit)]]">
            </paper-input>
            <paper-input label="Target" id="targetElForNonNumericUnit"
                        value="{{indicator.target.v}}"
                        placeholder="&#8212;"
                        allowed-pattern="[0-9]"
                        required
                        pattern="[[digitsPattern]]"
                        auto-validate
                        error-message="Please add a valid target"
                        hidden$="[[_unitIsNumeric(indicator.indicator.unit)]]">
            </paper-input>
          </div>
        </template>
        <template is="dom-if" if="[[_isRatioType(indicator.indicator.unit, indicator.indicator.display_type)]]">
          <div class="col-3 layout-horizontal">
            <paper-input id="baselineNumerator"
                        label="Baseline"
                        value="{{indicator.baseline.v}}"
                        allowed-pattern="[0-9]"
                        pattern="[[digitsNotStartingWith0Pattern]]"
                        auto-validate
                        error-message="Invalid"
                        placeholder="Numerator"
                        disabled="[[baselineIsUnknown]]">
            </paper-input>
            <div class="layout-horizontal bottom-aligned dash-separator">/</div>
            <paper-input
                id="baselineDenominator"
                value="{{indicator.baseline.d}}"
                allowed-pattern="[0-9]"
                pattern="[[digitsNotStartingWith0Pattern]]"
                auto-validate
                error-message="Invalid"
                placeholder="Denominator"
                disabled="[[baselineIsUnknown]]">
            </paper-input>
          </div>
          <div class="col col-3">
            <paper-input label="Target" id="targetNumerator"
                        value="{{indicator.target.v}}"
                        allowed-pattern="[0-9]"
                        pattern="[[digitsNotStartingWith0Pattern]]"
                        auto-validate
                        required
                        auto-validate
                        error-message="Invalid"
                        placeholder="Numerator">
            </paper-input>
            <div class="layout-horizontal bottom-aligned dash-separator">/</div>
            <paper-input id="targetDenominator"
                        value="{{indicator.target.d}}"
                        required
                        allowed-pattern="[0-9]"
                        pattern="[[digitsNotStartingWith0Pattern]]"
                        auto-validate
                        error-message="Empty or < 1"
                        placeholder="Denominator"
                        readonly$="[[isReadonlyDenominator(interventionStatus, indicator.id)]]">
            </paper-input>
          </div>
        </template>
        <div class="col col-6">
          <paper-toggle-button checked="{{indicator.is_high_frequency}}">
            High Frequency Humanitarian Indicator
          </paper-toggle-button>
        </div>
      </div>
      <div class="unknown">
        <paper-checkbox checked="{{baselineIsUnknown}}">Unknown</paper-checkbox>
      </div>
      <!-- Baseline & Target -->
      <div class="row-h flex-c">
        <paper-textarea label="Means of Verification"
                        type="text"
                        value="{{indicator.means_of_verification}}"
                        placeholder="&#8212;">
        </paper-textarea>
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

  @property({type: Object, observer: '_indicatorChanged'})
  indicator!: Indicator;

  @property({type: Boolean, observer: '_readonlyChanged'})
  readonly: boolean = false;

  @property({type: Array})
  locationOptions!: [];

  @property({type: Boolean})
  baselineIsUnknown!: boolean;

  @property({type: String})
  interventionStatus!: string;

  static get observers() {
    return [
      '_baselineChanged(indicator.baseline.v, indicator.indicator.unit)',
      '_targetChanged(indicator.target.v, indicator.indicator.unit)',
      '_baselineUnknownChanged(baselineIsUnknown)',
      '_typeChanged(indicator.indicator.display_type, indicator.indicator.unit)'
    ];
  }

  _unitIsNumeric(unit: string) {
    return unit === 'number';
  }

  _indicatorChanged(indicator: Indicator) {
    if (!indicator) {
      return;
    }
    if (!this.indicator.id) {
      this.baselineIsUnknown = false;
      this.readonly = false;
    } else {
      this.baselineIsUnknown = !(indicator.baseline) || this._isEmptyExcept0(indicator.baseline.v as any);
      this.readonly = true;
    }
  }

  isReadonlyDenominator(interventionStatus: string, indicId: string) {
    if (interventionStatus && interventionStatus.toLowerCase() === 'active') {
      return (indicId ? true : false);
    }
    return false;
  }

  _readonlyChanged(newVal: boolean, oldVal: boolean) {
    if (newVal !== oldVal) {
      this.updateStyles();
    }
  }

  _baselineUnknownChanged(isUnknown: boolean) {
    if (isUnknown) {
      this.set('indicator.baseline', {v: null, d: 1});
    }
  }

  _typeChanged() {
    this.resetValidations();
  }

  validate() {
    let elemIds = ['titleEl', 'locationsDropdw'];
    ([] as string[]).push.apply(elemIds, this._getIndicatorTargetElId());
    return this.validateComponents(elemIds);
  }

  resetValidations() {
    setTimeout(() => {
      let elemIds = ['titleEl', 'locationsDropdw'];
      ([] as string[]).push.apply(elemIds, this._getIndicatorTargetElId());

      let i;
      for (i = 0; i < elemIds.length; i++) {
        let elem = this.shadowRoot!.querySelector('#' + elemIds[i]) as PolymerElement & {invalid: boolean};
        if (elem) {
          elem.invalid = false;
        }
      }
    }, 10);
  }

  _getIndicatorTargetElId() {
    if (!this.indicator || !this.indicator.indicator) {
      return ['targetElForNumericUnit', 'baselineNumeric'];
    }
    if (this._getIndUnit() === 'percentage' && this._getIndDisplayType() === 'ratio') {
      return ['baselineNumerator', 'baselineDenominator', 'targetNumerator', 'targetDenominator'];
    }
    return (this._unitIsNumeric(this.indicator.indicator.unit))
        ? ['targetElForNumericUnit', 'baselineNumeric'] : ['targetElForNonNumericUnit', 'baselineNonNumeric'];
  }

  _isRatioType() {
    if (!this.indicator) {
      return false;
    }
    return (this._getIndDisplayType() === 'ratio' &&
        this._getIndUnit() === 'percentage');
  }

  _getIndDisplayType() {
    return this.indicator.indicator!.display_type;
  }

  _getIndUnit() {
    return this.indicator.indicator!.unit;
  }

}

window.customElements.define('non-cluster-indicator', NonClusterIndicator);
export {NonClusterIndicator as NonClusterIndicatorEl}
