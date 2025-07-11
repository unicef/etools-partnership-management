import {LitElement, html, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {store} from '../../../../redux/store';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import {etoolsStatusStyles} from './etools-status-styles';
import './etools-action-button.js';
import {StatusAction, Status} from '../../../../typings/etools-status.types';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {UploadsMixin} from '@unicef-polymer/etools-unicef/src/etools-upload/uploads-mixin.js';

/**
 * Etools item(partner/agreement/intervention/report etc.) status display element
 * @LitElement
 * @customElement
 */
@customElement('etools-status')
export class EtoolsStatus extends connect(store)(UploadsMixin(LitElement)) {
  render() {
    return html`
      ${etoolsStatusStyles}
      <etools-content-panel panel-title="${translate('STATUS')}">
        <div class="top-container">
          ${(this.availableStatuses || []).map(
            (status, index) =>
              html` <div class="divider-line"></div>
                <div class="status-container ${this._getStatusCssClass(status, index)}">
                  <div class="status-icon">
                    <span class="icon-wrapper" style="${status.iconContainerStyles}">
                      <span>${this._getTrueIndex(index)}</span>
                      <etools-icon class="done-icon" name="done"></etools-icon>
                      <etools-icon class="custom-icon" name="${status.icon}" style="${status.iconStyles}"></etools-icon>
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
            .infoText="${this.getUploadInProgressOrUnsavedTooltip(this.uploadsInProgress, this.unsavedUploads)}"
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

  @property({type: Boolean})
  showInfoIcon = false;

  connectedCallback(): void {
    super.connectedCallback();

    this._computeAvailableStatuses = debounce(this._computeAvailableStatuses.bind(this), 20) as any;
    this._handleActionsChanged = debounce(this._handleActionsChanged.bind(this), 20) as any;
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('statuses')) {
      this._handleStatusChanged(this.statuses);
    }
    if (changedProperties.has('actions')) {
      this._handleActionsChanged();
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
    this._computeAvailableStatuses(statuses);
  }

  _handleActionsChanged() {
    let hidden = true;
    this.actions.forEach((elem: StatusAction) => {
      hidden = elem.hidden && hidden;
    });
    this.hideActions = hidden;
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
