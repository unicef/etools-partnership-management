import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/image-icons.js';
import { PolymerElement, html } from '@polymer/polymer';

/**
 * @polymer
 * @customElement
 * @extends {Polymer.Element}
 */
class ReportStatus extends PolymerElement {
  static get is() {
    return 'report-status';
  }

  static get template() {
    return html`
    <style>
        :host {
          display: inline-block;
        }

        iron-icon {
          --iron-icon-width: 16px;
          --iron-icon-height: 16px;
          padding-right: 4px;
          margin-top: -2px;
        }

        :host([status-type="default"]) iron-icon {
          color: var(--primary-color);
        }

        :host([status-type="submitted"]) iron-icon,
        :host([status-type="success"]) iron-icon {
          color: var(--success-color);
        }

        :host([status-type="no-status"]) iron-icon,
        :host([status-type="error"]) iron-icon {
          color: var(--dark-error-color);
        }

        :host([status-type="neutral"]) iron-icon {
          color: var(--secondary-text-color);
        }

        :host([status-type="warning"]) iron-icon {
          color: var(--warning-color);
        }

        #label {
          color: var(--primary-text-color);
        }
      </style>

      <template is="dom-if" if="[[!noIcon]]">
        <iron-icon icon$="[[icon]]"></iron-icon>
      </template>
      <template is="dom-if" if="[[!noLabel]]">
        <span id="label">[[label]]</span>
      </template>
      <slot></slot>

    `;
  }

  static get properties() {
    return {
      status: {
        value: null
      },
      noLabel: {
        type: Boolean,
        value: false
      },
      noIcon: {
        type: Boolean,
        value: false
      },
      statusType: {
        type: String,
        computed: '_computeStatusType(status)',
        reflectToAttribute: true
      },
      label: {
        type: String,
        computed: '_computeLabel(status, final, reportType)'
      },
      icon: {
        type: String,
        computed: '_computeIcon(statusType)'
      },
      final: {
        type: Boolean,
        value: false
      },
      reportType: {
        type: String,
        value: ''
      }
    };
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

  _computeLabel(status: string, final: string, reportType: string) {
    switch (status) {
      case '1':
        return 'Nothing due';
      case '2':
      case 'Ove':
        return 'Overdue';
      case '3':
      case 'Due':
        return 'Due';
      case 'Sub':
        return 'Submitted';
      case 'Rej':
        return 'Rejected';
      case 'Met':
        return final ? 'Met results as planned' : 'Met';
      case 'OnT':
        return 'On Track';
      case 'NoP':
        return 'No Progress';
      case 'Con':
        return final ? 'Constrained (partially met result)' : 'Constrained';
      case 'Ong':
        return 'Ongoing';
      case 'Pla':
        return 'Planned';
      case 'Com':
        return 'Completed';
      case 'NoS':
        return 'No Status';
      case 'Sen':
        return 'Sent Back';
      case 'Acc':
        return reportType !== 'HR' ? 'Accepted' : 'Received';
      default:
        return 'No Status';
    }
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

window.customElements.define(ReportStatus.is, ReportStatus);
