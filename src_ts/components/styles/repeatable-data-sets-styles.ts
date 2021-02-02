import {html} from '@polymer/polymer/polymer-element.js';

import {actionIconBtnsStyles} from './action-icon-btns-styles.js';

// language=HTML
export const repeatableDataSetsStyles = html` ${actionIconBtnsStyles}
  <style>
    .item-container {
      background: var(--ecp-content-bg-color, var(--primary-background-color));
    }

    .item-container.no-h-margin {
      padding-right: 0;
      padding-left: 0;
    }

    .item-actions-container {
      display: flex;
      flex-direction: row;
    }

    .item-actions-container .actions {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex-wrap: wrap;
    }

    .item-container .item-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      margin-left: 10px;
      border-left: 1px solid var(--darker-divider-color);
    }

    .item-container .item-content > * {
      padding: 0 0 16px 24px;
    }

    #bottom-actions {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      overflow: visible;
      padding-top: 15px;
      padding-bottom: 25px;
    }
  </style>`;

// language=HTML
export const repeatableDataSetsStylesV2 = html` <style>
  .item-container {
    padding: 8px 25px;
  }

  .item-actions-container {
    position: relative;
    padding-right: 10px;
    border-right: 2px solid var(--primary-color);
    margin-top: 25px;
  }

  .item-actions-container:before {
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: absolute;
    top: -32px;
    right: -12px;
    background-color: var(--primary-color);
    color: var(--light-primary-text-color);
    content: attr(data-item-nr);
    text-align: center;
    font-size: 12px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    z-index: 1;
  }

  .item-actions-container.locked {
    border-right-color: var(--darker-divider-color);
  }

  .item-actions-container.locked:before {
    background-color: var(--darker-divider-color);
  }

  .item-container .item-content {
    display: inline-block;
    width: 100%;
    margin-left: 0;
    border-left: none;
  }
</style>`;

// language=HTML
export const repeatableDataSetsStylesV3 = html` <style>
  .item-container {
    background-color: var(--medium-theme-background-color);
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    border-radius: 10px;
    margin-bottom: 20px;
    padding: 15px;
  }

  .item-container:last-of-type {
    margin-bottom: 0;
  }

  .item-container .item-content {
    border-left-style: dashed;
  }

  .item-content > * {
    margin-bottom: 0;
  }

  .add-btn-wrapper {
    padding-top: 15px;
    padding-bottom: 15px;
  }
</style>`;
