  import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
  import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import EndpointsMixin from '../../../endpoints/endpoints-mixin';
import AjaxErrorsParserMixin from '../../../mixins/ajax-errors-parser-mixin';
import { fireEvent } from '../../../utils/fire-custom-event';
import { RootState } from '../../../../store';
import { isJsonStrMatch, copy } from '../../../utils/utils';


  /**
   * @polymerMixin
   * @mixinFunction
   * @appliesMixin EtoolsLogsMixin
   * @appliesMixin EndpointsMixin
   * @appliesMixin AjaxErrorsParserMixin
   */
  const ReportDetailsMixin = (superclass: any) => class extends EtoolsMixinFactory.combineMixins([
  EtoolsLogsMixin,
  EndpointsMixin,
  AjaxErrorsParserMixin
  ], superclass) {
    [x: string]: any;

  static get properties() {
    return {
      report: Object,
      reportAttachment: Object,
      currentUser: {
        type: Object,
        statePath: 'currentUser'
      },
      reportActions: {
        type: Array,
        value: [
          {
            label: 'Accept',
            primary: true,
            event: 'accept-report'
          },
          {
            label: 'Send back to partner',
            event: 'send-back-to-partner'
          },
          {
            label: 'Download',
            event: 'download-report'
          }
        ]
      },
      _loadingMsgSource: {
        type: String,
        value: 'report-details'
      },
      _logMsgPrefix: {
        type: String,
        value: 'report-details-behavior'
      }
    };
  }

  repDetailsStateChanged(state: RootState) {
    if (!isJsonStrMatch(this.currentUser, state.commonData!.currentUser)) {
      this.currentUser = copy(state.commonData!.currentUser);
    }
  }

  requestReportDetails(id: string) {
    if (!this.currentUser) {
      this.logWarn('Logged user data not init in Redux store.', this._logMsgPrefix);
      return;
    }

    this.set('reportAttachment', null);

    fireEvent(this, 'global-loading', {
      message: 'Loading...',
      active: true,
      loadingSource: this._loadingMsgSource
    });

    this.fireRequest('reportDetails', {reportId: id}).then((response: any) => {
      this.set('report', response);
      fireEvent(this, 'global-loading', {active: false, loadingSource: this._loadingMsgSource});
      // get report attachment
      this._getReportAttachment(response.id);
    }).catch((error: any) => {
      let errMsg = 'Reports details data request failed!';
      this.logError(errMsg, this._logMsgPrefix, error);
      this.parseRequestErrorsAndShowAsToastMsgs(error, this, true);
      fireEvent(this, 'global-loading', {active: false, loadingSource: this._loadingMsgSource});
    });
  }

  _getReportAttachment(reportId: string) {
    fireEvent(this, 'global-loading', {
      message: 'Loading...',
      active: true,
      loadingSource: this._loadingMsgSource
    });
    this.set('reportAttachment', null);
    this.fireRequest('reportAttachment', {reportId: reportId}).then((response) => {
      fireEvent(this, 'global-loading', {active: false, loadingSource: this._loadingMsgSource});

      if (!this._attachmentHasNullFields(response)) {
        this.set('reportAttachment', response);
      }

    }).catch((error: any) => {
      let errMsg = 'Report attachment request failed!';
      this.logError(errMsg, this._logMsgPrefix, error);
      if (error.status === 404) {
        // it means there is no attachment, which seems like a weird approach
      } else {
        this.parseRequestErrorsAndShowAsToastMsgs(error, this);
      }
      fireEvent(this, 'global-loading', {active: false, loadingSource: this._loadingMsgSource});
    });
  }

  _attachmentHasNullFields(att) {
    if (!att) {
      return true;
    }
    return (!att.file_name && !att.path);
  }

};

 export default ReportDetailsMixin;
