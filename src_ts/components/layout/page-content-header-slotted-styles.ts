import {html} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

// language=HTML
export const pageContentHeaderSlottedStyles = html`
  <style>
    .content-header-actions {
      @apply --layout-horizontal;
      @apply --layout-end;
    }

    @media (max-width: 576px) {
      .content-header-actions {
        --layout-horizontal_-_display: block;
      }
    }

    .content-header-actions .action {
      @apply --layout-horizontal;
      @apply --layout-end;
    }

    .content-header-actions paper-button:not(.primary-btn) {
      padding-top: 0;
      padding-bottom: 0;
      font-size: 16px;
      font-weight: bold;
      color: var(--dark-secondary-text-color);
    }

    .content-header-actions paper-button iron-icon {
      margin-right: 10px;
    }
  </style>`;
