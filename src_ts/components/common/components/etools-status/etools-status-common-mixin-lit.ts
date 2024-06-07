import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import ScrollControlMixinLit from '../../mixins/scroll-control-mixin-lit';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import {LitElement, PropertyValues} from 'lit';
import {property} from 'lit/decorators.js';
import {Status, StatusAction} from '../../../../typings/etools-status.types';
import {Constructor} from '@unicef-polymer/etools-types';
import {get as getTranslation, translate} from 'lit-translate';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

/**
 * Common functionality for etools status element
 * @LitElement
 * @mixinFunction
 * @appliesMixin ScrollControlMixin
 **/
function EtoolsStatusCommonMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class EtoolsStatusCommonClass extends ScrollControlMixinLit(baseClass as Constructor<LitElement>) {
    @property({type: String})
    status = '';

    @property({type: String})
    newStatus = '';

    @property({type: String})
    warningMessage = '';

    @property({type: Boolean})
    editMode = true;

    @property({type: Boolean})
    active!: boolean;

    @property({type: Number})
    minimumDistanceFromWindowTop = 176;

    @property({type: String})
    sectionName!: string; // PD/SPD, Partners, Agreements

    @property({type: Array})
    possibleStatuses!: Status[];

    @property({type: Array})
    possibleActions!: StatusAction[];

    get deleteWarningMessage() {
      return '';
    }

    connectedCallback(): void {
      super.connectedCallback();

      this._forceScollPositionRecalculation = debounce(this._forceScollPositionRecalculation.bind(this), 20) as any;
      this._computeAvailableStatuses = debounce(this._computeAvailableStatuses.bind(this), 50) as any;
      this._computeAvailableActions = debounce(this._computeAvailableActions.bind(this), 50) as any;
    }

    updated(changedProperties: PropertyValues) {
      if (changedProperties.has('status')) {
        this._handleStatusChange(this.status);
      }

      if (changedProperties.has('active')) {
        this._activeFlagChanged(this.active);
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      this._resetScrollHandler();
      this._resetResizeHandler();
    }

    _activeFlagChanged(active: boolean) {
      if (active) {
        this._forceScollPositionRecalculation();
      }
    }

    _handleStickyScroll() {
      if (!this.contentContainer) {
        return;
      }
      this._setScrollHandler();
      this._setResizeHandler();
    }

    _setResizeHandler() {
      window.onresize = () => {
        // this.updateStyles();
        this._resetScrollHandler();
        this._setScrollHandler();
      };
    }

    _resetResizeHandler() {
      window.onresize = null;
    }

    _forceScollPositionRecalculation() {
      if (this._isStatusHorizontal()) {
        // if the status is horizontal, no need to make it sticky
        this._setNotStickyStyles();
        return;
      }
      this._scrollChangedHandler();
    }

    _setScrollHandler() {
      if (this._isStatusHorizontal()) {
        // if the status is horizontal, no need to make it sticky
        this._setNotStickyStyles();
        return;
      }
      this.contentContainer!.onscroll = this._scrollChangedHandler.bind(this);
    }

    _isStatusHorizontal() {
      // HD res: 1360/1366 x 768
      return window.innerWidth < 1360;
    }

    _setNotStickyStyles() {
      const statusElem = this.shadowRoot!.querySelector('etools-status');
      statusElem!.classList.remove('sticky-status');
    }

    _resetScrollHandler() {
      if (this.contentContainer) {
        // @ts-ignore
        this.contentContainer.onscroll = null;
      }
    }

    _scrollChangedHandler() {
      this._waitForBoundingClientRectToBeSet().then((containerDistanceFromViewportTop) => {
        const statusElem = this.shadowRoot!.querySelector('etools-status');
        if (containerDistanceFromViewportTop < this.minimumDistanceFromWindowTop) {
          statusElem!.classList.add('sticky-status');
        } else {
          statusElem!.classList.remove('sticky-status');
        }
      });
    }

    _waitForBoundingClientRectToBeSet() {
      return new Promise<number>((resolve, _reject) => {
        let top = this.getBoundingClientRect().top;
        if (top === 0) {
          const bcrInterval = setInterval(() => {
            top = this.getBoundingClientRect().top;
            if (top !== 0) {
              clearInterval(bcrInterval);
              resolve(top);
            }
          }, 0);
        } else {
          // no need to run the interval, resolve immediately
          resolve(top);
        }
      });
    }

    _showStatusChangeConfirmationDialog() {
      openDialog({
        dialog: 'are-you-sure',
        dialogData: {
          title: this.sectionName + ' status change',
          content: this.warningMessage,
          confirmBtnText: translate('YES'),
          cancelBtnText: translate('CANCEL')
        }
      }).then(({confirmed}) => {
        this._statusChangeConfirmationCallback({detail: {confirmed: confirmed}} as any);
      });
    }

    _setAllActionsToHidden() {
      const possibleActions = this.possibleActions;
      possibleActions.forEach((_elem: any, index: number) => {
        this.possibleActions[index].hidden = true;
      });
    }

    _setAllStatusesToHidden() {
      const possibleStatuses = this.possibleStatuses;
      possibleStatuses.forEach((_elem: any, index: number) => {
        this.possibleStatuses[index].hidden = true;
        this.possibleStatuses[index].completed = false;
      });
    }

    _updateStatus(newStatus: string) {
      if (!this._statusChangeIsValid(newStatus)) {
        return;
      }
      this.newStatus = newStatus;
      this._computeWarningMessage(newStatus);
      this._showStatusChangeConfirmationDialog();
    }

    _handleStatusChange(status: string) {
      if (typeof status === 'undefined') {
        return;
      }
      this._computeAvailableStatuses(status);
      this._computeAvailableActions(status);
    }

    _statusChangeConfirmationCallback(_event: CustomEvent) {
      // children should overwrite this
    }

    _statusChangeIsValid(_newStatus: string) {
      // children should overwrite this
      return false;
    }

    _computeAvailableActions(..._arg: any) {
      // children should overwrite this
    }

    _computeAvailableStatuses(_status: string) {
      // children should overwrite this
    }

    _computeWarningMessage(_newStatus: string) {
      // children might want to overwrite this
      this.warningMessage = this._getDefaultWarningMessage();
    }

    _getDefaultWarningMessage() {
      return getTranslation('STATUS_IS_CHANGING', {
        from: this.status,
        to: this.newStatus
      });
    }

    getComputedStyleValue(varName: string) {
      return getComputedStyle(this as any).getPropertyValue(varName);
    }

    async _openDeleteConfirmation() {
      const confirmed = await openDialog({
        dialog: 'are-you-sure',
        dialogData: {
          content: this.deleteWarningMessage,
          confirmBtnText: translate('YES'),
          cancelBtnText: translate('NO')
        }
      }).then(({confirmed}) => {
        return confirmed;
      });

      if (confirmed) {
        fireEvent(this, 'delete-confirmed');
      }
    }
  }
  return EtoolsStatusCommonClass;
}

export default EtoolsStatusCommonMixin;
