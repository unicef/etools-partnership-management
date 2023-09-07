import {html} from 'lit';

// language=HTML
export const etoolsCpHeaderActionsBarStyles = html` <style>
  .cp-header-actions-bar {
    display: flex;
    align-items: center;
  }

  .cp-header-actions-bar paper-icon-button[disabled] {
    visibility: hidden;
  }

  .cp-header-actions-bar .separator {
    border-inline-start: solid 1px var(--light-secondary-text-color);
    padding-inline-end: 10px;
    margin: 6px 0 6px 10px;
  }
</style>`;
