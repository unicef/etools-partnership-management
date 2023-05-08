import {html} from 'lit-element';

// language=HTML
export const buttonsStyles = html` <style>
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
    background-color: var(--primary-color);
    color: var(--light-primary-text-color, #fff);
    font-weight: bold;
    padding: 5px 10px;
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
    font-weight: bold;
    padding: 5px;
    padding-inline: 16px 10px;
  }
  paper-button .btn-label {
    display: flex;
    flex-direction: row;
    flex: 1;
    justify-content: center;
  }

  paper-button.w100 {
    width: 100%;
    margin-inline-end: 0;
    margin-inline-start: 0;
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

  .secondary-btn {
    --paper-button: {
      width: auto;
      margin: 0;
      color: var(--primary-color);
      padding: 0;
      padding-inline-end: 5px;
      font-size: 14px;
      font-weight: bold;
    }
  }

  .secondary-btn iron-icon {
    margin-inline-end: 5px;
  }

  .white-btn {
    background-color: white;
    --paper-button: {
      color: var(--primary-color);
    }
    font-weight: bold;
  }

  /* responsive css rules */
  @media (min-width: 850px) {
  }
</style>`;
