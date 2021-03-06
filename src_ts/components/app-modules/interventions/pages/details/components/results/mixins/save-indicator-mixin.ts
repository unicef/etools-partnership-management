// import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';
import pick from 'lodash-es/pick';
import keys from 'lodash-es/keys';
import EndpointsMixin from '../../../../../../../endpoints/endpoints-mixin';
import {fireEvent} from '../../../../../../../utils/fire-custom-event';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {Constructor} from '../../../../../../../../typings/globals.types';
import {PolymerElement} from '@polymer/polymer';
import {IndicatorDialogEl} from '../indicator-dialog';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
function SaveIndicatorMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class SaveIndicatorClass extends EndpointsMixin(baseClass) {
    [x: string]: any;

    // @ts-ignore
    private nonClusterIndicatorCreateModel = {
      indicator: {
        title: null,
        unit: 'number',
        display_type: 'percentage'
      },
      section: null,
      baseline: {
        v: 0,
        d: 1
      },
      target: {
        v: 0,
        d: 1
      },
      means_of_verification: null,
      locations: [],
      disaggregation: [],
      is_high_frequency: false,
      numerator_label: null,
      denominator_label: null
    };
    // @ts-ignore
    private nonClusterIndicatorEditModel = {
      id: null,
      section: null,
      baseline: {
        v: 0,
        d: 1
      },
      target: {
        v: 0,
        d: 1
      },
      means_of_verification: null,
      locations: [],
      disaggregation: [],
      is_high_frequency: false,
      numerator_label: null,
      denominator_label: null
    };
    // @ts-ignore
    private clusterIndicatorCreateModel = {
      section: null,
      baseline: {
        v: 0,
        d: 1
      },
      target: {
        v: 0,
        d: 1
      },
      locations: [],
      cluster_indicator_id: null,
      cluster_indicator_title: null,
      cluster_name: null,
      response_plan_name: null,
      numerator_label: null,
      denominator_label: null
    };
    // @ts-ignore
    private clusterIndicatorEditModel = {
      id: null,
      section: null,
      baseline: {
        v: 0,
        d: 1
      },
      target: {
        v: 0,
        d: 1
      },
      locations: [],
      numerator_label: null,
      denominator_label: null
    };

    _validateAndSaveIndicator() {
      if (!this.validate()) {
        // @ts-ignore *Defined in component
        this.activeTab = 'details';
        this._centerDialog();
        return;
      }

      this._startSpinner();
      // @ts-ignore *Defined in component
      this.disableConfirmBtn = true;

      const endpoint = this.getEndpoint(this._getEndpointName(), {
        id: this._getIdForEndpoint()
      });
      const method = this.indicator.id ? 'PATCH' : 'POST';
      const body = this._getIndicatorBody();

      sendRequest({
        endpoint: endpoint,
        method: method,
        body: body
      })
        .then((resp: any) => {
          this._handleSaveIndicatorResponse(resp);
        })
        .catch((error: any) => {
          this._handleSaveIndicatorError(error);
        });
    }

    validate() {
      let valid = true;
      const sectionSelected = (this.shadowRoot!.querySelector('#sectionDropdw')! as PolymerElement & {
        validate(): boolean;
      }).validate();
      if (this.isCluster) {
        valid =
          (this.shadowRoot!.querySelector('#clusterIndicatorEl')! as PolymerElement & {
            validate(): boolean;
          }).validate() && sectionSelected;
      } else {
        valid =
          (this.shadowRoot!.querySelector('#nonClusterIndicatorEl')! as PolymerElement & {
            validate(): boolean;
          }).validate() && sectionSelected;
      }
      return valid;
    }

    _getIdForEndpoint() {
      return this.indicator.id ? this.indicator.id : this.actionParams.llResultId;
    }

    _getEndpointName() {
      return this.indicator.id ? 'getEditDeleteIndicator' : 'createIndicator';
    }

    _handleSaveIndicatorResponse(response: any) {
      this._stopSpinner();

      fireEvent(this, 'indicator-dialog-close', {
        indicatorData: response,
        actionParams: this.actionParams
      });
      (this.$.indicatorDialog as IndicatorDialogEl).opened = false;
    }

    _handleSaveIndicatorError(error: any) {
      this._stopSpinner();
      // @ts-ignore *Defined in component
      this.disableConfirmBtn = false;

      parseRequestErrorsAndShowAsToastMsgs(error, this.toastEventSource);
    }

    _getIndicatorBody() {
      const body = this._getIndicatorModelForSave();

      Object.assign(body, pick(this.indicator, keys(body)));

      this._prepareBaselineAndTarget(body);

      if (Object.prototype.hasOwnProperty.call(body, 'disaggregation')) {
        body.disaggregation = this._prepareDisaggregationIds();
      }
      if (this.isCluster && !body.id) {
        body.indicator = null;
      }

      if (body.indicator && body.indicator.unit === 'number') {
        body.indicator.display_type = 'number';
      }
      return body;
    }

    _prepareBaselineAndTarget(indicator: any) {
      if (!indicator.target || indicator.target.v === undefined || indicator.target.v === '') {
        indicator.target = {v: 0, d: 1};
      }
      if (!indicator.baseline || indicator.baseline.v === '' || indicator.baseline.v === undefined) {
        indicator.baseline = {v: null, d: 1};
      }
      if (indicator.indicator) {
        // is new non-cluster indic
        if (indicator.indicator.unit === 'number') {
          this._updateBaselineTargetD(indicator, 1);
          this._resetRatioLabels(indicator);
        } else if (indicator.indicator.display_type === 'percentage') {
          this._updateBaselineTargetD(indicator, 100);
          this._resetLabel(indicator);
        }
      }
    }

    _updateBaselineTargetD(indicator: any, d: number) {
      indicator.baseline.d = d;
      indicator.target.d = d;
    }
    _resetRatioLabels(indicator: any) {
      indicator.numerator_label = '';
      indicator.denominator_label = '';
    }
    _resetLabel(indicator: any) {
      indicator.label = '';
    }

    _prepareDisaggregationIds(): number[] {
      if (!this.disaggregations || !this.disaggregations.length) {
        return [];
      }
      // @ts-ignore *Defined in component
      this.disaggregations = this.disaggregations.filter(this._notEmptyDisaggregs);

      return this.disaggregations.map(function (item: {disaggregId: number}) {
        return item.disaggregId;
      });
    }

    _notEmptyDisaggregs(d: {disaggregId: number}): boolean {
      return !!d.disaggregId;
    }

    _getIndicatorModelForSave() {
      let modelName = this.isCluster ? 'clusterIndicator' : 'nonClusterIndicator';
      modelName += this.indicator.id ? 'EditModel' : 'CreateModel';
      return JSON.parse(JSON.stringify(this[modelName]));
    }
  }
  return SaveIndicatorClass;
}

export default SaveIndicatorMixin;
