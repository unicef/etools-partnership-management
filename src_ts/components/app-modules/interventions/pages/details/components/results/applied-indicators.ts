import { PolymerElement, html } from '@polymer/polymer';
import {DynamicDialogMixin} from 'etools-dialog/dynamic-dialog-mixin.js';
import RepeatableDataSetsMixin from '../../../../../../mixins/repeatable-data-sets-mixin';
import { PolymerElEvent } from '../../../../../../../typings/globals.types';
import { fireEvent } from '../../../../../../utils/fire-custom-event';
import './applied-indicator.js';
import {logError} from 'etools-behaviors/etools-logging.js';


/**
  * @polymer
  * @customElement
  * @appliesMixin DynamicDialogMixin
  * @appliesMixin RepeatableDataSetsMixin
  */
class AppliedIndicators extends (DynamicDialogMixin(RepeatableDataSetsMixin(PolymerElement))) {
  [x: string]: any;

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
      <template is="dom-repeat"
                items="{{dataItems}}"
                as="indicator" index-as="indicatorIndex">
        <applied-indicator hidden$="[[_hideIndicator(indicator, showInactiveIndicators)]]"
                          data-args$="[[indicatorIndex]]"
                          on-edit-indicator="_editIndicator"
                          on-delete-indicator="_openDeleteConfirmation"
                          on-deactivate-indicator="_openDeactivateConfirmation"
                          indicator="[[indicator]]"
                          intervention-status="[[interventionStatus]]"
                          edit-mode="[[editMode]]">
        </applied-indicator>
      </template>
    `;
  }

  static get properties() {
    return {
      _deleteEpName: {
        type: String,
        value: 'getEditDeleteIndicator',
        readOnly: true
      },
      resultLinkIndex: Number,
      editMode: Boolean,
      interventionStatus: String,
      cpOutputId: Number,
      deactivateConfirmDialog: Object,
      indicToDeactivateIndex: String,
      showInactiveIndicators: Boolean
    };
  }

  ready() {
    super.ready();

    let deactivateDialog = document.querySelector('body')!
        .querySelector('etools-dialog#deactivateIndicatorDialog');
    if (deactivateDialog) {
      this.deactivateConfirmDialog = deactivateDialog;
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
    let dialogContent = document.createElement('div');
    dialogContent.innerHTML = 'Are you sure you want to deactivate this indicator?';
    this.deactivateConfirmDialog = this.createDynamicDialog({
      title: 'Deactivate confirmation',
      okBtnText: 'Deactivate',
      cancelBtnText: 'Cancel',
      size: 'md',
      content: dialogContent,
      id: 'deactivateIndicatorDialog'
    });
    document.querySelector('body')!.appendChild(this.deactivateConfirmDialog);
  }

  _editIndicator(event: PolymerElEvent) {
    let indicatorIndex = parseInt(event.target.getAttribute('data-args'), 10);
    let llResultIndex = parseInt(this.resultLinkIndex, 10);
    let indicator = JSON.parse(JSON.stringify(this.dataItems[indicatorIndex]));

    let resultMap = {
      cpOutputId: this.cpOutputId,
      llResultIndex: llResultIndex,
      llResultId: indicator.lower_result,
      indicatorData: indicator,
      appliedIndicatorsIndex: indicatorIndex
    };
    fireEvent(this, 'open-indicator-dialog', resultMap);
  }

  _openDeactivateConfirmation(event: PolymerElEvent) {
    this.indicToDeactivateIndex = parseInt(event.target.getAttribute('data-args'), 10);
    this.onDeactivateHandler = this._onDeactivateConfirmation.bind(this);
    this.deactivateConfirmDialog.addEventListener('close', this.onDeactivateHandler);
    this.deactivateConfirmDialog.opened = true;
  }

  _onDeactivateConfirmation(event: CustomEvent) {
    this.deactivateConfirmDialog.removeEventListener('close', this.onDeactivateHandler);

    if (!event.detail.confirmed) {
      this.indicToDeactivateIndex = -1;
      return;
    }
    let indicatorId = this.dataItems[this.indicToDeactivateIndex]
        ? this.dataItems[this.indicToDeactivateIndex].id
        : null;
    if (!indicatorId) {
      return;
    }
    let self = this;
    let endpoint = this.getEndpoint('getEditDeleteIndicator', {id: indicatorId});
    this.sendRequest({
      method: 'PATCH',
      endpoint: endpoint,
      body: {
        is_active: false
      }
    }).then(function(resp: any) {
      self._handleDeactivateResponse(resp);
    }).catch(function(error: any) {
      self._handleDeactivateError(error.response);
    });
  }

  _handleDeactivateResponse(resp: any) {
    this.set(['dataItems', this.indicToDeactivateIndex], resp);
    this.indicToDeactivateIndex = -1;
  }

  _handleDeactivateError(err: any) {
    fireEvent(this, 'toast', {text: 'Deactivate indicator error occurred', showCloseBtn: true});
    logError('Deactivate indicator error occurred.', 'applies-indicators', err);
    this.indicToDeactivateIndex = -1;
  }
}

window.customElements.define('applied-indicators', AppliedIndicators);
