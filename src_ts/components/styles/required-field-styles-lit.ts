import {html} from 'lit';
import {BASE_URL} from '../../config/config.js';

// language=HTML
export const requiredFieldStarredStyles = html` <style>
  :host > * {
    --required-star-style: {
      background: url(${BASE_URL}'/assets/images/required.svg') no-repeat 99% 20%/8px;
      width: auto !important;
      max-width: 100%;
      right: auto;
      padding-inline-end: 15px;
    }
  }

  :host-context([dir='rtl']) > * {
    --required-star-style: {
      background: url(${BASE_URL + '/assets/images/required.svg'}) no-repeat 0 20%/8px;
      width: auto !important;
      max-width: 100%;
      right: auto;
      padding-inline-end: 15px;
    }
  }
</style>`;
