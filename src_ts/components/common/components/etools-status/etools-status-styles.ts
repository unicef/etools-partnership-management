import {html} from '@polymer/polymer';
import {SharedStyles} from '../../../styles/shared-styles';

export const etoolsStatusStyles = html`
  ${SharedStyles}
  <style>
    :host {
      display: block;
      position: relative;
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
    }
    :host(.sticky-status) {
      position: fixed;
      top: 84px;
      width: 200px;
    }

    [hidden] {
      display: none !important;
    }

    etools-content-panel {
      width: 100%;
    }

    etools-content-panel::part(ecp-content) {
      padding: 0;
    }

    .divider-line {
      flex: 1;
    }

    .divider-line:first-child {
      display: none;
    }

    .status-container {
      display: flex;
      flex-direction: row;
      min-height: 24px;
      @apply --etools-status-container;
    }

    .status-icon,
    .status {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex-wrap: wrap;
    }

    .icon-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
      background-color: var(--etools-status-icon-inactive-color, #9d9d9d);
      width: 24px;
      height: 24px;
      line-height: 24px;
      -webkit-border-radius: 50%;
      -moz-border-radius: 50%;
      border-radius: 50%;
      color: var(--etools-status-icon-text-color, #ffffff);
      font-size: 12px;
    }

    .icon-wrapper iron-icon {
      --iron-icon-height: 16px;
      --iron-icon-width: 16px;
      color: white;
      display: none;
    }

    .icon-wrapper iron-icon,
    .icon-wrapper span {
      align-self: center;
    }

    .icon-wrapper span {
      height: 14px;
      line-height: 14px;
    }

    .status {
      margin-left: 10px;
      margin-top: auto;
      margin-bottom: auto;
      text-transform: capitalize;
      color: var(--etools-status-text-color, #9d9d9d);
    }

    .pending .status {
      color: var(--etools-status-inactive-text-color, rgba(0, 0, 0, 0.87));
      font-weight: 500;
    }

    .pending .status-icon .icon-wrapper {
      background-color: var(--etools-status-icon-pending-color, #0099ff);
    }

    .custom .status-icon .icon-wrapper {
      /* I don't know why, but ie11 doens't like "initial" */
      background-color: inherit;
      width: 29px;
      height: 29px;
      margin-left: -3px;
    }

    .custom .status-icon .icon-wrapper .custom-icon {
      --iron-icon-height: 100%;
      --iron-icon-width: 100%;
      width: 100%;
      height: 100%;
    }

    .custom .status-icon .icon-wrapper span {
      display: none;
    }

    .custom .status-icon .icon-wrapper .custom-icon {
      display: block;
      color: var(--etools-status-icon-pending-color, #0099ff);
    }

    .completed .status-icon .icon-wrapper {
      background-color: var(--etools-status-icon-completed-color, #75c300);
    }

    .custom .status {
      margin-left: 7px;
    }

    .completed .status,
    .custom .status {
      font-weight: bold;
      color: var(--etools-status-inactive-text-color, rgba(0, 0, 0, 0.87));
      @apply --etools-status-label-style;
    }

    .completed .icon-wrapper span {
      display: none;
    }

    .completed .icon-wrapper iron-icon.done-icon {
      display: block;
      width: 18px;
    }
    /* The rest of the styling to make it horizontal/vertical is in page-layout-styles*/
    @media only screen and (max-width: 1359px) {
      .top-container {
        padding: 24px 24px 35px;
        display: inline-flex;
        width: calc(100% - 48px);
      }
      .bottom-container {
        border-top: 1px solid var(--etools-status-divider-color, rgba(0, 0, 0, 0.78));
        padding: 24px;
        flex-direction: row-reverse;
        display: flex;
      }
      etools-action-button {
        min-width: 160px;
      }
      .divider-line {
        border-left: none;
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid var(--etools-status-divider-color, rgba(0, 0, 0, 0.78));
      }
    }

    @media only screen and (min-width: 1360px) {
      .top-container {
        padding: 24px 24px 35px;
        display: block;
        width: auto;
      }
      .bottom-container {
        border-top: 1px solid var(--etools-status-divider-color, rgba(0, 0, 0, 0.78));
        padding: 24px;
        flex-direction: row;
        display: block;
      }
      .divider-line {
        margin: 8px 11px;
        border-top: none;
        border-left: 1px solid var(--etools-status-divider-color, rgba(0, 0, 0, 0.78));
        padding-top: 40px;
      }
    }
  </style>
`;
