import {LitElement, html, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../redux/store';
import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import {etoolsStatusStyles} from './etools-status-styles';
import './etools-action-button.js';
import {StatusAction, Status} from '../../../../typings/etools-status.types';
import {translate, get as getTranslation} from 'lit-translate';

/**
 * Etools item(partner/agreement/intervention/report etc.) status display element
 * @polymer
 * @customElement
 */
@customElement('etools-status')
export class EtoolsStatus extends connect(store)(LitElement) {
  render() {
    return html`
      ${etoolsStatusStyles}
      <etools-content-panel panel-title="${translate('STATUS')}">
        <div class="top-container">
          ${(this.availableStatuses || []).map(
            (status, index) => html` <div class="divider-line"></div>
              <div class="status-container ${this._getStatusCssClass(status, index)}">
                <div class="status-icon">
                  <span class="icon-wrapper" style="${status.iconContainerStyles}">
                    <span>${this._getTrueIndex(index)}</span>
                    <sl-icon class="done-icon" name="done"></sl-icon>
                    <sl-icon class="custom-icon" name="${status.icon}" style="${status.iconStyles}"></sl-icon>
                  </span>
                </div>
                <div class="status">
                  <span>${status.label}</span>
                </div>
              </div>`
          )}
        </div>
        <div class="bottom-container" ?hidden="${this.hideActions}">
          <etools-action-button
            ?disabled="${!this.allowSave(this.uploadsInProgress)}"
            .actions="${this.actions}"
            title="${this.getUploadInProgressOrUnsavedTooltip(this.uploadsInProgress, this.unsavedUploads)}"
            ?showInfoIcon="${this.showInfoIcon}"
          >
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
  hideActions = true;

  @property({type: Number})
  uploadsInProgress!: number;

  @property({type: Number})
  unsavedUploads!: number;

  @property({type: Boolean})
  showInfoIcon = false;

  private _statusChangedDebouncer!: Debouncer;
  private _actionsOptionsChangedDebouncer!: Debouncer;

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('statuses')) {
      this._handleStatusChanged(this.statuses);
    }
    if (changedProperties.has('actions')) {
      this._handleActionsChanged();
    }
  }

  stateChanged(state: RootState) {
    if (this.uploadsInProgress !== state.uploadStatus!.uploadsInProgress) {
      this.uploadsInProgress = state.uploadStatus!.uploadsInProgress;
    }
    if (this.unsavedUploads !== state.uploadStatus!.unsavedUploads) {
      this.unsavedUploads = state.uploadStatus!.unsavedUploads;
    }
  }

  allowSave(uploadsInProgress: number) {
    return Number(uploadsInProgress) === 0;
  }

  getUploadInProgressOrUnsavedTooltip(uploadsInProgress: number, unsavedUploads: number) {
    if (Number(uploadsInProgress) > 0) {
      this.showInfoIcon = true;
      return getTranslation('UPLOADS_IN_PROGRESS_YOU_CAN_SAVE_AFTER_THEY_RE_FINISHED');
    }

    if (Number(unsavedUploads) > 0) {
      this.showInfoIcon = true;
      return getTranslation('DONT_FORGET_TO_SAVE_UPLOADED_FILES');
    }
    this.showInfoIcon = false;
    return '';
  }

  _showInfoIcon(actionsBtnTooltip: string) {
    return !!actionsBtnTooltip;
  }

  _handleStatusChanged(statuses: Status[]) {
    this._statusChangedDebouncer = Debouncer.debounce(this._statusChangedDebouncer, timeOut.after(10), () => {
      this._computeAvailableStatuses(statuses);
    });
  }

  _handleActionsChanged() {
    this._actionsOptionsChangedDebouncer = Debouncer.debounce(
      this._actionsOptionsChangedDebouncer,
      timeOut.after(10),
      () => {
        let hidden = true;
        this.actions.forEach((elem: StatusAction) => {
          hidden = elem.hidden && hidden;
        });
        this.hideActions = hidden;
      }
    );
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
    this.availableStatuses = [];
    setTimeout(() => {
      const filteredStatuses = statuses.filter((elem) => {
        return !elem.hidden;
      });
      this.availableStatuses = filteredStatuses;
    }, 0);
  }
}
