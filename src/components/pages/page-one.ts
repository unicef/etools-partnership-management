import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';

import { SharedStyles } from '../styles/shared-styles.js';
/**
 * @polymer
 * @customElement
 */
class PageOne extends PolymerElement {

  public static get template() {
    // main template
    // language=HTML
    return html`
      <style include="paper-material-styles"></style>
      ${SharedStyles}
      <section class="paper-material" elevation="1">
        <h1>Page 1</h1>
        <p>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took 
        a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, 
        but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 
        1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop 
        publishing software like Aldus PageMaker including versions of Lorem Ipsum.
        </p>
      </section>
    `;
  }

}

window.customElements.define('page-one', PageOne);
