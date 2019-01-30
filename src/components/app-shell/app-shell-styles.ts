import {html} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

import './menu/styles/app-drawer-styles.js';

// language=HTML
export const AppShellStyles = html`
  <style include="app-drawer-styles">
    :host {
      display: block;
    }

    app-header-layout {
      position: relative;
    }

    .page {
      display: none;
    }

    .page[active] {
      display: block;
    }

    #floating-footer {
      background-color: var(--amendment-mode-color);
      color: var(--light-primary-text-color);
      box-sizing: border-box;
      padding: 12px 12px 12px 65px;
      position: fixed;
      bottom: 0;
      width: calc(100% - var(--app-drawer-width, 0px)); /* 0px instead of 0 is an IE requirement */
      z-index: 52; /* paper-buttons have a z-index of 51 */
    }

    /* TODO: polymer2 - make amendment mode as a new module with mixin file and style file */
    #page-container.in-amendment {
      border-top: 12px solid var(--amendment-mode-color);
      border-left: 12px solid var(--amendment-mode-color);
      border-right: 12px solid var(--amendment-mode-color);
    }

    @media print {
      #drawer,
      app-header,
      #floating-footer {
        display: none;
      }

      app-drawer-layout {
        --app-drawer-width: 0 !important;
        margin-top: -60px; /* eliminate 60px top margin set by header */
      }

      #appHeadLayout {
        width: 100%;
      }

      #page-container.in-amendment {
        border: none;
      }
    }

  </style>
`;
