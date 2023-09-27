import {html, LitElement, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import CONSTANTS from '../../../../../config/app-constants';
import EtoolsStatusCommonMixin from '../../../../common/components/etools-status/etools-status-common-mixin-lit';
import '../../../../common/components/etools-status/etools-status';
import '../../../../common/components/etools-status/etools-status-common-mixin-lit';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import '../../data/agreement-termination';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {get as getTranslation, listenForLangChanged} from 'lit-translate';
import {getTranslatedValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';

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
  possibleActions: any = [];

  get deleteWarningMessage() {
    return getTranslation('ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_AGREEMENT');
  }

  connectedCallback() {
    super.connectedCallback();
    this.setPossibleActions();
    setTimeout(this.setPossibleStatuses.bind(this), 0);
    listenForLangChanged(() => {
      this.setPossibleStatuses();
      this.setPossibleActions();
      this._computeAvailableActions(this.status);
      this._computeAvailableStatuses(this.status);
    });
  }

  setPossibleActions() {
    this.possibleActions = [
      {
        label: getTranslation('SAVE'),
        hidden: true,
        primary: true,
        event: 'save-agreement'
        // save-agreement event is handeled by the parnent
      },
      {
        label: getTranslation('SUSPEND'),
        hidden: true,
        event: 'agreement-suspend-event'
      },
      {
        label: getTranslation('UNSUSPEND'),
        hidden: true,
        event: 'agreement-unsuspend-event'
      },
      {
        label: getTranslation('TERMINATE'),
        hidden: true,
        event: 'agreement-terminate-event'
      },
      {
        label: getTranslation('DELETE'),
        hidden: true,
        event: 'agreement-delete-event'
      }
    ];
  }

  firstUpdated() {
    this.sectionName = getTranslation('AGREEMENT');
    this._handleStickyScroll();

    this._triggerAgDeleteOnConfirm = this._triggerAgDeleteOnConfirm.bind(this);
    this.addEventListener('delete-confirmed', this._triggerAgDeleteOnConfirm as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('delete-confirmed', this._triggerAgDeleteOnConfirm as any);
  }

  updated(changedProperties: PropertyValues) {
    if (
      changedProperties.has('status') ||
      changedProperties.has('newAgreement') ||
      changedProperties.has('agreementId')
    ) {
      this._handleStatusChange(this.status);
    }
    if (changedProperties.has('status') || changedProperties.has('editMode')) {
      this._computeAvailableActions(this.status);
    }
  }

  setPossibleStatuses() {
    this.possibleStatuses = [
      {
        label: getTranslation('COMMON_DATA.AGREEMENTSTATUSES.DRAFT'),
        hidden: false,
        completed: false
      },
      {
        label: getTranslation('COMMON_DATA.AGREEMENTSTATUSES.SIGNED'),
        hidden: false,
        completed: false
      },
      {
        label: getTranslation('COMMON_DATA.AGREEMENTSTATUSES.SUSPENDED'),
        icon: 'av:pause-circle-filled',
        iconStyles: 'color: ' + this.getComputedStyleValue('--warning-color'),
        hidden: false,
        completed: false
      },
      {
        label: getTranslation('COMMON_DATA.AGREEMENTSTATUSES.TERMINATED'),
        icon: 'report-problem',
        iconStyles: 'color: ' + this.getComputedStyleValue('--error-color'),
        hidden: false,
        completed: false
      },
      {
        label: getTranslation('COMMON_DATA.AGREEMENTSTATUSES.ENDED'),
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
        availableOptions.push(getTranslation('SAVE'));
        availableOptions.push(getTranslation('DELETE'));
        break;
      case CONSTANTS.STATUSES.Signed.toLowerCase():
        availableOptions.push(getTranslation('SAVE'));
        if (this.agreementType !== CONSTANTS.AGREEMENT_TYPES.SSFA) {
          availableOptions.push(getTranslation('SUSPEND'));
          availableOptions.push(getTranslation('TERMINATE'));
        }
        break;

      case CONSTANTS.STATUSES.Suspended.toLowerCase():
        if (this.agreementType !== CONSTANTS.AGREEMENT_TYPES.SSFA) {
          availableOptions.push(getTranslation('UNSUSPEND'));
        }
        break;

      case CONSTANTS.STATUSES.Terminated.toLowerCase():
        break;

      case CONSTANTS.STATUSES.Ended.toLowerCase():
        break;

      default:
        availableOptions.push(getTranslation('SAVE'));
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
        availableStatuses = [
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.DRAFT'),
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.SIGNED'),
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.ENDED')
        ];
        activeStatus = getTranslation('COMMON_DATA.AGREEMENTSTATUSES.DRAFT');
        break;

      case CONSTANTS.STATUSES.Signed.toLowerCase():
        availableStatuses = [
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.DRAFT'),
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.SIGNED'),
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.ENDED')
        ];
        activeStatus = getTranslation('COMMON_DATA.AGREEMENTSTATUSES.SIGNED');
        break;

      case CONSTANTS.STATUSES.Suspended.toLowerCase():
        availableStatuses = [
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.DRAFT'),
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.SIGNED'),
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.SUSPENDED'),
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.ENDED')
        ];
        activeStatus = getTranslation('COMMON_DATA.AGREEMENTSTATUSES.SUSPENDED');
        break;

      case CONSTANTS.STATUSES.Terminated.toLowerCase():
        availableStatuses = [
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.DRAFT'),
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.SIGNED'),
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.TERMINATED'),
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.ENDED')
        ];
        activeStatus = getTranslation('COMMON_DATA.AGREEMENTSTATUSES.TERMINATED');
        break;

      case CONSTANTS.STATUSES.Ended.toLowerCase():
        availableStatuses = [
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.DRAFT'),
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.SIGNED'),
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.ENDED')
        ];
        activeStatus = getTranslation('COMMON_DATA.AGREEMENTSTATUSES.ENDED');
        break;
      default:
        availableStatuses = [
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.DRAFT'),
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.SIGNED'),
          getTranslation('COMMON_DATA.AGREEMENTSTATUSES.ENDED')
        ];
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
        this.warningMessage = getTranslation('ABOUT_TO_TERMINATE_AGREEMENT');
        break;
      case CONSTANTS.STATUSES.Suspended.toLowerCase():
        this.warningMessage = getTranslation('ABOUT_TO_SUSPEND_AGREEMENT');
        break;
      case CONSTANTS.STATUSES.Signed.toLowerCase():
        this.warningMessage = getTranslation('ABOUT_TO_UNSUSPEND_AGREEMENT');
        break;
      default:
        this.warningMessage = getTranslation('STATUS_IS_CHANGING', {
          from: getTranslatedValue(this.status, 'COMMON_DATA.AGREEMENTSTATUSES'),
          to: getTranslatedValue(this.newStatus, 'COMMON_DATA.AGREEMENTSTATUSES')
        });
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

  _triggerAgDeleteOnConfirm() {
    fireEvent(this, 'delete-agreement', {id: this.agreementId});
  }
}
