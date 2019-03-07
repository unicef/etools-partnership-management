import { PolymerElement, html } from '@polymer/polymer';
import uniq from 'lodash-es/uniq';
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import 'etools-data-table/etools-data-table.js';
import EndpointsMixin from '../../../../../../../endpoints/endpoints-mixin';
import CommonMixin from '../../../../../../../mixins/common-mixin';
import AjaxErrorsParserMixin from '../../../../../../../mixins/ajax-errors-parser-mixin';
import { ResultLinkLowerResult, ExpectedResult } from '../../../../../../../../typings/intervention.types';
import { isEmptyObject } from '../../../../../../../utils/utils';
import { gridLayoutStyles } from '../../../../../../../styles/grid-layout-styles';


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin Common
 * @appliesMixin AjaxErrorsParser
 */
const HumanitarianReportingReqClusterMixins = EtoolsMixinFactory.combineMixins([
  EndpointsMixin,
  CommonMixin,
  AjaxErrorsParserMixin
], PolymerElement);

/**
 * @customElement
 * @polymer
 */
class HumanitarianReportingReqCluster extends HumanitarianReportingReqClusterMixins {
  [x: string]: any;
  static get template() {
    return html`
    ${gridLayoutStyles}
      <style include="data-table-styles">
        :host {
          display: block;
        }

        [hidden] {
          display: none !important;
        }
      </style>

      <div class="flex-c" hidden$="[[!reportingRequirements.length]]">
        <etools-data-table-header no-collapse
                                  no-title class="w100">
          <etools-data-table-column class="col-2">Frequency</etools-data-table-column>
          <etools-data-table-column class="flex-c">Due Dates</etools-data-table-column>
        </etools-data-table-header>
        <template is="dom-repeat" items="{{reportingRequirements}}">
          <etools-data-table-row no-collapse>
            <div slot="row-data">
              <span class="col-data col-2">[[getFrequencyForDisplay(item.frequency)]]</span>
              <span class="col-data flex-c">[[getDatesForDisplay(item.cs_dates)]]</span>
            </div>
          </etools-data-table-row>
        </template>
      </div>

      <div class="row-h" hidden$="[[!_empty(reportingRequirements)]]">
        There are no cluster humanitarian report requirements set.
      </div>
    `;
  }

  static get properties() {
    return {
      reportingRequirements: {
        type: Array,
        observer: 'reportingRequirementsChanged'
      },
      interventionId: {
        type: String,
        observer: 'interventionIdChanged'
      },
      requirementsCount: {
        type: Number,
        value: 0,
        notify: true
      },
      expectedResults: Array
    };
  }

  ready() {
    super.ready();
  }

  interventionIdChanged(newId: string) {
    if (!newId) {
      this.reportingRequirements = [];
      return;
    }

    let clusterIndicIds = this._getClusterIndicIds();
    if (isEmptyObject(clusterIndicIds)) {
      this.reportingRequirements = [];
      return;
    }

    this.fireRequest('hrClusterReportingRequirements', {}, {
      method: 'POST',
      body: {reportable_ids: clusterIndicIds}
    }).then((response: any) => {
      this.set('reportingRequirements', response);
    }).catch((error: any) => {
      this.logError('Failed to get hr cluster requirements from API!', 'humanitarian-reporting-req-cluster', error);
      this.parseRequestErrorsAndShowAsToastMsgs(error, this);
      this.reportingRequirements = [];
    });
  }

  _getClusterIndicIds() {
    if (isEmptyObject(this.expectedResults)) {
      return [];
    }
    let clusterIndicIds = [];
    this.expectedResults.forEach((r: ExpectedResult) => {
      return r.ll_results.forEach((llr: ResultLinkLowerResult) => {
        return llr.applied_indicators.forEach((i) => {
          if (i.cluster_indicator_id) {
            clusterIndicIds.push(i.cluster_indicator_id);
          }
        });
      });
    });

    return uniq(clusterIndicIds);
  }

  reportingRequirementsChanged(repReq: any) {
    this.set('requirementsCount', isEmptyObject(repReq) ? 0 : repReq.length);
  }

  getDatesForDisplay(dates: []) {
    if (!dates) {
      return '';
    }
    if (Array.isArray(dates)) {
      if (!dates.length) {
        return '';
      }
      let formatedDates = dates.map(d => this.getDateDisplayValue(d));
      return formatedDates.join(', ');
    } else {
      return this.getDateDisplayValue(dates);
    }
  }

  getFrequencyForDisplay(shortenFreq: string) {
    switch (shortenFreq) {
      case 'Wee':
        return 'Weekly';
      case 'Mon':
        return 'Monthly';
      case 'Qua':
        return 'Quarterly';
      case 'Csd':
        return 'Custom';
      default:
        return 'Custom';
    }
  }

  _empty(list: []) {
    return isEmptyObject(list);
  }
}

window.customElements.define('humanitarian-reporting-req-cluster', HumanitarianReportingReqCluster);
