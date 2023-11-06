import '../../../common/components/etools-status/etools-status.js';
import EtoolsStatusCommonMixin from '../../../common/components/etools-status/etools-status-common-mixin-lit';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {StatusAction, Status} from '../../../../typings/etools-status.types';
import {Partner} from '../../../../models/partners.models';
import {GenericObject} from '@unicef-polymer/etools-types';
import {html, LitElement, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';

import {get as getTranslation, listenForLangChanged} from 'lit-translate';

/**
 * @customElement
 * @appliesMixin EtoolsStatusCommonMixin
 */
@customElement('partner-status')
export class PartnerStatus extends EtoolsStatusCommonMixin(LitElement) {
  render() {
    return html`
      <style>
        :host {
          width: 100%;

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
        .statuses="${this.statuses}"
        .actions="${this.possibleActions}"
        @partner-delete="${this._openDeleteConfirmation}"
      >
      </etools-status>
    `;
  }

  @property({type: Object})
  partner!: Partner;

  @property({type: Boolean})
  editMode = false;

  @property({type: Array})
  possibleStatuses: Status[] = [];

  @property({type: Array})
  statuses: Status[] = [];

  @property({type: Array})
  possibleActions: StatusAction[] = [
    {
      label: getTranslation('GENERAL.SAVE'),
      hidden: true,
      primary: true,
      // save action is handled inside the parent
      event: 'save-partner'
    },
    {
      label: getTranslation('GENERAL.DELETE'),
      hidden: true,
      event: 'partner-delete'
    }
  ];

  get deleteWarningMessage() {
    return getTranslation('ARE_YOU_SURE_DELETE_PARTNER', {
      partner: this.partner.name
    });
  }

  connectedCallback() {
    super.connectedCallback();
    setTimeout(this.setPossibleStatuses.bind(this), 0);
    listenForLangChanged(() => {
      this.setPossibleActions();
      this.setPossibleStatuses();
      this._computeAvailableActions(this.partner.hidden, this.editMode);
    });
    this.addEventListener('delete-confirmed', this._dialogConfirmationCallback.bind(this) as any);
  }

  setPossibleActions() {
    this.possibleActions = [
      {
        label: getTranslation('GENERAL.SAVE'),
        hidden: true,
        primary: true,
        // save action is handled inside the parent
        event: 'save-partner'
      },
      {
        label: getTranslation('GENERAL.DELETE'),
        hidden: true,
        event: 'partner-delete'
      }
    ];
  }

  updated(changedProperties: PropertyValues) {
    if ((changedProperties.has('partner') || changedProperties.has('possibleStatuses')) && this.partner) {
      this._partnerStatusChanged(
        this.partner.vision_synced,
        this.partner.deleted_flag,
        this.partner.blocked,
        this.possibleStatuses
      );
    }

    if ((changedProperties.has('partner') || changedProperties.has('editMode')) && this.partner) {
      this._computeAvailableActions(this.partner.hidden, this.editMode);
    }
  }

  firstUpdated() {
    this._handleStickyScroll();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  setPossibleStatuses() {
    this.possibleStatuses = [
      {
        label: getTranslation('PARTNER_STATUSES.NOTSYNCED'),
        icon: 'info',
        iconStyles: '--etools-icon-font-size: 19px; color: ' + this.getComputedStyleValue('--primary-background-color'),
        iconContainerStyles: 'background-color: ' + this.getComputedStyleValue('--status-not-synced-color'),
        hidden: true,
        completed: false
      },
      {
        label: getTranslation('PARTNER_STATUSES.SYNCEDFROMVISION'),
        icon: 'autorenew',
        iconStyles: '--etools-icon-font-size: 19px; color: ' + this.getComputedStyleValue('--primary-background-color'),
        iconContainerStyles: 'background-color: ' + this.getComputedStyleValue('--status-synced-color'),
        hidden: true,
        completed: false
      },
      {
        label: getTranslation('PARTNER_STATUSES.BLOCKEDINVISION'),
        icon: 'block',
        iconStyles: '--etools-icon-font-size: 19px; color: ' + this.getComputedStyleValue('--primary-background-color'),
        iconContainerStyles: 'background-color: ' + this.getComputedStyleValue('--status-blocked-color'),
        hidden: true,
        completed: false
      },
      {
        label: getTranslation('PARTNER_STATUSES.MARKEDFORDELETIONINVISION'),
        icon: 'delete-forever',
        iconStyles: 'color: ' + this.getComputedStyleValue('--error-color'),
        iconContainerStyles: 'background-color: ' + this.getComputedStyleValue('--primary-background-color'),
        hidden: true,
        completed: false
      }
    ];
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

  _dialogConfirmationCallback() {
    if (!this.editMode) {
      return;
    }
    fireEvent(this, 'delete-partner', {id: this.partner.id});
  }

  _computeAvailableActions(_hidden: boolean, editMode: boolean) {
    if (!editMode || !this.partner) {
      return;
    }
    this._setAllActionsToHidden();
    const availableOptions = ['GENERAL.SAVE', 'GENERAL.DELETE'].map((x) => getTranslation(x));

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
  _computeAvailableStatuses() {
    let activeStatus;
    this._setAllStatusesToHidden();
    if (!this.partner || !this.possibleStatuses.length) {
      return;
    }
    switch (true) {
      case this._showNotSyncedStatus():
        activeStatus = getTranslation('PARTNER_STATUSES.NOTSYNCED');
        break;
      case this._showSyncedStatus():
        activeStatus = getTranslation('PARTNER_STATUSES.SYNCEDFROMVISION');
        break;
      case this._showBlockedStatus():
        activeStatus = getTranslation('PARTNER_STATUSES.BLOCKEDINVISION');
        break;
      case this._showMakedForDeletionStatus():
        activeStatus = getTranslation('PARTNER_STATUSES.MARKEDFORDELETIONINVISION');
        break;
    }
    for (let key = this.possibleStatuses.length - 1; key >= 0; key--) {
      if (this.possibleStatuses[key].label === activeStatus) {
        this.possibleStatuses[key].completed = true;
        this.possibleStatuses[key].hidden = false;
      }
    }
    this.statuses = [...this.possibleStatuses];
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
