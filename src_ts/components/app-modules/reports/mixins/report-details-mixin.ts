import {logWarn, logError} from 'etools-behaviors/etools-logging.js';
import EndpointsMixin from '../../../endpoints/endpoints-mixin';
import {fireEvent} from '../../../utils/fire-custom-event';
import {RootState} from '../../../../store';
import {isJsonStrMatch, copy} from '../../../utils/utils';
import {parseRequestErrorsAndShowAsToastMsgs} from '../../../utils/ajax-errors-parser.js';
import { Constructor, GenericObject, User } from '../../../../typings/globals.types';
import { PolymerElement } from '@polymer/polymer';
import { property } from '@polymer/decorators';

/**
 * @polymerMixin
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
function ReportDetailsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {

  class reportDetailsClass extends EndpointsMixin(baseClass) {

    @property({type: Object})
    report!: GenericObject;

    @property({type: Object})
    reportAttachment!: GenericObject;

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

    repDetailsStateChanged(state: RootState) {
      if (!isJsonStrMatch(this.currentUser, state.commonData!.currentUser)) {
        this.currentUser = copy(state.commonData!.currentUser);
      }
    }

    requestReportDetails(id: string) {
      if (!this.currentUser) {
        logWarn('Logged user data not init in Redux store.', this._logMsgPrefix);
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
        logError(errMsg, this._logMsgPrefix, error);
        parseRequestErrorsAndShowAsToastMsgs(error, this, true);
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
      this.fireRequest('reportAttachment', {reportId: reportId}).then((response: any) => {
        fireEvent(this, 'global-loading', {active: false, loadingSource: this._loadingMsgSource});

        if (!this._attachmentHasNullFields(response)) {
          this.set('reportAttachment', response);
        }

      }).catch((error: any) => {
        let errMsg = 'Report attachment request failed!';
        logError(errMsg, this._logMsgPrefix, error);
        if (error.status === 404) {
          // it means there is no attachment, which seems like a weird approach
        } else {
          parseRequestErrorsAndShowAsToastMsgs(error, this);
        }
        fireEvent(this, 'global-loading', {active: false, loadingSource: this._loadingMsgSource});
      });
    }

    _attachmentHasNullFields(att: any) {
      if (!att) {
        return true;
      }
      return (!att.file_name && !att.path);
    }

  };
  return reportDetailsClass;
}

export default ReportDetailsMixin;
