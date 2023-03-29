import {html, LitElement, property, customElement, PropertyValues} from 'lit-element';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/image-icons.js';
import {getTranslatedValue} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {listenForLangChanged} from 'lit-translate';

/**
 * @polymer
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

        iron-icon {
          --iron-icon-width: 16px;
          --iron-icon-height: 16px;
          padding-inline-end: 4px;
          margin-top: -2px;
        }

        :host([status-type='default']) iron-icon {
          color: var(--primary-color);
        }

        :host([status-type='submitted']) iron-icon,
        :host([status-type='success']) iron-icon {
          color: var(--success-color);
        }

        :host([status-type='no-status']) iron-icon,
        :host([status-type='error']) iron-icon {
          color: var(--dark-error-color);
        }

        :host([status-type='neutral']) iron-icon {
          color: var(--secondary-text-color);
        }

        :host([status-type='warning']) iron-icon {
          color: var(--warning-color);
        }

        #label {
          color: var(--primary-text-color);
        }
      </style>

      ${!this.noIcon ? html`<iron-icon icon="${this.icon}"></iron-icon>` : ''}
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
  statusType!: string;

  @property({type: String})
  label!: string;

  @property({type: String})
  icon!: string;

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
        label = final ? 'Met results as planned' : 'Met';
        break;
      case 'OnT':
        label = 'On Track';
        break;
      case 'NoP':
        label = 'No Progress';
        break;
      case 'Con':
        label = final ? 'Constrained (partially met result)' : 'Constrained';
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
        return 'icons:check-circle';
      case 'submitted':
        return 'icons:assignment-turned-in';
      case 'error':
      case 'warning':
        return 'icons:error';
      default:
        return 'image:lens';
    }
  }
}
