import {html} from 'lit';

// language=HTML
export const riskRatingStyles = html` <style>
  .risk-rating-field {
    display: inline-block;
    min-height: 22px;
    padding: 0 4px;
    border-inline-start: var(--risk-rating-significant-color);
    /* TODO: capitalize might not be applied, iron-input bug */
    text-transform: capitalize;
    box-sizing: border-box;
    text-align: left;
    display: flex;
    align-items: center;
  }

  .risk-rating-field.low {
    border-inline-start: 4px solid var(--risk-rating-low-color);
  }

  .risk-rating-field.moderate,
  .risk-rating-field.medium {
    border-inline-start: 4px solid var(--risk-rating-moderate-color);
  }

  .risk-rating-field.high {
    color: var(--primary-text-color);
    border-inline-start: 4px solid var(--risk-rating-high-color);
  }

  .risk-rating-field.significant {
    color: var(--primary-text-color);
    border-inline-start: 4px solid var(--risk-rating-significant-color);
  }

  .risk-rating-field.unavailable {
    color: var(--primary-text-color);
    background-color: transparent;
    text-align: left;
    padding-inline-start: 0;
  }

  .risk-rating-field.non-assessed {
    border-inline-start: 4px solid var(--risk-rating-not-assesed-color);
  }
  .risk-rating-field.not-required {
    border-inline-start: 4px solid var(--risk-rating-not-required-color);
  }
</style>`;
