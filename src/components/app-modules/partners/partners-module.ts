import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

/**
 * @polymer
 * @customElement
 */
class PartnersModule extends PolymerElement {

  public static get template() {
    // main template
    // language=HTML
    return html`
      <h1>Partners pages will load from here...</h1>
    `;
  }

}

window.customElements.define('partners-module', PartnersModule);
