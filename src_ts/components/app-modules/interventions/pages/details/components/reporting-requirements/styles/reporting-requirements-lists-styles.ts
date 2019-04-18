import { html } from '@polymer/polymer/polymer-element.js';

export const reportingRequirementsListStyles = html`
    <style>
      *[hidden] {
        display: none !important;
      }

      :host {
        display: block;
      }

      :host([with-scroll]) {
        max-height: 351px;
        overflow-y: auto;
      }

      .col-data.index-col,
      etools-data-table-column.index-col {
        padding-right: 48px !important;
      }

      .actions {
        position: relative;
      }

      icons-actions {
        --icons-actions: {
          background-color: transparent;
        };
        visibility: hidden;
      }

      :host([always-show-row-actions]) icons-actions,
      etools-data-table-row:hover icons-actions {
        visibility: visible;
      }
    </style>
    `;

