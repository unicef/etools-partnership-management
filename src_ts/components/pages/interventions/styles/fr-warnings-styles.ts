import {html} from '@polymer/polymer/polymer-element.js';

export const frWarningsStyles = html`
  <style>
    etools-info-tooltip.fr-nr-warn sl-icon {
      color: var(--error-color);
    }

    etools-info-tooltip.currency-mismatch sl-icon {
      color: var(--primary-color);
    }

    etools-info-tooltip.frs-inline-list {
      --etools-tooltip-trigger-icon: {
        color: var(--error-color);
        margin-inline-start: 24px !important;
      }
    }

    .fr-val-not-available {
      color: var(--secondary-text-color);
    }

    .amount-currency {
      margin-inline-end: 4px;
    }
  </style>
`;
