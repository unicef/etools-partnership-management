import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../store';
import {PolymerElement, html} from '@polymer/polymer';
import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/av-icons.js';
import 'etools-content-panel/etools-content-panel.js';
import {etoolsStatusStyles} from './etools-status-styles';
import './etools-action-button.js';
import {StatusAction, Status} from '../../../typings/etools-status.types';
import {property} from '@polymer/decorators';

/**
 * Etools item(partner/agreement/intervention/report etc.) status display element
 * @polymer
 * @customElement
 */
class EtoolsStatus extends connect(store)(PolymerElement) {

  static get template() {
    return html`
      ${etoolsStatusStyles}
      <etools-content-panel panel-title="Status">
        <div class="top-container">
          <template is="dom-repeat" items="[[availableStatuses]]" as="status">
            <div class="divider-line"></div>
            <div class$="status-container [[_getStatusCssClass(status, index)]]">
              <div class="status-icon">
                  <span class="icon-wrapper" style$="[[status.iconContainerStyles]]">
                    <span>[[_getTrueIndex(index)]]</span>
                    <iron-icon class="done-icon" icon="done"></iron-icon>
                    <iron-icon class="custom-icon" icon$="[[status.icon]]" style$="[[status.iconStyles]]"></iron-icon>
                  </span>
              </div>

              <div class="status">
                <span>[[status.label]]</span>
              </div>

            </div>
          </template>
        </div>
        <div class="bottom-container" hidden$="[[hideActions]]">
          <etools-action-button disabled$="[[!allowSave(uploadsInProgress)]]" actions="[[actions]]"
                              title="[[getUploadInProgressOrUnsavedTooltip(uploadsInProgress, unsavedUploads)]]"
                                show-info-icon="[[showInfoIcon]]">
          </etools-action-button>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  statuses: Status[] = [];

  @property({type: Array})
  availableStatuses!: Status[];

  @property({type: Array})
  actions: StatusAction[] = [];

  @property({type: Boolean})
  hideActions: boolean = true;

  @property({type: Number})
  uploadsInProgress!: number;

  @property({type: Number})
  unsavedUploads!: number;

  @property({type: Boolean})
  showInfoIcon: boolean = false;

  private _statusChangedDebouncer!: Debouncer;
  private _actionsOptionsChangedDebouncer!: Debouncer;

  static get observers() {
    return [
      '_handleStatusChanged(statuses, statuses.*)',
      '_handleActionsChanged(actions, actions.*)'
    ];
  }

  stateChanged(state: RootState) {
    if (this.uploadsInProgress !== state.uploadStatus!.uploadsInProgress) {
      this.uploadsInProgress = state.uploadStatus!.uploadsInProgress;
    }
    if (this.unsavedUploads !== state.uploadStatus!.unsavedUploads) {
      this.unsavedUploads = state.uploadStatus!.unsavedUploads;
    }
  }

  allowSave(uploadsInProgress: string) {
    return Number(uploadsInProgress) === 0;
  }

  getUploadInProgressOrUnsavedTooltip(uploadsInProgress: string, unsavedUploads: string) {
    if (Number(uploadsInProgress) > 0) {
      this.showInfoIcon = true;
      return 'Uploads in progress, you can save after they\'re finished.';
    }

    if (Number(unsavedUploads) > 0) {
      this.showInfoIcon = true;
      return 'Don\'t forget to save uploaded files!';
    }
    this.showInfoIcon = false;
    return '';
  }


  _showInfoIcon(actionsBtnTooltip: string) {
    return !!actionsBtnTooltip;
  }

  _handleStatusChanged(statuses: Status[]) {
    this._statusChangedDebouncer = Debouncer.debounce(this._statusChangedDebouncer,
      timeOut.after(10),
      () => {
        this._computeAvailableStatuses(statuses);
      });
  }

  _handleActionsChanged() {
    this._actionsOptionsChangedDebouncer = Debouncer.debounce(this._actionsOptionsChangedDebouncer,
      timeOut.after(10),
      () => {
        let hidden = true;
        this.actions.forEach((elem: StatusAction) => {
          hidden = elem.hidden && hidden;
        });
        this.set('hideActions', hidden);
      });
  }

  _getStatusIcon(icon: string) {
    return icon || 'done';
  }

  _getCustomIconColor(color: string) {
    if (color) {
      return 'color: ' + color;
    }
    return '';
  }

  _getStatusCssClass(status: Status, index: number) {
    let cls = '';
    if (status.completed && !status.icon) {
      cls = 'completed';
    } else if (status.completed && status.icon) {
      cls = 'custom';
    } else if (index === 0) {
      cls = 'pending';
    }
    return cls + ' etools-status';
  }

  _getTrueIndex(index: number) {
    return 1 + index;
  }

  _computeAvailableStatuses(statuses: Status[]) {
    this.set('availableStatuses', []);
    setTimeout(() => {
      const filteredStatuses = statuses.filter((elem) => {
        return !elem.hidden;
      });
      this.set('availableStatuses', filteredStatuses);
    }, 0);
  }

}

window.customElements.define('etools-status', EtoolsStatus);
