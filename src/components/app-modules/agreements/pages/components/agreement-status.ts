import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-icons/av-icons.js';
import CONSTANTS from '../../../../../config/app-constants';

import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import EtoolsStatusCommonMixin from '../../../../layout/etools-status/etools-status-common-mixin';
import EventHelperMixin from '../../../../mixins/event-helper-mixin';
import '../../../../mixins/event-helper-mixin.js';
import '../../../../layout/etools-status/etools-status.js';
import '../../../../layout/etools-status/etools-status-common-mixin.js';



/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsPmpApp.Mixins.EventHelper
 * @appliesMixin EtoolsPmpApp.Mixins.EtoolsStatusCommon
 * @appliesMixin EtoolsPmpApp.Mixins.Constants
 */
const AgreementStatusRequiredMixins = EtoolsMixinFactory.combineMixins([
  EventHelperMixin,
  EtoolsStatusCommonMixin
], PolymerElement);


/**
 * @polymer
 * @customElement
 * @appliesMixin AgreementStatusRequiredMixins
 */
class AgreementStatus extends AgreementStatusRequiredMixins {
  static get template() {
    return html`
        <style>
          :host {
            width: 100%;
          }
        </style>
        <etools-status statuses="[[possibleStatuses]]"
                      actions="[[possibleActions]]"
                      on-agreement-suspend-event="_setStatusSuspended"
                      on-agreement-terminate-event="_setStatusTerminated"
                      on-agreement-unsuspend-event="_unsuspendAgreement"
                      on-agreement-delete-event="_openDeleteConfirmation">
        </etools-status>
    `;
  }

  static get properties() {
    return {
      agreementId: {
        value: null
      },
      agreementType: {
        type: String,
        value: ''
      },
      newAgreement: {
        type: Boolean,
        value: false
      },
      possibleStatuses: {
        type: Array,
        value: []
      },
      possibleActions: {
        type: Array,
        value: [
          {
            label: 'Save',
            hidden: true,
            primary: true,
            event: 'save-agreement'
            // save-agreement event is handeled by the parnent
          },
          {
            label: 'Suspend',
            hidden: true,
            event: 'agreement-suspend-event'
          },
          {
            label: 'Unsuspend',
            hidden: true,
            event: 'agreement-unsuspend-event'
          },
          {
            label: 'Terminate',
            hidden: true,
            event: 'agreement-terminate-event'
          },
          {
            label: 'Delete',
            hidden: true,
            event: 'agreement-delete-event'
          }
        ]
      },
      deleteWarningMessage: {
        type: String,
        value: 'Are you sure you want to delete this agreement?'
      }
    };
  }

  static get observers() {
    return [
      '_handleStatusChange(status, agreementId)'
    ];
  }

  ready() {
    super.ready();
    this.set('sectionName', 'Agreement');
    this._handleStickyScroll();

    this._createStatusChangeWarningDialog();
    this._createDeleteConfirmationDialog();

    this._triggerAgDeleteOnConfirm = this._triggerAgDeleteOnConfirm.bind(this);
    this.deleteConfirmDialog.addEventListener('close', this._triggerAgDeleteOnConfirm);

    // has to be run async for shadycss to load
    setTimeout(this.setPossibleStatuses.bind(this), 0);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.deleteConfirmDialog.removeEventListener('close', this._triggerAgDeleteOnConfirm);
  }

  setPossibleStatuses() {
    this.set('possibleStatuses', [
      {
        label: CONSTANTS.STATUSES.Draft,
        hidden: false,
        completed: false
      },
      {
        label: CONSTANTS.STATUSES.Signed,
        hidden: false,
        completed: false
      },
      {
        label: CONSTANTS.STATUSES.Suspended,
        icon: 'av:pause-circle-filled',
        iconStyles: 'color: ' + this.getComputedStyleValue('--warning-color'),
        hidden: false,
        completed: false
      },
      {
        label: CONSTANTS.STATUSES.Terminated,
        icon: 'report-problem',
        iconStyles: 'color: ' + this.getComputedStyleValue('--error-color'),
        hidden: false,
        completed: false
      },
      {
        label: CONSTANTS.STATUSES.Ended,
        hidden: false,
        completed: false
      }
    ]);

    this._computeAvailableStatuses(this.status);
  }

  _computeAvailableActions(status: string) {
    this._setAllActionsToHidden();
    if (!this.editMode) {
      return;
    }
    let availableOptions = [];

    switch (status) {
      case CONSTANTS.STATUSES.Draft.toLowerCase():
        availableOptions.push('Save');
        availableOptions.push('Delete');
        break;
      case CONSTANTS.STATUSES.Signed.toLowerCase():
        availableOptions.push('Save');
        if (this.agreementType !== CONSTANTS.AGREEMENT_TYPES.SSFA) {
          availableOptions.push('Suspend');
          availableOptions.push('Terminate');
        }
        break;

      case CONSTANTS.STATUSES.Suspended.toLowerCase():
        if (this.agreementType !== CONSTANTS.AGREEMENT_TYPES.SSFA) {
          availableOptions.push('Unsuspend');
        }
        break;

      case CONSTANTS.STATUSES.Terminated.toLowerCase():
        break;

      case CONSTANTS.STATUSES.Ended.toLowerCase():
        break;

      default:
        availableOptions.push('Save');
        break;
    }

    for (let key in this.possibleActions) {
      if (this.possibleActions[key].label) {
        let actionName = this.possibleActions[key].label;

        if (availableOptions.indexOf(actionName) > -1) {
          this.set(['possibleActions', key, 'hidden'], false);
        }
      }
    }
  }

  _computeAvailableStatuses(status) {
    this._setAllStatusesToHidden();
    let availableStatuses = [];
    let completedFlag = false;
    let activeStatus;

    switch (status) {
      case CONSTANTS.STATUSES.Draft.toLowerCase():
        availableStatuses = [
          CONSTANTS.STATUSES.Draft,
          CONSTANTS.STATUSES.Signed,
          CONSTANTS.STATUSES.Ended
        ];
        activeStatus = CONSTANTS.STATUSES.Draft;
        break;

      case CONSTANTS.STATUSES.Signed.toLowerCase():
        availableStatuses = [
          CONSTANTS.STATUSES.Draft,
          CONSTANTS.STATUSES.Signed,
          CONSTANTS.STATUSES.Ended
        ];
        activeStatus = CONSTANTS.STATUSES.Signed;
        break;

      case CONSTANTS.STATUSES.Suspended.toLowerCase():
        availableStatuses = [
          CONSTANTS.STATUSES.Draft,
          CONSTANTS.STATUSES.Signed,
          CONSTANTS.STATUSES.Suspended,
          CONSTANTS.STATUSES.Ended
        ];
        activeStatus = CONSTANTS.STATUSES.Suspended;
        break;

      case CONSTANTS.STATUSES.Terminated.toLowerCase():
        availableStatuses = [
          CONSTANTS.STATUSES.Draft,
          CONSTANTS.STATUSES.Signed,
          CONSTANTS.STATUSES.Terminated,
          CONSTANTS.STATUSES.Ended
        ];
        activeStatus = CONSTANTS.STATUSES.Terminated;
        break;

      case CONSTANTS.STATUSES.Ended.toLowerCase():
        availableStatuses = [
          CONSTANTS.STATUSES.Draft,
          CONSTANTS.STATUSES.Signed,
          CONSTANTS.STATUSES.Ended
        ];
        activeStatus = CONSTANTS.STATUSES.Ended;
        break;
      default:
        availableStatuses = [
          CONSTANTS.STATUSES.Draft,
          CONSTANTS.STATUSES.Signed,
          CONSTANTS.STATUSES.Ended
        ];
        activeStatus = '';
        break;
    }

    for (let key = this.possibleStatuses.length - 1; key >= 0; key--) {
      let workingStatusLabel = this.possibleStatuses[key].label;
      if (workingStatusLabel === activeStatus && !this.newAgreement) {
        completedFlag = true;
      }
      if (availableStatuses.indexOf(workingStatusLabel) > -1) {
        this.set(['possibleStatuses', key, 'hidden'], false);
      }
      this.set(['possibleStatuses', key, 'completed'], completedFlag);
    }
  }

  _statusChangeConfirmationCallback(event: CustomEvent) {
    if (event.detail.confirmed) {
      this.fireEvent('update-agreement-status', {
        agreementId: this.agreementId,
        status: this.newStatus + ''
      });
      this.fireEvent('reload-list');
    }
    this.set('newStatus', '');
  }

  _statusChangeIsValid(newStatus: string) {
    if (this.newAgreement) {
      return false;
    }

    if (newStatus === CONSTANTS.STATUSES.Draft.toLowerCase()) {
      // if agreement was not saved (is new) or the status is already changed
      // from draft, stop status change
      if (this.status !== CONSTANTS.STATUSES.Draft.toLowerCase()) {
        return false;
      }
    }
    if ([CONSTANTS.STATUSES.Suspended.toLowerCase(),
          CONSTANTS.STATUSES.Terminated.toLowerCase()].indexOf(newStatus) > -1) {
      if (this.status !== CONSTANTS.STATUSES.Signed.toLowerCase()) {
        // prevent suspending or terminating anything other than signed agreement
        return false;
      }
    }
    return true;
  }

  _computeWarningMessage(newStatus: string) {
    switch (newStatus) {
      case CONSTANTS.STATUSES.Terminated.toLowerCase():
        this.set('warningMessage', 'You are about to terminate this Agreement. Do you want to continue?');
        break;
      case CONSTANTS.STATUSES.Suspended.toLowerCase():
        this.set('warningMessage', 'You are about to suspend this Agreement. Do you want to continue?');
        break;
      case CONSTANTS.STATUSES.Signed.toLowerCase():
        this.set('warningMessage', 'You are about to unsuspend this Agreement. Do you want to continue?');
        break;
      default:
        this.set('warningMessage', this._getDefaultWarningMessage());
        break;
    }
  }

  _setStatusTerminated() {
    this._updateStatus(CONSTANTS.STATUSES.Terminated.toLowerCase());
  }

  _setStatusSuspended() {
    this._updateStatus(CONSTANTS.STATUSES.Suspended.toLowerCase());
  }

  _unsuspendAgreement() {
    this._updateStatus(CONSTANTS.STATUSES.Signed.toLowerCase());
  }

  _triggerAgDeleteOnConfirm(e: CustomEvent) {
    if (e.detail.confirmed) {
      this.fireEvent('delete-agreement', {id: this.agreementId});
    }
  }
}

window.customElements.define('agreement-status', AgreementStatus);
