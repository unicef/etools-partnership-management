import {LitElement, property} from 'lit-element';
import {logWarn, logError} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {fireEvent} from '../../../utils/fire-custom-event';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {AnyObject, Constructor, User} from '@unicef-polymer/etools-types';
import pmpEdpoints from '../../../endpoints/endpoints';

/**
 * @polymerMixin
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
function ReportDetailsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class ReportDetailsClass extends EndpointsLitMixin(baseClass) {
    @property({type: Object})
    report: AnyObject | null = {};

    @property({type: Array})
    reportAttachments!: any[];

    @property({type: Object})
    currentUser!: User;

    @property({type: Array})
    reportActions = [
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
    ];

    @property({type: String})
    _loadingMsgSource = 'report-details';

    @property({type: String})
    _logMsgPrefix = 'report-details-behavior';

    requestReportDetails(id: string) {
      if (!this.currentUser) {
        logWarn('Logged user data not init in Redux store.', this._logMsgPrefix);
        return;
      }

      this.reportAttachments = [];

      fireEvent(this, 'global-loading', {
        message: 'Loading...',
        active: true,
        loadingSource: this._loadingMsgSource
      });

      this.fireRequest(pmpEdpoints, 'reportDetails', {reportId: id})
        .then((response: any) => {
          this.report = response;
          fireEvent(this, 'global-loading', {
            active: false,
            loadingSource: this._loadingMsgSource
          });
          // get report attachment
          this._getReportAttachment(response.id);
        })
        .catch((error: any) => {
          const errMsg = 'Reports details data request failed!';
          logError(errMsg, this._logMsgPrefix, error);
          parseRequestErrorsAndShowAsToastMsgs(error, this, true);
          fireEvent(this, 'global-loading', {
            active: false,
            loadingSource: this._loadingMsgSource
          });
        });
    }

    _getReportAttachment(reportId: string) {
      fireEvent(this, 'global-loading', {
        message: 'Loading...',
        active: true,
        loadingSource: this._loadingMsgSource
      });
      this.reportAttachments = [];
      this.fireRequest(pmpEdpoints, 'reportAttachments', {reportId: reportId})
        .then((response: any) => {
          fireEvent(this, 'global-loading', {
            active: false,
            loadingSource: this._loadingMsgSource
          });

          this.reportAttachments = response;
        })
        .catch((error: any) => {
          const errMsg = 'Report attachment request failed!';
          logError(errMsg, this._logMsgPrefix, error);
          if (error.status === 404) {
            // it means there is no attachment, which seems like a weird approach
          } else {
            parseRequestErrorsAndShowAsToastMsgs(error, this);
          }
          fireEvent(this, 'global-loading', {
            active: false,
            loadingSource: this._loadingMsgSource
          });
        });
    }
  }
  return ReportDetailsClass;
}

export default ReportDetailsMixin;
