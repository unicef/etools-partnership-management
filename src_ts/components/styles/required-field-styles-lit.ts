import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';
import {html} from 'lit';

// language=HTML
export const requiredFieldStarredStyles = html` <style>
  :host > * {
    --required-star-style: {
      background: url(${Environment.basePath}'/assets/images/required.svg') no-repeat 99% 20%/8px;
      width: auto !important;
      max-width: 100%;
      right: auto;
      padding-inline-end: 15px;
    }
  }

  :host-context([dir='rtl']) > * {
    --required-star-style: {
      background: url(${Environment.basePath + '/assets/images/required.svg'}) no-repeat 0 20%/8px;
      width: auto !important;
      max-width: 100%;
      right: auto;
      padding-inline-end: 15px;
    }
  }
</style>`;
