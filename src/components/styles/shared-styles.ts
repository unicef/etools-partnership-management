import { html } from '@polymer/polymer/polymer-element.js';

export const SharedStyles = html`
<style>
  :host {
    display: block;
    box-sizing: border-box;
  }
  
  *[hidden] {
    display: none !important;
  }
  
  h1, h2 {
    color: var(--primary-text-color);
    margin: 0;
    font-weight: normal;
  }
  
  h1 {
    text-transform: capitalize;
    font-size: 24px;
  }
  
  h2 {
    font-size: 20px;
  }

  a {
    color: var(--primary-color);
    text-underline: none;
  }
  
  section {
    padding: 18px 24px;
    background-color: var(--primary-background-color);
  }
</style>
`;
