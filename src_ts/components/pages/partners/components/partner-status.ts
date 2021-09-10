import {PolymerElement, html} from '@polymer/polymer';
import '../../../common/components/etools-status/etools-status.js';
import {createDynamicDialog} from '@unicef-polymer/etools-dialog/dynamic-dialog';
import EtoolsStatusCommonMixin from '../../../common/components/etools-status/etools-status-common-mixin';
import CONSTANTS from '../../../../config/app-constants.js';
import {isEmptyObject} from '../../../utils/utils';
import {fireEvent} from '../../../utils/fire-custom-event';
import {logWarn} from '@unicef-polymer/etools-behaviors/etools-logging';
import {property} from '@polymer/decorators';
import {StatusAction, Status} from '../../../../typings/etools-status.types';
import {Partner} from '../../../../models/partners.models';
import {GenericObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 * @appliesMixin EtoolsStatusCommonMixin
 */
class PartnerStatus extends EtoolsStatusCommonMixin(PolymerElement) {
  static get template() {
    // language=HTML
    return html`
      <style>
        :host {
          width: 100%;
          --etools-status-container: {
            height: auto;
            min-height: 40px;
          }
          --etools-status-label-style: {
            font-weight: normal;
            width: 120px;
          }
        }
        /* HD res: 1360/1366 x 768 */
        @media only screen and (max-width: 1359px) {
          :host {
            --etools-status-label-style: {
              font-weight: normal;
              width: 100%;
            }
          }
        }
      </style>

      <etools-status
        statuses="[[possibleStatuses]]"
        actions="[[possibleActions]]"
        on-partner-delete="_showDeleteConfirmationDialog"
      >
      </etools-status>
    `;
  }

  @property({type: Object, notify: true})
  partner!: Partner;

  @property({type: Boolean})
  editMode = false;

  @property({type: Object})
  deleteWarningDialogContent: any = null;

  @property({type: Array})
  possibleStatuses: Status[] = [];

  @property({type: Array})
  possibleActions: StatusAction[] = [
    {
      label: 'Save',
      hidden: true,
      primary: true,
      // save action is handled inside the parent
      event: 'save-partner'
    },
    {
      label: 'Delete',
      hidden: true,
      event: 'partner-delete'
    }
  ];

  static get observers() {
    return [
      '_partnerStatusChanged(partner.vision_synced, partner.deleted_flag, partner.blocked, possibleStatuses)',
      '_computeAvailableActions(partner.hidden, editMode)'
    ];
  }

  ready() {
    super.ready();

    this.deleteWarningDialogContent = document.createElement('div');
    this.deleteWarningDialogContent.setAttribute('id', 'deleteWarningContent');
    this._dialogConfirmationCallback = this._dialogConfirmationCallback.bind(this);
    this.warningDialog = createDynamicDialog({
      title: 'Delete Confirmation',
      size: 'md',
      okBtnText: 'Yes',
      cancelBtnText: 'No',
      closeCallback: this._dialogConfirmationCallback,
      content: this.deleteWarningDialogContent
    });

    this.warningDialog.updateStyles({
      '--paper-dialog-scrollable': 'var(--pmp-paper-dialog-content)'
    });

    this._handleStickyScroll();
    setTimeout(this.setPossibleStatuses.bind(this), 0);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.warningDialog.removeEventListener('close', this._dialogConfirmationCallback as any);
  }

  setPossibleStatuses() {
    this.set('possibleStatuses', [
      {
        label: CONSTANTS.PARTNER_STATUSES.NotSynced,
        icon: 'info',
        iconStyles: 'width: 19px; height: 19px; color: ' + this.getComputedStyleValue('--primary-background-color'),
        iconContainerStyles: 'background-color: ' + this.getComputedStyleValue('--status-not-synced-color'),
        hidden: true,
        completed: false
      },
      {
        label: CONSTANTS.PARTNER_STATUSES.SyncedFromVISION,
        icon: 'autorenew',
        iconStyles: 'width: 19px; height: 19px; color: ' + this.getComputedStyleValue('--primary-background-color'),
        iconContainerStyles: 'background-color: ' + this.getComputedStyleValue('--status-synced-color'),
        hidden: true,
        completed: false
      },
      {
        label: CONSTANTS.PARTNER_STATUSES.BlockedInVISION,
        icon: 'block',
        iconStyles: 'width: 19px; height: 19px; color: ' + this.getComputedStyleValue('--primary-background-color'),
        iconContainerStyles: 'background-color: ' + this.getComputedStyleValue('--status-blocked-color'),
        hidden: true,
        completed: false
      },
      {
        label: CONSTANTS.PARTNER_STATUSES.MarkedForDeletionInVISION,
        icon: 'delete-forever',
        iconStyles: 'color: ' + this.getComputedStyleValue('--error-color'),
        iconContainerStyles: 'background-color: ' + this.getComputedStyleValue('--primary-background-color'),
        hidden: true,
        completed: false
      }
    ]);
  }

  _partnerStatusChanged(
    visionSynced: boolean,
    deletedFlag: boolean,
    blocked: boolean,
    possibleStatuses: GenericObject[]
  ) {
    if (
      typeof visionSynced === 'undefined' &&
      typeof deletedFlag === 'undefined' &&
      typeof blocked === 'undefined' &&
      isEmptyObject(possibleStatuses)
    ) {
      return;
    }
    this._computeAvailableStatuses();
    this._forceScollPositionRecalculation();
  }

  // TODO: polymer 3 - remove, might not be needed
  // _isHidden(hidden: boolean) {
  //   if (typeof hidden === 'undefined' || hidden === null) {
  //     return true;
  //   }
  //   return hidden;
  // }
  _showDeleteConfirmationDialog() {
    if (!this.warningDialog) {
      logWarn('warningDialog not created!', 'pmp partner status change');
      return;
    }

    if (!this.deleteWarningDialogContent) {
      logWarn('#deleteWarningContent element not found!', 'pmp partner status change');
      return;
    }
    const warningMessage = 'Are you sure you want to delete partner ' + this.partner.name + '?';
    this.deleteWarningDialogContent.innerHTML = warningMessage;
    this.warningDialog.opened = true;
  }

  _dialogConfirmationCallback(event: CustomEvent) {
    if (event.detail.confirmed) {
      if (!this.editMode) {
        return;
      }
      fireEvent(this, 'delete-partner', {id: this.partner.id});
    }
  }

  _computeAvailableActions(_hidden: boolean, editMode: boolean) {
    if (!editMode || !this.partner) {
      return;
    }
    this._setAllActionsToHidden();
    const availableOptions = ['Save', 'Delete'];

    for (const key in this.possibleActions) {
      if (this.possibleActions[key].label) {
        const actionName = this.possibleActions[key].label;

        if (availableOptions.indexOf(actionName) > -1) {
          this.set(['possibleActions', key, 'hidden'], false);
        }
      }
    }
  }
  _computeAvailableStatuses() {
    let activeStatus;
    this._setAllStatusesToHidden();
    if (!this.partner) {
      return;
    }
    switch (true) {
      case this._showNotSyncedStatus():
        activeStatus = CONSTANTS.PARTNER_STATUSES.NotSynced;
        break;
      case this._showSyncedStatus():
        activeStatus = CONSTANTS.PARTNER_STATUSES.SyncedFromVISION;
        break;
      case this._showBlockedStatus():
        activeStatus = CONSTANTS.PARTNER_STATUSES.BlockedInVISION;
        break;
      case this._showMakedForDeletionStatus():
        activeStatus = CONSTANTS.PARTNER_STATUSES.MarkedForDeletionInVISION;
        break;
    }

    for (let key = this.possibleStatuses.length - 1; key >= 0; key--) {
      if (this.possibleStatuses[key].label === activeStatus) {
        this.set(['possibleStatuses', key, 'completed'], true);
        this.set(['possibleStatuses', key, 'hidden'], false);
      }
    }
  }
  _showSyncedStatus() {
    return (
      this.partner.vision_synced === true &&
      this.partner.deleted_flag === false &&
      (typeof this.partner.blocked === 'undefined' || this.partner.blocked === false)
    );
  }

  _showBlockedStatus() {
    return (
      this.partner.deleted_flag === false &&
      typeof this.partner.blocked !== 'undefined' &&
      this.partner.blocked === true
    );
  }

  _showMakedForDeletionStatus() {
    return this.partner.deleted_flag;
  }

  _showNotSyncedStatus() {
    return this.partner.vision_synced === false;
  }
}

window.customElements.define('partner-status', PartnerStatus);
