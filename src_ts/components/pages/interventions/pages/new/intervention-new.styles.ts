import {css, CSSResult} from 'lit-element';

// language=css
export const NewInterventionStyles: CSSResult = css`
  :host {
    position: relative;
    display: block;
    background-color: var(--primary-background-color);
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.24), 0 0 2px rgba(0, 0, 0, 0.12);
    border-radius: 2px;
  }

  .title {
    height: 50px;
    padding: 0 35px;
    border-bottom: 1px solid var(--dark-divider-color);
    font-weight: 500;
    font-size: 18px;
    line-height: 50px;
    color: var(--dark-primary-text-color);
  }

  .form {
    padding: 0 40px;
  }

  .row {
    position: relative;
    display: flex;
    padding: 3px 0;
  }

  .row > *:not(:first-child) {
    padding-inline-start: 40px;
    box-sizing: border-box;
  }

  .buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 10px;
  }

  paper-toggle-button {
    margin-top: 25px;
  }

  paper-button {
    background-color: var(--light-disabled-text-color);
    padding: 8px 20px;
    margin-left: 24px;
  }

  .primary-btn {
    background-color: var(--default-primary-color);
  }
`;
