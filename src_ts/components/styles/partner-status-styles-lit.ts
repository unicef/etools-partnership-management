import {html} from 'lit';

// language=HTML
export const partnerStatusStyles = html` <style>
  .synced,
  .blocked,
  .marked-for-deletion,
  .not-synced {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 24px;
    height: 24px;
    --etools-icon-font-size: var(--etools-font-size-24, 24px);
    font-size: var(--etools-font-size-14, 14px);
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    border-radius: 50%;
  }

  .synced {
    background-color: var(--status-synced-color);
  }

  .blocked {
    background-color: var(--status-blocked-color);
  }

  .not-synced {
    background-color: var(--status-not-synced-color);
  }

  .synced etools-icon,
  .blocked etools-icon,
  .not-synced etools-icon {
    --etools-icon-font-size: var(--etools-font-size-16, 16px);
    color: var(--light-primary-text-color);
    align-self: center;
  }

  .marked-for-deletion etools-icon {
    position: relative;
    color: var(--icon-delete-color);
  }

  .marked-for-deletion etools-icon:after {
    content: '\\00d7';
    color: var(--light-primary-text-color);
    position: absolute;
    z-index: 1;
    font-size: var(--etools-font-size-13, 13px);
    bottom: 6px;
    width: 14px;
    height: 14px;
    inset-inline-start: 8.5px;
    font-weight: bold;
  }

  .sm-status-wrapper {
    display: inline-block;
    width: 24px;
    height: 24px;
  }

  .sm-status-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .sm-status-wrapper .marked-for-deletion etools-icon:after {
    bottom: 4px;
  }

  .sm-status-wrapper .synced etools-icon,
  .sm-status-wrapper .blocked etools-icon,
  .sm-status-wrapper .not-synced etools-icon {
    --etools-icon-font-size: var(--etools-font-size-14, 14px);
  }

  .sm-status-wrapper .synced,
  .sm-status-wrapper .blocked,
  .sm-status-wrapper .not-synced {
    width: 20px;
    height: 20px;
  }
</style>`;
