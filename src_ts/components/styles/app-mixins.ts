import '@polymer/polymer/lib/elements/custom-style.js';
import {css, html} from 'lit';

export const pageTitle = css`
  margin: 0;
  font-weight: normal;
  text-transform: capitalize;
  font-size: 24px;
  line-height: 1.3;
  min-height: 31px;
`;

const documentContainer = document.createElement('template');
// language=HTML
documentContainer.innerHTML = `
  <custom-style>
    <style>
      html {      

        --nested-content-panel-title: {
          color: var(--primary-color);
          text-align: left;
          font-size: 16px;
          font-weight: bold;
        };

        --nested-content-panel-collapse-btn: {
          color: var(--dark-icon-color);
          width: 28px;
          height: 28px;
          padding: 0;
          margin-inline-end: 15px;
        };

        --paper-fab-btn-green: {
          width: 58px;
          height: 58px;
          background: var(--add-button-color);
          z-index: 51;

        };

        --basic-btn-style: {
          width: auto;
          margin: 0;
          color: var(--primary-color);
          padding: 0;
          padding-inline-end: 5px;
          font-size: 14px;
          font-weight: bold;
        };       

        --partner-status-wrapper: {
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 24px;
          height: 24px;
          -webkit-border-radius: 50%;
          -moz-border-radius: 50%;
          border-radius: 50%;
        };

        --pmp-paper-dialog-content: {
          padding: 8px 24px;
          overflow-x: hidden;
          overflow-y: auto;
        };
      }
    </style>
  </custom-style>`;

// @ts-ignore
document.head.appendChild(documentContainer!.content);
