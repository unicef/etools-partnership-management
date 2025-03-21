import {LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {AnyObject, Constructor, User} from '@unicef-polymer/etools-types';
import pmpEdpoints from '../../../endpoints/endpoints';
import {get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';

/**
 * @LitElementMixin
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
        label: getTranslation('ACCEPT'),
        primary: true,
        event: 'accept-report'
      },
      {
        label: getTranslation('SEND_BACK_TO_PARTNER'),
        event: 'send-back-to-partner'
      },
      {
        label: getTranslation('DOWNLOAD'),
        event: 'download-report'
      }
    ];

    @property({type: String})
    _loadingMsgSource = 'report-details';

    @property({type: String})
    _logMsgPrefix = 'report-details-behavior';

    requestReportDetails(id: string) {
      if (!this.currentUser) {
        EtoolsLogger.warn('Logged user data not init in Redux store.', this._logMsgPrefix);
        return;
      }

      this.reportAttachments = [];

      fireEvent(this, 'global-loading', {
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
          EtoolsLogger.error(errMsg, this._logMsgPrefix, error);
          parseRequestErrorsAndShowAsToastMsgs(error, this, true);
          fireEvent(this, 'global-loading', {
            active: false,
            loadingSource: this._loadingMsgSource
          });
        });
    }

    _getReportAttachment(reportId: string) {
      fireEvent(this, 'global-loading', {
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
          EtoolsLogger.error(errMsg, this._logMsgPrefix, error);
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
