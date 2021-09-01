// import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin';
import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
import ScrollControlMixin from '../../mixins/scroll-control-mixin';
import {removeDialog, createDynamicDialog} from '@unicef-polymer/etools-dialog/dynamic-dialog';
import {logWarn} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {Constructor} from '../../../typings/globals.types';
import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {Status, StatusAction} from '../../../typings/etools-status.types';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
declare const ShadyCSS: any;

/**
 * Common functionality for etools status element
 * @polymer
 * @mixinFunction
 * @appliesMixin ScrollControlMixin
 **/
function EtoolsStatusCommonMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class EtoolsStatusCommonClass extends ScrollControlMixin(baseClass as Constructor<PolymerElement>) {
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
    minimumDistanceFromWindowTop = 76;

    @property({type: String})
    sectionName!: string; // PD/SSFA, Partners, Agreements

    @property({type: Array})
    possibleStatuses!: Status[];

    @property({type: Array})
    possibleActions!: StatusAction[];

    @property({type: Object})
    warningDialog!: EtoolsDialog;

    @property({type: Object})
    deleteConfirmDialog!: EtoolsDialog;

    @property({type: String})
    deleteWarningMessage!: string;

    private _resetStatusActionsDebouncer!: Debouncer;
    private _statusActiveChangeDebouncer!: Debouncer;
    private statusChangeWarningDialogContent!: HTMLElement;

    static get observers() {
      return ['_handleStatusChange(status)', '_activeFlagChanged(active)'];
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this.warningDialog) {
        this.warningDialog.removeEventListener('close', this._statusChangeConfirmationCallback as any);
        removeDialog(this.warningDialog);
      }
      if (this.deleteConfirmDialog) {
        removeDialog(this.deleteConfirmDialog);
      }
      this._resetScrollHandler();
      this._resetResizeHandler();
    }

    _activeFlagChanged(active: boolean) {
      if (active) {
        this._statusActiveChangeDebouncer = Debouncer.debounce(
          this._statusActiveChangeDebouncer,
          timeOut.after(20),
          () => {
            this._forceScollPositionRecalculation.bind(this);
          }
        );
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
        this.updateStyles();
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

    _createStatusChangeWarningDialog() {
      this.statusChangeWarningDialogContent = document.createElement('p');
      this.statusChangeWarningDialogContent.setAttribute('id', 'statusChangeWarningContent');
      this._statusChangeConfirmationCallback = this._statusChangeConfirmationCallback.bind(this);
      const conf: any = {
        title: this.sectionName + ' status change',
        size: 'md',
        okBtnText: 'Yes',
        cancelBtnText: 'Cancel',
        closeCallback: this._statusChangeConfirmationCallback,
        content: this.statusChangeWarningDialogContent
      };
      this.warningDialog = createDynamicDialog(conf);
    }

    _showStatusChangeConfirmationDialog() {
      if (this.warningDialog) {
        if (this.statusChangeWarningDialogContent) {
          this.statusChangeWarningDialogContent.innerHTML = this.warningMessage;
          this.warningDialog.opened = true;
        } else {
          logWarn('#statusChangeWarningContent element not found!', 'pmp ' + this.sectionName + ' status change');
        }
      } else {
        logWarn('warningDialog not created!', 'pmp ' + this.sectionName + ' status change');
      }
    }

    _setAllActionsToHidden() {
      const possibleActions = this.possibleActions;
      possibleActions.forEach((_elem: any, index: number) => {
        this.set(['possibleActions', index, 'hidden'], true);
      });
    }

    _setAllStatusesToHidden() {
      const possibleStatuses = this.possibleStatuses;
      possibleStatuses.forEach((_elem: any, index: number) => {
        this.set(['possibleStatuses', index, 'hidden'], true);
        this.set(['possibleStatuses', index, 'completed'], false);
      });
    }

    _updateStatus(newStatus: string) {
      if (!this._statusChangeIsValid(newStatus)) {
        return;
      }
      this.set('newStatus', newStatus);
      this._computeWarningMessage(newStatus);
      this._showStatusChangeConfirmationDialog();
    }

    _handleStatusChange(status: string) {
      if (typeof status === 'undefined') {
        return;
      }
      this._resetStatusActionsDebouncer = Debouncer.debounce(
        this._resetStatusActionsDebouncer,
        timeOut.after(50),
        () => {
          this._computeAvailableStatuses(status);
          this._computeAvailableActions(status);
        }
      );
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
      this.set('warningMessage', this._getDefaultWarningMessage());
    }

    _getDefaultWarningMessage() {
      return (
        "You are changing the status from <strong>'" +
        this.status +
        "'</strong> to <strong>'" +
        this.newStatus +
        "'</strong>. Do you want to continue?"
      );
    }

    getComputedStyleValue(varName: string) {
      if (ShadyCSS) {
        return ShadyCSS.getComputedStyleValue(this, varName);
      } else {
        return getComputedStyle(this as any).getPropertyValue(varName);
      }
    }

    _createDeleteConfirmationDialog() {
      const warnDeleteContent = document.createElement('div');
      warnDeleteContent.innerHTML = this.deleteWarningMessage;
      const conf: any = {
        size: 'md',
        okBtnText: 'Yes',
        cancelBtnText: 'No',
        content: warnDeleteContent
      };
      this.deleteConfirmDialog = createDynamicDialog(conf);
    }

    _openDeleteConfirmation() {
      this.deleteConfirmDialog.opened = true;
    }
  }
  return EtoolsStatusCommonClass;
}

export default EtoolsStatusCommonMixin;
