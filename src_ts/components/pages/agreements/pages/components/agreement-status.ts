import {customElement, html, LitElement, property, PropertyValues} from 'lit-element';
import '@polymer/iron-icons/av-icons.js';
import CONSTANTS from '../../../../../config/app-constants';
import EtoolsStatusCommonMixin from '../../../../common/components/etools-status/etools-status-common-mixin-lit';
import '../../../../common/components/etools-status/etools-status';
import '../../../../common/components/etools-status/etools-status-common-mixin-lit';
import {fireEvent} from '../../../../utils/fire-custom-event';
import '../../data/agreement-termination';
import {openDialog} from '../../../../utils/dialog';
import {get as getTranslation} from 'lit-translate';

/**
 * @polymer
 * @customElement
 * @appliesMixin EtoolsStatusCommonMixin
 */
@customElement('agreement-status')
export class AgreementStatus extends EtoolsStatusCommonMixin(LitElement) {
  render() {
    return html`
      <style>
        :host {
          width: 100%;
        }
      </style>
      <etools-status
        .statuses="${this.possibleStatuses}"
        .actions="${this.possibleActions}"
        @agreement-suspend-event="${this._setStatusSuspended}"
        @agreement-terminate-event="${this._openTerminationDialog}"
        @agreement-unsuspend-event="${this._unsuspendAgreement}"
        @agreement-delete-event="${this._openDeleteConfirmation}"
      >
      </etools-status>
    `;
  }

  @property({type: Number})
  agreementId: number | null = null;

  @property({type: String})
  agreementType = '';

  @property({type: Boolean})
  newAgreement = false;

  @property({type: Array})
  possibleStatuses: any = [];

  @property({type: Array})
  possibleActions: any = [
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
  ];

  @property({type: String})
  deleteWarningMessage = getTranslation('ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_AGREEMENT');

  connectedCallback() {
    super.connectedCallback();
    setTimeout(this.setPossibleStatuses.bind(this), 0);
  }

  firstUpdated() {
    this.sectionName = getTranslation('AGREEMENT');
    this._handleStickyScroll();

    this._createStatusChangeWarningDialog();
    this._createDeleteConfirmationDialog();
    this._triggerAgDeleteOnConfirm = this._triggerAgDeleteOnConfirm.bind(this);
    this.deleteConfirmDialog.addEventListener('close', this._triggerAgDeleteOnConfirm as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.deleteConfirmDialog.removeEventListener('close', this._triggerAgDeleteOnConfirm as any);
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('status') || changedProperties.has('agreementId')) {
      this._handleStatusChange(this.status);
    }
    if (changedProperties.has('status')) {
      this._computeAvailableStatuses(this.status);
    }
  }

  setPossibleStatuses() {
    this.possibleStatuses = [
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
    ];
    this.possibleStatuses = [...this.possibleStatuses];
  }

  _computeAvailableActions(status: string) {
    this._setAllActionsToHidden();
    if (!this.editMode) {
      return;
    }
    const availableOptions = [];

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

    for (const key in this.possibleActions) {
      if (this.possibleActions[key].label) {
        const actionName = this.possibleActions[key].label;

        if (availableOptions.indexOf(actionName) > -1) {
          this.possibleActions[key].hidden = false;
        }
      }
    }
    this.possibleActions = [...this.possibleActions];
  }

  _computeAvailableStatuses(status: string) {
    this._setAllStatusesToHidden();
    let availableStatuses = [];
    let completedFlag = false;
    let activeStatus;

    switch (status) {
      case CONSTANTS.STATUSES.Draft.toLowerCase():
        availableStatuses = [CONSTANTS.STATUSES.Draft, CONSTANTS.STATUSES.Signed, CONSTANTS.STATUSES.Ended];
        activeStatus = CONSTANTS.STATUSES.Draft;
        break;

      case CONSTANTS.STATUSES.Signed.toLowerCase():
        availableStatuses = [CONSTANTS.STATUSES.Draft, CONSTANTS.STATUSES.Signed, CONSTANTS.STATUSES.Ended];
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
        availableStatuses = [CONSTANTS.STATUSES.Draft, CONSTANTS.STATUSES.Signed, CONSTANTS.STATUSES.Ended];
        activeStatus = CONSTANTS.STATUSES.Ended;
        break;
      default:
        availableStatuses = [CONSTANTS.STATUSES.Draft, CONSTANTS.STATUSES.Signed, CONSTANTS.STATUSES.Ended];
        activeStatus = '';
        break;
    }

    for (let key = this.possibleStatuses.length - 1; key >= 0; key--) {
      const workingStatusLabel = this.possibleStatuses[key].label;
      if (workingStatusLabel === activeStatus && !this.newAgreement) {
        completedFlag = true;
      }
      if (availableStatuses.indexOf(workingStatusLabel) > -1) {
        this.possibleStatuses[key].hidden = false;
      }
      this.possibleStatuses[key].completed = completedFlag;
    }

    this.possibleStatuses = [...this.possibleStatuses];
  }

  _statusChangeConfirmationCallback(event: CustomEvent) {
    if (event.detail.confirmed) {
      fireEvent(this, 'update-agreement-status', {
        agreementId: this.agreementId,
        status: this.newStatus + ''
      });
      fireEvent(this, 'reload-list');
    }
    this.newStatus = '';
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
    if (
      [CONSTANTS.STATUSES.Suspended.toLowerCase(), CONSTANTS.STATUSES.Terminated.toLowerCase()].indexOf(newStatus) > -1
    ) {
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
        this.warningMessage = 'You are about to terminate this Agreement. Do you want to continue?';
        break;
      case CONSTANTS.STATUSES.Suspended.toLowerCase():
        this.warningMessage = 'You are about to suspend this Agreement. Do you want to continue?';
        break;
      case CONSTANTS.STATUSES.Signed.toLowerCase():
        this.warningMessage = 'You are about to unsuspend this Agreement. Do you want to continue?';
        break;
      default:
        this.warningMessage = this._getDefaultWarningMessage();
        break;
    }
  }

  _openTerminationDialog() {
    // this._updateStatus(CONSTANTS.STATUSES.Terminated.toLowerCase());
    if (!this._statusChangeIsValid(CONSTANTS.STATUSES.Terminated.toLowerCase())) {
      return;
    }

    openDialog({
      dialog: 'agreement-termination',
      dialogData: {
        terminationElSource: this,
        agreementId: this.agreementId,
        termination: {
          date: null,
          attachment_notice: null
        }
      }
    });
  }

  _setStatusSuspended() {
    this._updateStatus(CONSTANTS.STATUSES.Suspended.toLowerCase());
  }

  _unsuspendAgreement() {
    this._updateStatus(CONSTANTS.STATUSES.Signed.toLowerCase());
  }

  _triggerAgDeleteOnConfirm(e: CustomEvent) {
    if (e.detail.confirmed) {
      fireEvent(this, 'delete-agreement', {id: this.agreementId});
    }
  }
}
