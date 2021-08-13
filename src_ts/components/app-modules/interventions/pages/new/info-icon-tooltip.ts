import {PaperTooltipElement} from '@polymer/paper-tooltip';
import {customElement, html, LitElement} from 'lit-element';
import {translate} from 'lit-translate';
import '@polymer/paper-tooltip/paper-tooltip';
import {elevationStyles} from '../intervention-tab-pages/common/styles/elevation-styles';

@customElement('info-icon-tooltip')
export class InfoIconTooltip extends LitElement {
  static get styles() {
    return [elevationStyles];
  }
  render() {
    return html`
      <style>
        paper-tooltip[slot='label-suffix'] {
          --paper-tooltip-background: #ffffff;
          --paper-tooltip: {
            padding: 0;
            font-size: 18px !important;
          }
        }
        .content-wrapper {
          border-radius: 5px;
        }

        .tooltip {
          user-select: text;
          padding: 12px;
          word-break: break-word;
          overflow-wrap: break-word;
          box-sizing: border-box;
          color: var(--primary-text-color);
          line-height: 20px;
        }

        @media (max-width: 850px) {
          .tooltip {
            white-space: normal;
            min-width: 90vw;
          }
        }

        .border {
          border: 1px solid var(--primary-color);
        }
      </style>
      <iron-icon
        id="info-icon"
        icon="info-outline"
        slot="label-suffix"
        @click="${this.showPartnerFocalPTooltip}"
      ></iron-icon>
      <paper-tooltip
        id="partner-focal-p-tooltip"
        slot="label-suffix"
        for="info-icon"
        manual-mode
        animation-entry="noanimation"
        position="top"
      >
        <div class="content-wrapper elevation" elevation="1">
          <div class="tooltip border">${translate('NEW_INTERVENTION.PARTNER_FOCAL_POINTS_TOOLTIP')}</div>
        </div>
      </paper-tooltip>
    `;
  }

  private tooltipHandler: any;

  showPartnerFocalPTooltip() {
    const tooltip = this.shadowRoot?.querySelector<PaperTooltipElement>('#partner-focal-p-tooltip')!;
    tooltip.show();

    this.tooltipHandler = this.hidePartnerFocalPTooltip.bind(this, tooltip);
    document.addEventListener('click', this.tooltipHandler, true);
  }

  hidePartnerFocalPTooltip(tooltip: PaperTooltipElement) {
    tooltip.hide();
    document.removeEventListener('click', this.tooltipHandler);
  }
}
