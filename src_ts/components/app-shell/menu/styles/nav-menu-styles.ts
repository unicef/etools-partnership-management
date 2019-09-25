import {html} from '@polymer/polymer/polymer-element';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

// language=HTML
export const navMenuStyles = html`
  <style>
    *[hidden] {
      display: none !important;
    }

    :host {
      @apply --layout-vertical;
      height: 100%;
      overflow-y: var(--side-bar-scrolling);
      overflow-x: hidden;
      border-right: 1px solid var(--dark-divider-color);
    }

    :host([small-menu]) {
      overflow-x: visible;
    }

    @media (max-height: 600px) {
      paper-tooltip {
        display: none;
      }

      :host([small-menu]) {
        overflow-x: hidden;
      }
    }

    .menu-header,
    :host([small-menu]) .menu-header .ripple-wrapper.main,
    .nav-menu-item {
      @apply --layout-horizontal;
      @apply --layout-center;
    }

    .menu-header {
      @apply --layout-justified;
      background-color: var(--primary-color);
      color: white;
      min-height: 60px;
      padding: 0 16px;
      font-size: 14px;
      line-height: 18px;
      text-transform: uppercase;
    }

    :host([small-menu]) .menu-header {
      padding: 0;
    }

    :host([small-menu]) .menu-header .ripple-wrapper.main {
      width: 60px;
      height: 60px;
    }

    :host([small-menu]) .menu-header,
    .nav-menu-item.section-title,
    :host([small-menu]) .nav-menu-item,
    :host([small-menu]) .menu-header .ripple-wrapper.main {
      @apply --layout-center-justified;
    }

    :host([small-menu]) #app-name,
    :host #menu-header-top-icon,
    :host([small-menu]) .nav-menu-item .name,
    :host(:not([small-menu])) paper-tooltip,
    :host([small-menu]) .section-title span,
    :host([small-menu]) #minimize-menu,
    :host([small-menu]) .menu-header .ripple-wrapper:not(.main) {
      display: none;
    }

    :host([small-menu]) #menu-header-top-icon,
    :host(:not([small-menu])) #minimize-menu {
      display: block;
    }

    .menu-header paper-icon-button {
      --paper-icon-button: {
        width: 24px;
        height: 24px;
        padding: 0;
      }
    }

    #menu-header-top-icon,
    #minimize-menu {
      cursor: pointer;
    }

    #menu-header-top-icon {
      width: 36px;
      height: 36px;
    }

    .divider {
      margin: 8px 0;
      border-bottom: 1px solid var(--dark-divider-color);
    }

    .nav-menu {
      @apply --layout-vertical;
      background: var(--primary-background-color);
      min-height: 550px;
      padding: 8px 0 0;
    }

    .nav-menu, .nav-menu iron-selector[role="navigation"] {
      @apply --layout-flex;
    }

    .nav-menu-item {
      width: 100%;
      font-size: 14px;
      font-weight: 500;
      position: relative;
      height: 48px;
      cursor: pointer;
      text-decoration: none;
      text-transform: capitalize;
    }

    .nav-menu-item.no-transform {
      text-transform: none;
    }

    .nav-menu-item.section-title {
      color: var(--primary-text-color);
      font-size: 13px;
      font-weight: 500;
      text-transform: none;
      border-top: 1px solid var(--dark-divider-color);
    }

    :host([small-menu]) .nav-menu-item.section-title {
      height: 0;
    }

    .nav-menu-item.iron-selected {
      background-color: var(--secondary-background-color);
    }

    .nav-menu-item.iron-selected:active {
      background-color: var(--dark-divider-color);
    }

    .nav-menu-item .name {
      margin-left: 16px;
      color: var(--primary-text-color);
    }

    .nav-menu-item iron-icon {
      margin: 0 16px;
      color: var(--dark-icon-color);
    }

    :host([small-menu]) .nav-menu-item iron-icon {
      margin: 0;
    }

    .nav-menu-item.iron-selected .name,
    .nav-menu-item.iron-selected iron-icon {
      color: var(--primary-color);
    }

    .nav-menu-item.lighter-item .name,
    .nav-menu-item.lighter-item iron-icon {
      color: var(--secondary-text-color);
    }

    .last-one {
      margin-bottom: 18px;
    }

    .ripple-wrapper {
      position: relative;
    }
  </style>
`;
