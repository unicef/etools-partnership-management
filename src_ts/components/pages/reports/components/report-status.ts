import {html, LitElement, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import {getTranslatedValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import {listenForLangChanged} from 'lit-translate';

/**
 * @LitElement
 * @customElement
 * @extends {Polymer.Element}
 */
@customElement('report-status')
export class ReportStatus extends LitElement {
  render() {
    return html`
      <style>
        :host {
          display: inline-block;
        }

        etools-icon {
          --etools-icon-font-size: var(--etools-font-size-16, 16px);
          padding-inline-end: 4px;
          margin-top: -2px;
        }

        :host([status-type='default']) etools-icon {
          color: var(--primary-color);
        }

        :host([status-type='submitted']) etools-icon,
        :host([status-type='success']) etools-icon {
          color: var(--success-color);
        }

        :host([status-type='no-status']) etools-icon,
        :host([status-type='error']) etools-icon {
          color: var(--dark-error-color);
        }

        :host([status-type='neutral']) etools-icon {
          color: var(--secondary-text-color);
        }

        :host([status-type='warning']) etools-icon {
          color: var(--warning-color);
        }

        #label {
          color: var(--primary-text-color);
        }
      </style>

      ${!this.noIcon ? html`<etools-icon name="${this.icon}"></etools-icon>` : ''}
      ${!this.noLabel ? html`<span id="label">${this.label}</span>` : ''}
      <slot></slot>
    `;
  }

  @property({type: String, reflect: true, attribute: 'status'})
  status!: string;

  @property({type: Boolean, reflect: true, attribute: 'no-label'})
  noLabel = false;

  @property({type: Boolean, reflect: true, attribute: 'no-icon'})
  noIcon = false;

  @property({type: String, reflect: true, attribute: 'status-type'})
  statusType = 'no-status';

  @property({type: String})
  label = 'No Status';

  @property({type: String})
  icon = 'image:lens';

  @property({type: Boolean})
  final = false;

  @property({type: String})
  reportType = '';

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('status')) {
      this.statusType = this._computeStatusType(this.status);
    }
    if (changedProperties.has('statusType')) {
      this.icon = this._computeIcon(this.statusType);
    }
    if (changedProperties.has('status') || changedProperties.has('final') || changedProperties.has('reportType')) {
      this.label = this._computeLabel(this.status, this.final, this.reportType);
    }
  }

  constructor() {
    super();
    listenForLangChanged(() => {
      this.label = this._computeLabel(this.status, this.final, this.reportType);
    });
  }

  _computeStatusType(status: null | undefined | string) {
    if (status === null || typeof status === 'undefined') {
      return 'no-status';
    }
    switch (status) {
      case '1':
      case 'Met':
      case 'OnT':
      case 'Com':
      case 'Acc':
        return 'success';
      case 'Sub':
        return 'submitted';
      case '2':
      case 'Ove':
      case 'Sen':
        return 'error';
      case '3':
      case 'Due':
      case 'NoP':
      case 'Ong':
        return 'neutral';
      case 'Rej':
      case 'Con':
      case 'Pla':
        return 'warning';
      case 'NoS':
        return 'no-status';
      default:
        return 'default';
    }
  }

  _computeLabel(status: string, final: boolean, reportType: string) {
    let label;
    switch (status) {
      case '1':
        label = 'Nothing due';
        break;
      case '2':
      case 'Ove':
        label = 'Overdue';
        break;
      case '3':
      case 'Due':
        label = 'Due';
        break;
      case 'Sub':
        label = 'Submitted';
        break;
      case 'Rej':
        label = 'Rejected';
        break;
      case 'Met':
        label = final ? 'Achieved as planned' : 'Met';
        break;
      case 'OnT':
        label = 'On Track';
        break;
      case 'NoP':
        label = 'No Progress';
        break;
      case 'Con':
        label = final ? 'Not achieved as planned' : 'Constrained';
        break;
      case 'Ong':
        label = 'Ongoing';
        break;
      case 'Pla':
        label = 'Planned';
        break;
      case 'Com':
        label = 'Completed';
        break;
      case 'NoS':
        label = 'No Status';
        break;
      case 'Sen':
        label = 'Sent Back';
        break;
      case 'Acc':
        label = reportType !== 'HR' ? 'Accepted' : 'Received';
        break;
      default:
        label = 'No Status';
    }

    return getTranslatedValue(label, 'PROGRESS_REPORT_STATUS');
  }

  _computeIcon(type: string) {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'submitted':
        return 'assignment-turned-in';
      case 'error':
      case 'warning':
        return 'error';
      default:
        return 'image:lens';
    }
  }
}
