import {  html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

const documentContainer = document.createElement('template');
documentContainer.innerHTML = `
  <dom-module id="page-content-header-slotted-styles">
  <template>
    <style>
      .content-header-actions {
        @apply --layout-horizontal;
        @apply --layout-end;
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
    </style>
  </template>
  </dom-module>`;
  document.head.appendChild(documentContainer.content);
