import {html} from '@polymer/polymer/polymer-element.js';

// language=HTML
export const etoolsCpHeaderActionsBarStyles = html` <style>
  .cp-header-actions-bar {
    @apply --layout-horizontal;
  }

  .cp-header-actions-bar paper-icon-button[disabled] {
    visibility: hidden;
  }

  .cp-header-actions-bar paper-toggle-button {
    --paper-toggle-button-label-color: white;
    --paper-toggle-button-checked-bar-color: white;
    padding-right: 10px;
    font-size: 16px;
  }

  .cp-header-actions-bar .separator {
    border-left: solid 1px var(--light-secondary-text-color);
    padding-right: 10px;
    margin: 6px 0 6px 10px;
  }
</style>`;
