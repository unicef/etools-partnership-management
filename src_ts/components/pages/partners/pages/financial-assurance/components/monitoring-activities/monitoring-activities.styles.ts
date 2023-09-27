import {html} from 'lit';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
// language=HTML
export const monitoringActivitiesStyles = html`<style>
  ${dataTableStylesLit} :host {
    display: block;
    margin: 24px 0;
    --paper-input-container-input-webkit-spinner: {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  etools-content-panel::part(ecp-content) {
    padding: 0;
    overflow: hidden;
  }

  etools-data-table-column {
    font-weight: 500;
  }
  .flex-2 {
    flex: 2;
  }
  .flex-1 {
    flex: 1;
  }
  .flex-none {
    flex: none;
  }
  .row {
    height: 48px;
    font-size: 13px;
    color: var(--list-text-color, #2b2b2b);
    padding: 0 35px;
    border-bottom: 1px solid var(--list-divider-color, #9d9d9d);
    align-items: center;
    transition: padding 0.2s;
  }
  .cloned-row {
    position: fixed;
    z-index: 10000000;
    background-color: #ffffff;
    opacity: 0.9;
  }
  .original-row {
    opacity: 0.3;
  }
  .activities {
    position: relative;
    transition: padding 0.2s;
  }
  .activities.hovered:not(.origin-group) .row {
    background-color: #fcf5e7;
  }
  .activities.hovered:not(.origin-group),
  .activities.grouped {
    padding-block: 10px;
    padding-inline: 30px 0;
  }
  .activities.hovered:not(.origin-group) .row,
  .activities.grouped .row {
    padding-inline-start: 5px;
  }
  .activities .remove,
  .activities .braces {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    height: calc(100% - 10px);
    top: 5px;
    left: 22px;
    white-space: nowrap;
    transition: 0.2s;
    transform: scaleY(1);
  }
  .activities:not(.grouped):not(.hovered) .braces,
  .activities.origin-group .braces {
    transform: scaleY(0);
  }
  .activities .braces:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 8px;
    border: 1px solid #000000;
    border-inline-end: none;
  }
  .activities .remove .description,
  .activities .braces .description {
    position: relative;
    left: calc(-50% - 8px);
    transform: rotate(-90deg);
    font-size: 11px;
  }
  .activities .remove {
    left: 0;
    width: 20px;
  }
  .activities .remove .remove-button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #ff8d8d;
    border: 1px solid #ff8d8d;
    border-radius: 2px;
    transform: translate(-30px);
    transition: 0.2s;
  }

  .activities.origin-group .remove.hovered .remove-button {
    background-color: #ff5454;
    border: 1px solid #ff5454;
    transform: scale(1.02);
  }
  .activities.origin-group.grouped .remove .remove-button {
    transform: translate(0);
  }
  .activities .remove .description {
    left: 0;
  }
  etools-icon {
    margin-inline-end: 10px;
    cursor: pointer;
  }
  .actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-inline-end: 15px;
    margin-bottom: 15px;
  }
  .cell:not(:last-of-type) {
    padding-inline-end: 16px;
  }
  .panel-row-tall {
    height: 56px;
    background-color: var(--medium-theme-background-color, #eeeeee);
  }
  .no-activities {
    padding: 30px 24px;
  }
</style>`;
