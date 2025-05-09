import {css, CSSResult} from 'lit';

// language=css
export const NewGDDInterventionStyles: CSSResult = css`
  :host {
    position: relative;
    display: block;
    background-color: var(--primary-background-color);
    box-shadow:
      0 2px 2px rgba(0, 0, 0, 0.24),
      0 0 2px rgba(0, 0, 0, 0.12);
    border-radius: 2px;
  }

  .title {
    height: 50px;
    padding: 0 35px;
    border-bottom: 1px solid var(--dark-divider-color);
    font-weight: 500;
    font-size: var(--etools-font-size-18, 18px);
    line-height: 50px;
    color: var(--dark-primary-text-color);
  }

  .form {
    padding: 0 40px;
  }

  /*.row {*/
  /*  position: relative;*/
  /*  display: flex;*/
  /*  padding: 3px 0;*/
  /*}*/

  /*.row > *:not(:first-child) {*/
  /*  padding-inline-start: 40px;*/
  /*  box-sizing: border-box;*/
  /*}*/

  .buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-top: 15px;
    padding-bottom: 20px;
  }

  etools-button {
    margin-inline-start: 24px;
  }
`;
