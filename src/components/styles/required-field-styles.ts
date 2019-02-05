import {html, htmlLiteral} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import {BASE_URL} from '../../config/config.js';

const baseUrlData: ReadonlyArray<string> = [BASE_URL];
const baseUrl = htmlLiteral(baseUrlData as TemplateStringsArray);

// language=HTML
export const requiredFieldStarredStyles = html`
  <style>
    :host > * {
      --required-star-style: {
        background: url(${baseUrl}'/images/required.svg') no-repeat 99% 20%/8px;
        width: auto !important;
        max-width: 100%;
        right: auto;
        padding-right: 15px;
      };
    }

    paper-input[required][label],
    paper-input-container[required],
    etools-date-input[required],
    etools-dropdown[required],
    etools-dropdown-multi[required],
    etools-upload[required],
    etools-currency-amount-input[required] {
      --paper-input-container-label: {
        @apply --required-star-style;
        color: var(--secondary-text-color, #737373)
      };
      --paper-input-container-label-floating: {
        @apply --required-star-style;
        color: var(--secondary-text-color, #737373);
      }
    }
  </style>`;
