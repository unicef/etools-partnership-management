import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';

import 'etools-data-table/etools-data-table.js';
import 'etools-content-panel/etools-content-panel.js';
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
import {EtoolsMixinFactory} from 'etools-behaviors/etools-mixin-factory';
import {DynamicDialogMixin} from 'etools-dialog/dynamic-dialog-mixin.js';

import '../../../../layout/icons-actions.js';
import './components/attachment-dialog.js';
import EndpointsMixin from '../../../../endpoints/endpoints-mixin.js';
import AjaxErrorsParserMixin from '../../../../mixins/ajax-errors-parser-mixin.js';
import CommonMixin from '../../../../mixins/common-mixin.js';
import { fireEvent } from '../../../../utils/fire-custom-event.js';
import { InterventionAttachment } from '../../../../../typings/intervention.types.js';
import CONSTANTS from '../../../../../config/app-constants.js';
import { PolymerElEvent } from '../../../../../typings/globals.types.js';
import { pageCommonStyles } from '../../../../styles/page-common-styles.js';
import { gridLayoutStyles } from '../../../../styles/grid-layout-styles.js';
import { SharedStyles } from '../../../../styles/shared-styles.js';
import { etoolsCpHeaderActionsBarStyles } from '../../../../styles/etools-cp-header-actions-bar-styles.js';
import { connect } from 'pwa-helpers/connect-mixin';
import { store } from '../../../../../store.js';
import { RootState } from '../../../../../store.js';
import { isJsonStrMatch } from '../../../../utils/utils.js';


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin DynamicDialogMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin AjaxErrorsParserMixin
 * @appliesMixin CommonMixin
 */
const InterventionAttachmentsMixins = EtoolsMixinFactory.combineMixins([
  EtoolsLogsMixin,
  DynamicDialogMixin,
  EndpointsMixin,
  AjaxErrorsParserMixin,
  CommonMixin,
], PolymerElement);

/**
 * @polymer
 * @customElement
 * @appliesMixin InterventionAttachmentsMixins
 */
class InterventionAttachments extends connect(store)(InterventionAttachmentsMixins) {
  [x: string]: any;

  static get template() {
    return html`
      ${pageCommonStyles} ${gridLayoutStyles} ${SharedStyles} ${etoolsCpHeaderActionsBarStyles}
      <style include="data-table-styles">
        :host {
          display: block;

          --ecp-content: {
            padding: 0;
            overflow: hidden;
          };
        }

        .attachment {
          margin-right: 8px;
        }

        iron-icon {
          color: var(--dark-icon-color);
        }

        icons-actions {
          visibility: hidden;
        }

        etools-data-table-row:hover icons-actions {
          visibility: visible;
        }
      </style>

      <etools-content-panel class="content-section" panel-title$="Attachments ([[attachments.length]])">
        <div slot="panel-btns" class="cp-header-actions-bar" hidden$="[[newIntervention]]">
          <paper-toggle-button id="showInvalid"
                              checked="{{showInvalid}}">
            Show invalid
          </paper-toggle-button>
          <div class="separator" hidden$="[[!permissions.edit.attachments]]">
          </div>
          <paper-icon-button icon="add-box"
                            disabled="[[!permissions.edit.attachments]]"
                            hidden$="[[!permissions.edit.attachments]]"
                            title="Add"
                            on-tap="_addAttachment">
          </paper-icon-button>
        </div>

        <template is="dom-if" if="[[_showAttachmentsList(attachments.length)]]">
          <etools-data-table-header no-collapse no-title>
            <etools-data-table-column class="col-2">
              Date Uploaded
            </etools-data-table-column>
            <etools-data-table-column class="col-3">
              Document Type
            </etools-data-table-column>
            <etools-data-table-column class="col-6">
              Document
            </etools-data-table-column>
            <etools-data-table-column class="col-1 center-align">
              Invalid
            </etools-data-table-column>
          </etools-data-table-header>

          <template is="dom-repeat" items="[[attachments]]">
            <etools-data-table-row secondary-bg-on-hover no-collapse hidden$="[[!_isVisible(item.active, showInvalid)]]">
              <div slot="row-data" class="p-relative">
                <span class="col-data col-2">
                  [[prettyDate(item.created)]]
                </span>
                <span class="col-data col-3">
                  [[_getAttachmentType(item.type)]]
                </span>
                <span class="col-data col-6">
                  <iron-icon icon="attachment" class="attachment"></iron-icon>
                  <span class="break-word file-label">
                    <!-- target="_blank" is there for IE -->
                    <a href$="[[item.attachment_document]]" target="_blank" download>
                      [[getFileNameFromURL(item.attachment_document)]]
                    </a>
                  </span>
                </span>
                <span class="col-data col-1 center-align">
                  <span hidden$="[[!item.active]]" class="placeholder-style">&#8212;</span>
                  <iron-icon icon="check" hidden$="[[item.active]]"></iron-icon>
                </span>
                <icons-actions item-id$="[[item.id]]"
                                hidden$="[[!permissions.edit.attachments]]"
                                show-delete="[[_canDeleteAttachments(interventionStatus)]]"
                                show-edit="[[_canEditAttachments(interventionStatus)]]"
                                on-edit="_editAttachment"
                                on-delete="_confirmAttachmentDelete">
                </icons-actions>
              </div>
            </etools-data-table-row>
          </template>
        </template>

        <template is="dom-if" if="[[!_showAttachmentsList(attachments.length)]]">
          <div class="row-h">
            <p hidden$="[[newIntervention]]">There are no attachments added.</p>
            <p hidden$="[[!newIntervention]]">You must save this PD/SSFA before you can add attachments.</p>
          </div>
        </template>

    </etools-content-panel>
    `;
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      permissions: {
        type: Object,
        statePath: 'pageData.permissions'
      },
      interventionId: {
        type: Number,
        observer: '_interventionIdChanged'
      },
      interventionStatus: {
        type: String
      },
      attachments: {
        type: Array,
        value: []
      },
      fileTypes: {
        type: Array,
        statePath: 'fileTypes'
      },
      showInvalid: {
        type: Boolean,
        value: false
      },
      newIntervention: {
        type: Boolean,
        value: false
      },
      attachmentDialog: Object,
      attDeleteConfirmDialog: Object,
      attMarkedToBeDeleted: Object
    };
  }

  static get observers() {
    return [
      '_checkEmptyFileTypesData(fileTypes, active)'
    ];
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.fileTypes, state.commonData!.fileTypes)) {
      this.fileTypes = [...state.commonData!.fileTypes];
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._createAttachmentDialog();
    this._createDeleteConfirmation();
    /**
     * Disable loading message for attachments tab elements load,
     * triggered by parent element on stamp or by tap event on tabs
     */
    fireEvent(this, 'global-loading', {active: false, loadingSource: 'interv-page'});
    fireEvent(this, 'tab-content-attached');
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeAttachmentDialog();
    this._removeDeleteConfirmationDialog();
  }

  _createDeleteConfirmation() {
    this.deleteAttachment = this.deleteAttachment.bind(this);
    const warnDeleteAttachment = document.createElement('span');
    warnDeleteAttachment.innerHTML = 'Are you sure you want to delete this attachment?';
    // this.attDeleteConfirmDialog = this.createDialog(null, 'md', 'Yes', 'No', null, warnDeleteAttachment);
    this.attDeleteConfirmDialog = this.createDynamicDialog({
      title: null,
      size: 'md',
      okBtnText: 'Yes',
      cancelBtnText: 'No',
      closeCallback: this.deleteAttachment,
      content: warnDeleteAttachment
    });
  }

  _removeDeleteConfirmationDialog() {
    if (this.attDeleteConfirmDialog) {
      this.attDeleteConfirmDialog.removeEventListener('close', this.deleteAttachment);
      document.querySelector('body')!.removeChild(this.attDeleteConfirmDialog);
    }
  }

  _createAttachmentDialog() {
    this.attachmentDialog = document.createElement('attachment-dialog');
    this.attachmentDialog.setAttribute('id', 'addAmendmentDialog');
    this.attachmentDialog.toastEventSource = this;
    this.attachmentDialog.fileTypes = this.fileTypes;

    this.newAttachmentAdded = this.newAttachmentAdded.bind(this);
    this.newAttachmentUpdated = this.newAttachmentUpdated.bind(this);
    this.attachmentDialog.addEventListener('attachment-added', this.newAttachmentAdded);
    this.attachmentDialog.addEventListener('attachment-updated', this.newAttachmentUpdated);
    document.querySelector('body')!.appendChild(this.attachmentDialog);
  }

  _removeAttachmentDialog() {
    if (this.attachmentDialog) {
      this.attachmentDialog.removeEventListener('attachment-added', this.newAttachmentAdded);
      this.attachmentDialog.removeEventListener('attachment-updated', this.newAttachmentUpdated);
      document.querySelector('body')!.removeChild(this.attachmentDialog);
    }
  }

  newAttachmentAdded(e: CustomEvent) {
    this.push('attachments', e.detail);
  }

  _updateAttachments(attachment: InterventionAttachment, deleteAction?: boolean) {
    const attachments = JSON.parse(JSON.stringify(this.attachments));
    const attachmentIdx = attachments.findIndex((a: InterventionAttachment) => a.id === attachment.id);
    if (attachmentIdx > -1) {
      if (deleteAction) {
        attachments.splice(attachmentIdx, 1);
      } else {
        attachments.splice(attachmentIdx, 1, attachment);
      }
    }
    this.set('attachments', attachments);
  }

  newAttachmentUpdated(e: CustomEvent) {
    this._updateAttachments(e.detail);
  }

  _showAttachmentsList(length: number) {
    return length > 0;
  }

  _checkEmptyFileTypesData(fileTypes: [], active: boolean) {
    if (typeof fileTypes === 'undefined') {
      return;
    }
    if (active && !fileTypes.length) {
      // there are no file types in the current workspace
      fireEvent(this, 'toast', {
        text: 'File Type data required to save attachments is missing from current workspace!',
        showCloseBtn: true
      });
    }
  }

  _interventionIdChanged(id: string) {
    if (!id || isNaN(parseInt(id, 10))) {
      this.set('attachments', []);
      return;
    }
    // get attachments
    fireEvent(this, 'global-loading', {
      message: 'Loading...',
      active: true,
      loadingSource: 'pd-attachments'
    });
    this.sendRequest({
      endpoint: this.getEndpoint('pdAttachments', {pdId: id})
    }).then((response: any) => {
      this.set('attachments', response);
    }).catch((error: any) => {
      this.logError('Error during pd attachments fetch.', 'pd-attachments', error);
      this.parseRequestErrorsAndShowAsToastMsgs(error);
    }).then(() => {
      fireEvent(this, 'global-loading', {
        active: false,
        loadingSource: 'pd-attachments'
      });
    });
  }

  _addAttachment() {
    if (this.attachmentDialog) {
      this.attachmentDialog.interventionId = this.interventionId;
      this.attachmentDialog.initAttachment();
      this.attachmentDialog.opened = true;
    }
  }

  _editAttachment(e: PolymerElEvent) {
    if (this.attachmentDialog) {
      this.attachmentDialog.interventionId = this.interventionId;
      const editedAttachment = this.attachments.find((a: InterventionAttachment) => a.id === Number(e.target.getAttribute('item-id')));
      this.attachmentDialog.initAttachment(editedAttachment);
      this.attachmentDialog.opened = true;
    }
  }

  _confirmAttachmentDelete(e: CustomEvent) {
    if (e.target !== null) {
      this.attMarkedToBeDeleted = this.attachments
          .find((a: InterventionAttachment) => a.id === Number((e.target as any).getAttribute('item-id')));
      if (this.attMarkedToBeDeleted) {
        this.attDeleteConfirmDialog.opened = true;
      }
    }
  }

  deleteAttachment(e: CustomEvent) {
    if (e.detail.confirmed && this.attMarkedToBeDeleted && this.attMarkedToBeDeleted.id) {
      // delete from server
      fireEvent(this, 'global-loading', {
        message: 'Loading...',
        active: true,
        loadingSource: 'pd-attachments-delete'
      });
      this.sendRequest({
        method: 'DELETE',
        endpoint: this.getEndpoint('updatePdAttachment', {attId: this.attMarkedToBeDeleted.id})
      }).then((_response: any) => {
        this._updateAttachments(this.attMarkedToBeDeleted, true);
      }).catch((error: any) => {
        this.logError('Error during pd attachment delete.', 'pd-attachments', error);
        this.parseRequestErrorsAndShowAsToastMsgs(error);
      }).then(() => {
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'pd-attachments-delete'
        });
        this.attMarkedToBeDeleted = null;
      });
    }
  }

  _getAttachmentType(type: string) {
    const fileTypes = this.fileTypes instanceof Array === false ? [] : this.fileTypes;
    const attachmentType = fileTypes.find((t: any) => t.id === type);
    return attachmentType ? attachmentType.name : '—';
  }

  _isVisible(active: boolean, showInvalid: boolean) {
    return active || showInvalid;
  }

  _canDeleteAttachments(status: string) {
    return status === CONSTANTS.STATUSES.Draft.toLowerCase();
  }

  _canEditAttachments(status: string) {
    return status !== CONSTANTS.STATUSES.Closed.toLowerCase() &&
        status !== CONSTANTS.STATUSES.Terminated.toLowerCase();
  }
}

window.customElements.define('intervention-attachments', InterventionAttachments);
