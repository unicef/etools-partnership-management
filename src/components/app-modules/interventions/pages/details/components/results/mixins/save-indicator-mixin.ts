import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';
// @ts-ignore
import pick from 'lodash-es/pick';
// @ts-ignore
import keys from 'lodash-es/keys';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import EndpointsMixin from '../../../../../../../endpoints/endpoints-mixin';
import AjaxErrorsParserMixin from '../../../../../../../mixins/ajax-errors-parser-mixin';
import { fireEvent } from '../../../../../../../utils/fire-custom-event';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin AjaxErrorsParserMixin
 */
const SaveIndicatorMixin = dedupingMixin(
(superClass: any) => class extends EtoolsMixinFactory.combineMixins([
  EndpointsMixin,
  AjaxErrorsParserMixin,
], superClass) {
  [x: string]: any;

  static get properties() {
    return {
      nonClusterIndicatorCreateModel: {
        type: Object,
        value: {
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
        }
      },
      nonClusterIndicatorEditModel: {
        type: Object,
        value: {
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
        }
      },
      clusterIndicatorCreateModel: {
        type: Object,
        value: {
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
        }
      },
      clusterIndicatorEditModel: {
        type: Object,
        value: {
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
        }
      }
    };
  }

  _validateAndSaveIndicator() {
    if (!this.validate()) {
      this.activeTab = 'details';
      this._centerDialog();
      return;
    }

    this._startSpinner();
    this.disableConfirmBtn = true;

    let endpoint = this.getEndpoint(this._getEndpointName(), {id: this._getIdForEndpoint()});
    let method = this.indicator.id ? 'PATCH' : 'POST';
    let body = this._getIndicatorBody();
    let self = this;

    this.sendRequest({
      endpoint: endpoint,
      method: method,
      body: body
    }).then(function(resp: any) {
      self._handleSaveIndicatorResponse(resp);
    }).catch(function(error: any) {
      self._handleSaveIndicatorError(error);
    });
  }

  validate() {
    let valid = true;
    let sectionSelected = this.shadowRoot.querySelector('#sectionDropdw').validate();
    if (this.isCluster) {
      valid = this.shadowRoot.querySelector('#clusterIndicatorEl').validate() && sectionSelected;
    } else {
      valid = this.shadowRoot.querySelector('#nonClusterIndicatorEl').validate() && sectionSelected;
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
    this.$.indicatorDialog.opened = false;
  }

  _handleSaveIndicatorError(error: any) {
    this._stopSpinner();
    this.disableConfirmBtn = false;

    this.parseRequestErrorsAndShowAsToastMsgs(error, this.toastEventSource);
  }

  _getIndicatorBody() {
    let body = this._getIndicatorModelForSave();

    Object.assign(body, pick(this.indicator, keys(body)));

    this._prepareBaselineAndTarget(body);

    if (body.hasOwnProperty('disaggregation')) {
      body.disaggregation = this._prepareDisaggregations();
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
    if (!indicator.target || indicator.target.v === undefined
        || indicator.target.v === '') {
      indicator.target = {v: 0, d: 1};
    }
    if (!indicator.baseline || indicator.baseline.v === ''
        || indicator.baseline.v === undefined) {
      indicator.baseline = {v: null, d: 1};
    }
    if (indicator.indicator) { // is new non-cluster indic
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

  _prepareDisaggregations() {
    if (!this.disaggregations || !this.disaggregations.length) {
      return [];
    }
    this.disaggregations = this.disaggregations.filter(function(d) {
      return !!d.disaggregId;
    });
    return this.disaggregations.map(function(item) {
      return item.disaggregId;
    });
  }

  _getIndicatorModelForSave() {
    let modelName = this.isCluster ? 'clusterIndicator' : 'nonClusterIndicator';
    modelName += this.indicator.id ? 'EditModel' : 'CreateModel';
    return JSON.parse(JSON.stringify(this[modelName]));
  }

});

export default SaveIndicatorMixin;
