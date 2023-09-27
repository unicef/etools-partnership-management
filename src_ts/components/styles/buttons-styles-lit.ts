import {html} from 'lit';

// language=HTML
export const buttonsStyles = html` <style>
  sl-button {
    --sl-button-font-size-medium: 16px;
    --sl-input-height-medium: 34px;
  }

  sl-button.no-pad {
    --sl-spacing-medium: 0;
  }

  sl-button.export {
    margin-inline-end: 15px;
  }
  sl-button.export::part(base) {
    --sl-color-primary-600: var(--dark-secondary-text-color);
    text-transform: uppercase;
    font-weight: 600;
  }
  sl-button.export::part(label) {
    padding-inline-start: 5px;
    padding-inline-end: 5px;
  }
  sl-button[variant='text'].primary-btn {
    --sl-color-primary-600: var(--primary-color);
  }
  sl-button[variant='text'].primary-btn::part(label) {
    text-transform: uppercase;
  }
  .buttons-section {
    border-top: 1px solid var(--dark-divider-color);
    padding: 24px;
  }
  .buttons-section.horizontal {
    display: flex;
    flex-direction: row;
  }
  .buttons-section.vertical {
    display: flex;
    flex-direction: column;
  }

  .buttons-section.vertical .primary-btn:not(:first-of-type) {
    margin-top: 16px;
  }

  .primary-btn {
    --sl-color-primary-600: var(--primary-color);
    color: var(--light-primary-text-color, #fff);
  }

  .danger-btn {
    background-color: var(--error-color);
  }

  .warning-btn {
    background-color: var(--warning-color);
  }

  .success-btn {
    background-color: var(--success-color);
  }

  .primary-btn.with-prefix {
    color: var(--light-primary-text-color, #fff);
  }

  .secondary-btn-wrapper {
    width: 100%;
    --paper-input-container-input: {
      width: auto;
      margin: 0;
      color: var(--primary-color);
      padding: 0;
      padding-inline-end: 5px;
      font-size: 14px;
      font-weight: bold;
    }
  }

  .secondary-btn etools-icon {
    margin-inline-end: 5px;
  }

  /* responsive css rules */
  @media (min-width: 850px) {
  }
</style>`;
