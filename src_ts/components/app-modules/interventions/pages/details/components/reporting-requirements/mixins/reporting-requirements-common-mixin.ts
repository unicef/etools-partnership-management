import {EtoolsMixinFactory} from 'etools-behaviors/etools-mixin-factory';
import EndpointsMixin from '../../../../../../../endpoints/endpoints-mixin';
import CONSTANTS from '../../../../../../../../config/app-constants';
import { isEmptyObject } from '../../../../../../../utils/utils';
import {logError} from 'etools-behaviors/etools-logging.js';
import {parseRequestErrorsAndShowAsToastMsgs} from "../../../../../../../utils/ajax-errors-parser";


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
const ReportingRequirementsCommonMixin =
    (baseClass: any) => class extends EtoolsMixinFactory.combineMixins([
      EndpointsMixin,
    ], baseClass) {
      [x: string]: any;

  static get properties() {
    return {
      reportingRequirements: {
        type: Array,
        value: []
      },
      requirementsCount: {
        type: Number,
        value: 0,
        notify: true
      },
      interventionId: {
        type: Number,
        observer: '_interventionIdChanged'
      }
    };
  }

  static get observers() {
    return [
      '_countReportingReq(reportingRequirements.length)'
    ];
  }

  _getEndpointObj(id: string, type: string) {
    if (type === CONSTANTS.REQUIREMENTS_REPORT_TYPE.SPECIAL) {
      return this.getEndpoint('specialReportingRequirements', {intervId: id});
    }

    return this.getEndpoint('reportingRequirements', {
      intervId: id,
      reportType: type
    });
  }

  _interventionIdChanged(newId: string) {
    if (!newId) {
      this.reportingRequirements = [];
      return;
    }
    let type = this._getReportType();
    let endpoint = this._getEndpointObj(newId, type);
    this.sendRequest({method: 'GET', endpoint: endpoint})
        .then((response: any) => {
          this.set('reportingRequirements',
              (type === CONSTANTS.REQUIREMENTS_REPORT_TYPE.SPECIAL)
                  ? response
                  : response.reporting_requirements);
        })
        .catch((error: any) => {
          logError('Failed to get qpr data from API!',
              'reporting-requirements-common-mixin', error);
          parseRequestErrorsAndShowAsToastMsgs(error, this);
        });
  }

  _countReportingReq(length: number) {
    let l = (typeof length === 'number') ? length : 0;
    this.set('requirementsCount', l);
    if (typeof this._sortRequirementsAsc === 'function' && l > 0) {
      this._sortRequirementsAsc();
    }
  }

  _getIndex(index: number) {
    return index + 1;
  }

  _empty(list: []) {
    return isEmptyObject(list);
  }

  _onReportingRequirementsSaved(e: CustomEvent) {
    this.set('reportingRequirements', e.detail);
  }

};

export default ReportingRequirementsCommonMixin;
