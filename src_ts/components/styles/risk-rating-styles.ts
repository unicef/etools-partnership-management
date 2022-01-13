import {html} from '@polymer/polymer/polymer-element.js';

// language=HTML
export const riskRatingStyles = html` <style>
  :host {
    --risk-rating-field: {
      display: inline-block;
      min-height: 22px;
      padding: 0 4px;
      border-left: var(--risk-rating-significant-color);
      /* TODO: capitalize might not be applied, iron-input bug */
      text-transform: capitalize;
      box-sizing: border-box;
      text-align: left;
    }

    --risk-rating-low: {
      @apply --risk-rating-field;
      border-left: 4px solid var(--risk-rating-low-color);
    }
    --risk-rating-moderate: {
      @apply --risk-rating-field;
      border-left: 4px solid var(--risk-rating-moderate-color);
    }
    --risk-rating-high: {
      @apply --risk-rating-field;
      color: var(--primary-text-color);
      border-left: 4px solid var(--risk-rating-high-color);
    }
    --risk-rating-significant: {
      @apply --risk-rating-field;
      color: var(--primary-text-color);
      border-left: 4px solid var(--risk-rating-significant-color);
    }

    --risk-rating-unavailable: {
      @apply --risk-rating-field;
      color: var(--primary-text-color);
      background-color: transparent;
      text-align: left;
      padding-left: 0;
    }
    --risk-rating-not-assessed: {
      @apply --risk-rating-field;
      border-left: 4px solid var(--risk-rating-not-assesed-color);
    }

    --risk-rating-not-required: {
      @apply --risk-rating-field;
      border-left: 4px solid var(--risk-rating-not-required-color);
    }
  }

  .risk-rating-field.low {
    @apply --risk-rating-low;
  }

  .risk-rating-field.moderate,
  .risk-rating-field.medium {
    @apply --risk-rating-moderate;
  }

  .risk-rating-field.high {
    @apply --risk-rating-high;
  }

  .risk-rating-field.significant {
    @apply --risk-rating-significant;
  }

  .risk-rating-field.unavailable {
    @apply --risk-rating-unavailable;
  }

  .risk-rating-field.non-assessed {
    @apply --risk-rating-not-assessed;
  }
  .risk-rating-field.not-required {
    @apply --risk-rating-not-required;
  }
</style>`;
