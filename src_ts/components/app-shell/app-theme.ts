import '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/custom-style';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-styles/color.js';

const documentContainer = document.createElement('template');
documentContainer.innerHTML = `
  <custom-style>
    <style>
      html {
        --primary-color: #0099ff;
        --secondary-color: #0061e9; /* TODO: unused color, remove? */
        --ternary-color: #009a54;

        --primary-background-color: #FFFFFF;
        --secondary-background-color: #eeeeee;
        --light-theme-background-color: var(--paper-grey-50);
        --medium-theme-background-color: #eeeeee;
        --dark-theme-background-color: #233944;

        --primary-text-color: rgba(0, 0, 0, 0.87);
        --dark-primary-text-color: var(--primary-text-color);
        --medium-primary-text-color: #9D9D9D;
        --light-primary-text-color: rgba(255, 255, 255, 1);

        --expand-icon-color: #4d4d4d;

        --secondary-text-color: rgba(0, 0, 0, 0.54);
        --light-secondary-text-color: rgba(255, 255, 255, 0.7);
        --dark-secondary-text-color: var(--secondary-text-color);

        --dark-disabled-text-color: rgba(0, 0, 0, 0.38);
        --light-disabled-text-color: var(--medium-primary-text-color);

        --light-icon-color: rgba(255, 255, 255, 1);
        --medium-icon-color: var(--medium-primary-text-color);
        --dark-icon-color: rgba(0, 0, 0, 0.65);
        --light-disabled-icon-color: var(--medium-primary-text-color);
        --dark-disabled-icon-color: rgba(0, 0, 0, 0.38);

        --light-divider-color: rgba(0, 0, 0, 0.12);
        --light-hex-divider-color: #b8b8b8;
        --dark-divider-color: rgba(0, 0, 0, 0.40);
        --darker-divider-color: var(--medium-primary-text-color);

        --light-hover-color: rgba(255, 255, 255, 0.01);
        --dark-hover-color: rgba(0, 0, 0, 0.01);

        --light-ink-color: rgba(255, 255, 255, 0.30);
        --dark-ink-color: rgba(0, 0, 0, 0.3);

        --dark-theme-background-color: #233944;

        --header-color: #ffffff;
        --header-bg-color: var(--dark-theme-background-color);
        --nonprod-header-color: #a94442;
        --nonprod-text-warn-color: #e6e600;

        --amendment-mode-color: rgba(139,0,216, .99); /* .99 is to fix chrome strange bg color transparency */

        --main-border-color: #c1c1c1;

        --error-color: #ea4022;
        --light-error-color: #f1b8ae;
        --dark-error-color: #c5102a;

        --warning-color: #ff9044;
        --light-warning-color: #ffc8a2;

        --success-color: #72c300;
        --light-success-color: #bef078;

        --info-color: #cebc06;
        --light-info-color: #fff176;
        --lightest-info-color: #fef9cd;

        --error-box-heading-color: var(--error-color);
        --error-box-bg-color: #f2dede;
        --error-box-border-color: #ebccd1;
        --error-box-text-color: var(--error-color);

        --add-button-color: var(--success-color);
        --icon-delete-color: var(--error-color);

        --gray-06: rgba(0,0,0,.06);
        --gray-light: rgba(0,0,0,.38);

        /* partner risk ratings colors */
        --risk-rating-not-assesed-color: #dcd8d8;
        --risk-rating-high-color: #740E0E;
        --risk-rating-significant-color: #F05454;
        --risk-rating-moderate-color: #ffca3a;
        --risk-rating-low-color: #2FB0F2;
        --risk-rating-not-required-color: #D8D8D8;

        --status-synced-color: #00A651;
        --status-blocked-color: #FFA149;
        --status-not-synced-color: #3A94FF;

        --status-suspended-color: var(--warning-color);
        --status-terminated-color: var(--error-box-heading-color);
        --status-completed-color: var(--success-color);
        --status-active-color: var(--primary-color);

        /* etools-action-button styles*/
        --etools-action-button-main-color: var(--primary-color);
        --etools-action-button-text-color: var(--light-primary-text-color);
        --etools-action-button-dropdown-higlight-bg: var(--list-second-bg-color);
        --etools-action-button-divider-color: rgba(255, 255, 255, 0.12);

        /* etools-status styles */
        --etools-status-divider-color: var(--light-divider-color);
        --etools-status-icon-inactive-color: var(--medium-icon-color);
        --etools-status-icon-pending-color: var(--primary-color);
        --etools-status-icon-completed-color: var(--success-color);
        --etools-status-icon-text-color: var(--light-primary-text-color);
        --etools-status-text-color: var(--medium-primary-text-color);
        --etools-status-inactive-text-color: var(--primary-text-color);

        /* list colors */
        --list-primary-color: var(--primary-color);
        --list-secondary-color: var(--primary-background-color);
        --list-divider-color: var(--light-divider-color);
        --list-bg-color: var(--primary-background-color);
        --list-second-bg-color: var(--medium-theme-background-color);
        --list-text-color: var(--primary-text-color);
        --list-secondary-text-color: var(--secondary-text-color);
        --list-icon-hover-color: var(--primary-text-color);
        --list-icon-color: var(--dark-icon-color);
        --list-disabled-icon-color: var(--light-disabled-icon-color);

        /* custom etools polymer elements general customization */

        /* paper-checkbox, radio btns style */
        --paper-checkbox-checked-color: var(--primary-color);
        --paper-checkbox-unchecked-color: var(--secondary-text-color);
        --paper-radio-button-checked-color: var(--primary-color);
        --paper-radio-button-unchecked-color: var(--secondary-text-color);
        --paper-toggle-button-checked-bar-color: var(--primary-color);
        --paper-toggle-button-checked-button-color: var(--primary-color);

        /* etools-panel styles */
        --ecp-header-color: var(--primary-text-color);

        --ecp-expand-btn: {
          color: var(--light-icon-color);
          padding: 4px;
        };

        --toolbar-height: 60px;
        --side-bar-scrolling: visible;

        --esmm-external-wrapper: {
          width: 100%;
          margin: 0;
        };
        --esmm-delete-icon-color: var(--error-color);

        /* global loading box content */
        --etools-loading-border-color: rgba(255, 255, 255, 0.12);
        --etools-loading-shadow-color: #333333;

        --paper-item: {
          cursor: pointer;
        };

        --paper-input-container-label-floating: {
          color: var(--secondary-text-color, #737373);
        };

        --paper-input-prefix: {
          color: var(--secondary-text-color, #737373);
        };

        /* In Edge, paper-input's internal value is not updated
           when it's cleared by click on x btn, so we're hiding the btn
        */
        --paper-input-container-ms-clear: {
          display: none;
          width:0;
          height:0;
        };

        --paper-tooltip-delay-in: 0;
        
        --required-star-style: {
          background: url('./images/required.svg') no-repeat 99% 20%/8px;
          width: auto !important;
          max-width: 100%;
          right: auto;
          padding-right: 15px;
        }
      }

      html[dir="rtl"] {
        --list-row-wrapper-padding: 0;

        --required-star-style: {
          background: url('./images/required.svg') no-repeat 99% 20%/8px;
          right: auto;
          padding-right: 15px;
        }
      }

    </style>
  </custom-style>
  `;

// @ts-ignore
document.head.appendChild(documentContainer.content);
