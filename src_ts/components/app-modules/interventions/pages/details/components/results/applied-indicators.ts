import {PolymerElement, html} from '@polymer/polymer';
import {createDynamicDialog} from '@unicef-polymer/etools-dialog/dynamic-dialog';
import RepeatableDataSetsMixin from '../../../../../../mixins/repeatable-data-sets-mixin';
import {fireEvent} from '../../../../../../utils/fire-custom-event';
import './applied-indicator.js';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {property} from '@polymer/decorators';
import EtoolsDialog from '@unicef-polymer/etools-dialog';
import {AppliedIndicatorEl} from './applied-indicator.js';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';

/**
 * @polymer
 * @customElement
 * @appliesMixin RepeatableDataSetsMixinMixin
 */
class AppliedIndicators extends RepeatableDataSetsMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        [hidden] {
          display: none !important;
        }

        applied-indicator {
          margin-right: -24px;
        }
      </style>
      <template is="dom-repeat" items="{{dataItems}}" as="indicator" index-as="indicatorIndex">
        <applied-indicator
          hidden$="[[_hideIndicator(indicator, showInactiveIndicators)]]"
          data-args$="[[indicatorIndex]]"
          on-edit-indicator="_editIndicator"
          on-delete-indicator="_openDeleteConfirmation"
          on-deactivate-indicator="_openDeactivateConfirmation"
          indicator="[[indicator]]"
          intervention-status="[[interventionStatus]]"
          edit-mode="[[editMode]]"
        >
        </applied-indicator>
      </template>
    `;
  }

  @property({type: String})
  _deleteEpName = 'getEditDeleteIndicator';

  @property({type: String})
  resultLinkIndex!: string;

  @property({type: Boolean})
  editMode!: boolean;

  @property({type: String})
  interventionStatus!: string;

  @property({type: Number})
  cpOutputId!: number;

  @property({type: Object})
  deactivateConfirmDialog!: EtoolsDialog;

  @property({type: Number})
  indicToDeactivateIndex!: number;

  @property({type: Boolean})
  showInactiveIndicators = false;

  private _onDeactivateHandler!: (...args: any[]) => any;

  ready() {
    super.ready();

    const deactivateDialog = document.querySelector('body')!.querySelector('etools-dialog#deactivateIndicatorDialog');
    if (deactivateDialog) {
      this.deactivateConfirmDialog = deactivateDialog as EtoolsDialog;
    } else {
      this._createDeactivateConfirmDialog();
    }
  }

  _hideIndicator(indicator: any, showInactiveIndicators: boolean) {
    if (!indicator.is_active) {
      return !showInactiveIndicators;
    }
    return false;
  }

  _createDeactivateConfirmDialog() {
    const dialogContent = document.createElement('div');
    dialogContent.innerHTML = 'Are you sure you want to deactivate this indicator?';
    this.deactivateConfirmDialog = createDynamicDialog({
      title: 'Deactivate confirmation',
      okBtnText: 'Deactivate',
      cancelBtnText: 'Cancel',
      size: 'md',
      content: dialogContent,
      id: 'deactivateIndicatorDialog'
    });
    document.querySelector('body')!.appendChild(this.deactivateConfirmDialog);
  }

  _editIndicator(event: CustomEvent) {
    const indicatorIndex = parseInt((event.target as AppliedIndicatorEl).getAttribute('data-args')!, 10);
    const llResultIndex = parseInt(this.resultLinkIndex, 10);
    const indicator = JSON.parse(JSON.stringify(this.dataItems[indicatorIndex]));

    const resultMap = {
      cpOutputId: this.cpOutputId,
      llResultIndex: llResultIndex,
      llResultId: indicator.lower_result,
      indicatorData: indicator,
      appliedIndicatorsIndex: indicatorIndex
    };
    fireEvent(this, 'open-indicator-dialog', resultMap);
  }

  _openDeactivateConfirmation(event: CustomEvent) {
    this.indicToDeactivateIndex = parseInt((event.target as AppliedIndicatorEl).getAttribute('data-args')!, 10);
    this._onDeactivateHandler = this._onDeactivateConfirmation.bind(this);
    this.deactivateConfirmDialog.addEventListener('close', this._onDeactivateHandler);
    this.deactivateConfirmDialog.opened = true;
  }

  _onDeactivateConfirmation(event: CustomEvent) {
    this.deactivateConfirmDialog.removeEventListener('close', this._onDeactivateHandler);

    if (!event.detail.confirmed) {
      this.indicToDeactivateIndex = -1;
      return;
    }
    const indicatorId = this.dataItems[this.indicToDeactivateIndex]
      ? this.dataItems[this.indicToDeactivateIndex].id
      : null;
    if (!indicatorId) {
      return;
    }
    const endpoint = this.getEndpoint('getEditDeleteIndicator', {
      id: indicatorId
    });
    sendRequest({
      method: 'PATCH',
      endpoint: endpoint,
      body: {
        is_active: false
      }
    })
      .then((resp: any) => {
        this._handleDeactivateResponse(resp);
      })
      .catch((error: any) => {
        this._handleDeactivateError(error);
      });
  }

  _handleDeactivateResponse(resp: any) {
    this.set(['dataItems', this.indicToDeactivateIndex], resp);
    this.indicToDeactivateIndex = -1;
  }

  _handleDeactivateError(err: any) {
    parseRequestErrorsAndShowAsToastMsgs(err, this);

    logError('Deactivate indicator error occurred.', 'applies-indicators', err);
    this.indicToDeactivateIndex = -1;
  }
}

window.customElements.define('applied-indicators', AppliedIndicators);
