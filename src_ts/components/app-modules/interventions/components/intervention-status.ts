import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icons/av-icons.js';
import CONSTANTS from '../../../../config/app-constants.js';
import EtoolsStatusCommonMixin from '../../../layout/etools-status/etools-status-common-mixin';
import {fireEvent} from '../../../utils/fire-custom-event.js';
import '../../../layout/etools-status/etools-status.js';
import '../../../layout/etools-status/etools-status-common-mixin.js';
import './pd-termination.js';
import {property} from '@polymer/decorators';
import {StatusAction, Status} from '../../../../typings/etools-status.types.js';
import EtoolsDialog from '@unicef-polymer/etools-dialog';

/**
 * @polymer
 * @customElement
 * @appliesMixin EtoolsStatusCommonMixin
 */
class InterventionStatus extends EtoolsStatusCommonMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          width: 100%;
        }
      </style>
      <etools-status
        statuses="[[possibleStatuses]]"
        actions="[[possibleActions]]"
        on-intervention-draft-event="_setStatusDraft"
        on-intervention-suspend-event="_setStatusSuspended"
        on-intervention-terminate-event="_setStatusTerminated"
        on-intervention-unsuspend-event="_unsuspendIntervention"
        on-intervention-delete-event="_openDeleteConfirmation"
      >
      </etools-status>
    `;
  }

  @property({type: Number})
  interventionId!: number;

  @property({
    type: String,
    observer: InterventionStatus.prototype._activeTabChanged
  })
  activeTab!: string;

  @property({type: Boolean})
  newIntervention = false;

  @property({type: String})
  interventionAgreementStatus!: string;

  @property({type: Array})
  possibleStatuses: Status[] = [];

  @property({type: Array})
  possibleActions: StatusAction[] = [
    {
      label: 'Save',
      hidden: true,
      primary: true,
      event: 'save-intervention'
      // save-intervention event is handeled by the parnent
    },
    {
      label: 'Change to draft',
      hidden: true,
      event: 'intervention-draft-event'
    },
    {
      label: 'Suspend',
      hidden: true,
      event: 'intervention-suspend-event'
    },
    {
      label: 'Unsuspend',
      hidden: true,
      event: 'intervention-unsuspend-event'
    },
    {
      label: 'Terminate',
      hidden: true,
      event: 'intervention-terminate-event'
    },
    {
      label: 'Delete',
      hidden: true,
      event: 'intervention-delete-event'
    }
  ];

  @property({type: String})
  deleteWarningMessage = 'Are you sure you want to delete this PD/SSFA?';

  @property({type: Object})
  _terminationDialog!: EtoolsDialog & {resetValidations(): void};

  ready() {
    super.ready();
    this.set('sectionName', 'PD/SSFA');
    this._handleStickyScroll();
    this._createStatusChangeWarningDialog();
    this._createDeleteConfirmationDialog();

    this._triggerInterventionDeleteOnConfirm = this._triggerInterventionDeleteOnConfirm.bind(this);
    this.deleteConfirmDialog.addEventListener('close', this._triggerInterventionDeleteOnConfirm as any);

    this._createTerminationDialog();

    // has to be run async for shadycss to load
    setTimeout(this.setPossibleStatuses.bind(this), 0);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.deleteConfirmDialog.removeEventListener('close', this._triggerInterventionDeleteOnConfirm as any);
    if (this._terminationDialog) {
      document.querySelector('body')!.removeChild(this._terminationDialog);
    }
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
        label: CONSTANTS.STATUSES.Active,
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
      },
      {
        label: CONSTANTS.STATUSES.Closed,
        hidden: false,
        completed: false
      }
    ]);

    this._computeAvailableStatuses(this.status);
  }
  _activeTabChanged(tab: any, _old: any) {
    if (typeof tab === 'undefined') {
      return;
    }
    this._computeAvailableActions(this.status);
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
        availableOptions.push('Terminate');
        availableOptions.push('Suspend');
        availableOptions.push('Save');
        break;

      case CONSTANTS.STATUSES.Active.toLowerCase():
        availableOptions.push('Terminate');
        availableOptions.push('Suspend');
        availableOptions.push('Save');
        break;

      case CONSTANTS.STATUSES.Suspended.toLowerCase():
        availableOptions.push('Unsuspend');
        break;

      case CONSTANTS.STATUSES.Terminated.toLowerCase():
        break;

      case CONSTANTS.STATUSES.Closed.toLowerCase():
        if (this.activeTab === 'attachments') {
          availableOptions.push('Save');
        }
        break;

      case CONSTANTS.STATUSES.Ended.toLowerCase():
        break;

      // legacy version of 'ended'
      case 'implemented':
        if (this.activeTab === 'attachments') {
          availableOptions.push('Save');
        }
        break;

      default:
        availableOptions.push('Save');
        break;
    }

    for (const key in this.possibleActions) {
      if (this.possibleActions[key]) {
        const actionName = this.possibleActions[key].label;

        if (availableOptions.indexOf(actionName) > -1) {
          this.set(['possibleActions', key, 'hidden'], false);
        }
      }
    }
  }

  _computeAvailableStatuses(status: string) {
    this._setAllStatusesToHidden();
    let availableStatuses = [];
    let completedFlag = false;
    let activeStatus;

    switch (status) {
      case CONSTANTS.STATUSES.Draft.toLowerCase():
        availableStatuses = [
          CONSTANTS.STATUSES.Draft,
          CONSTANTS.STATUSES.Signed,
          CONSTANTS.STATUSES.Active,
          CONSTANTS.STATUSES.Ended,
          CONSTANTS.STATUSES.Closed
        ];
        activeStatus = CONSTANTS.STATUSES.Draft;
        break;

      case CONSTANTS.STATUSES.Signed.toLowerCase():
        availableStatuses = [
          CONSTANTS.STATUSES.Draft,
          CONSTANTS.STATUSES.Signed,
          CONSTANTS.STATUSES.Active,
          CONSTANTS.STATUSES.Ended,
          CONSTANTS.STATUSES.Closed
        ];
        activeStatus = CONSTANTS.STATUSES.Signed;
        break;

      case CONSTANTS.STATUSES.Active.toLowerCase():
        availableStatuses = [
          CONSTANTS.STATUSES.Draft,
          CONSTANTS.STATUSES.Signed,
          CONSTANTS.STATUSES.Active,
          CONSTANTS.STATUSES.Ended,
          CONSTANTS.STATUSES.Closed
        ];
        activeStatus = CONSTANTS.STATUSES.Active;
        break;

      case CONSTANTS.STATUSES.Suspended.toLowerCase():
        availableStatuses = [
          CONSTANTS.STATUSES.Draft,
          CONSTANTS.STATUSES.Signed,
          CONSTANTS.STATUSES.Suspended,
          CONSTANTS.STATUSES.Ended,
          CONSTANTS.STATUSES.Closed
        ];
        activeStatus = CONSTANTS.STATUSES.Suspended;
        break;

      case CONSTANTS.STATUSES.Terminated.toLowerCase():
        availableStatuses = [
          CONSTANTS.STATUSES.Draft,
          CONSTANTS.STATUSES.Signed,
          CONSTANTS.STATUSES.Terminated,
          CONSTANTS.STATUSES.Ended,
          CONSTANTS.STATUSES.Closed
        ];
        activeStatus = CONSTANTS.STATUSES.Terminated;
        break;

      case CONSTANTS.STATUSES.Closed.toLowerCase():
        availableStatuses = [
          CONSTANTS.STATUSES.Draft,
          CONSTANTS.STATUSES.Signed,
          CONSTANTS.STATUSES.Active,
          CONSTANTS.STATUSES.Ended,
          CONSTANTS.STATUSES.Closed
        ];
        activeStatus = CONSTANTS.STATUSES.Closed;
        break;

      case CONSTANTS.STATUSES.Ended.toLowerCase():
        availableStatuses = [
          CONSTANTS.STATUSES.Draft,
          CONSTANTS.STATUSES.Signed,
          CONSTANTS.STATUSES.Active,
          CONSTANTS.STATUSES.Ended,
          CONSTANTS.STATUSES.Closed
        ];
        activeStatus = CONSTANTS.STATUSES.Ended;
        break;

      // legacy version of 'ended'
      case 'implemented':
        availableStatuses = [
          CONSTANTS.STATUSES.Draft,
          CONSTANTS.STATUSES.Signed,
          CONSTANTS.STATUSES.Active,
          CONSTANTS.STATUSES.Ended,
          CONSTANTS.STATUSES.Closed
        ];
        activeStatus = CONSTANTS.STATUSES.Ended;
        break;

      default:
        availableStatuses = [
          CONSTANTS.STATUSES.Draft,
          CONSTANTS.STATUSES.Signed,
          CONSTANTS.STATUSES.Active,
          CONSTANTS.STATUSES.Ended,
          CONSTANTS.STATUSES.Closed
        ];
        activeStatus = '';
        break;
    }

    for (let key = this.possibleStatuses.length - 1; key >= 0; key--) {
      const workingStatusLabel = this.possibleStatuses[key].label;
      if (workingStatusLabel === activeStatus) {
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
      fireEvent(this, 'update-intervention-status', {
        interventionId: this.interventionId,
        status: this.newStatus + ''
      });
      fireEvent(this, 'reload-list');
    }
    this.set('newStatus', '');
  }

  _statusChangeIsValid(newStatus: string) {
    if (this.newIntervention) {
      return false;
    }

    if (
      newStatus === CONSTANTS.STATUSES.Draft.toLowerCase() &&
      this.status !== CONSTANTS.STATUSES.Draft.toLowerCase()
    ) {
      // if agreement was not saved (is new) or the status is already changed
      // from draft, stop status change
      return false;
    }

    if (
      newStatus === CONSTANTS.STATUSES.Active.toLowerCase() &&
      this.interventionAgreementStatus === CONSTANTS.STATUSES.Suspended.toLowerCase()
    ) {
      // prevent changing status from suspended to active is the agreement status is suspended
      return false;
    }

    if (
      [CONSTANTS.STATUSES.Suspended.toLowerCase(), CONSTANTS.STATUSES.Terminated.toLowerCase()].indexOf(newStatus) > -1
    ) {
      if ([CONSTANTS.STATUSES.Active.toLowerCase(), CONSTANTS.STATUSES.Signed.toLowerCase()].indexOf(this.status) < 0) {
        // prevent suspending or terminating anything other than signed or active intervention
        return false;
      }
    }
    return true;
  }

  _computeWarningMessage(newStatus: string) {
    switch (newStatus) {
      case CONSTANTS.STATUSES.Terminated.toLowerCase():
        this.set('warningMessage', 'You are about to terminate this PD/SSFA. Do you want to continue?');
        break;
      case CONSTANTS.STATUSES.Suspended.toLowerCase():
        this.set('warningMessage', 'You are about to suspend this PD/SSFA. Do you want to continue?');
        break;
      case CONSTANTS.STATUSES.Signed.toLowerCase():
        this.set('warningMessage', 'You are about to unsuspend this PD/SSFA. Do you want to continue?');
        break;
      default:
        this.set('warningMessage', this._getDefaultWarningMessage());
        break;
    }
  }

  _setStatusTerminated() {
    // this._updateStatus(CONSTANTS.STATUSES.Terminated.toLowerCase());
    if (!this._statusChangeIsValid(CONSTANTS.STATUSES.Terminated.toLowerCase())) {
      return;
    }

    this._terminationDialog.resetValidations();
    this._terminationDialog.set('interventionId', this.interventionId);
    this._terminationDialog.set('termination', {
      date: null,
      attachment_notice: null
    });
    this._terminationDialog.set('opened', true);
  }

  _setStatusDraft() {
    this._updateStatus(CONSTANTS.STATUSES.Draft.toLowerCase());
  }

  _setStatusSuspended() {
    this._updateStatus(CONSTANTS.STATUSES.Suspended.toLowerCase());
  }

  _unsuspendIntervention() {
    this._updateStatus(CONSTANTS.STATUSES.Signed.toLowerCase());
  }

  _triggerInterventionDeleteOnConfirm(e: CustomEvent) {
    if (e.detail.confirmed) {
      fireEvent(this, 'delete-intervention', {id: this.interventionId});
    }
  }

  _createTerminationDialog() {
    this._terminationDialog = document.createElement('pd-termination') as any;
    document.querySelector('body')!.appendChild(this._terminationDialog);

    this._terminationDialog.set('terminationElSource', this);
  }
}

window.customElements.define('intervention-status', InterventionStatus);
