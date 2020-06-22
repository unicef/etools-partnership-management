import { PolymerElement, html } from "@polymer/polymer";
import "@polymer/paper-input/paper-input.js";

import { GenericObject } from "../../../../../../../typings/globals.types";
import { fireEvent } from "../../../../../../utils/fire-custom-event";
import { toNumericValues } from "./mixins/disaggregation-field";
import { property } from "@polymer/decorators";
import { PaperInputElement } from "@polymer/paper-input/paper-input.js";

/**
 * @polymer
 * @customElement
 */
class DisaggregationField extends PolymerElement {
  static get is() {
    return "disaggregation-field";
  }

  static get template() {
    return html`
      <style>
        :host {
          display: block;

          --paper-input-container: {
            padding: 0;
          }

          --paper-input-container-input: {
            font-size: 13px;
          }

          --paper-input-container-input-webkit-spinner: {
            display: none;
          }
        }
      </style>

      <paper-input
        id="field"
        value="[[value]]"
        type="number"
        allowed-pattern="[+-d]"
        invalid="{{invalid}}"
        validator="[[validator]]"
        min="[[min]]"
        no-label-float
        required
        auto-validate
      >
      </paper-input>
    `;
  }

  @property({ type: String })
  key!: string;

  @property({ type: String })
  coords!: string;

  @property({ type: Number })
  min!: number;

  @property({ type: String })
  validator!: string;

  @property({ type: Number, notify: true })
  value!: number;

  @property({ type: Boolean, notify: true })
  invalid!: boolean;

  ready() {
    super.ready();
    this._handleInput = this._handleInput.bind(this);
    this.addEventListener("field.input", this._handleInput as any);
  }

  connectedCallback() {
    super.connectedCallback();
    fireEvent(this, "register-field", this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("field.input", this._handleInput as any);
  }

  validate() {
    return (this.$.field as PaperInputElement).validate();
  }

  getField() {
    return this.$.field;
  }

  _handleInput(e: CustomEvent) {
    const change: GenericObject = {};

    change[this.key] = (e.target as any).value;

    fireEvent(this, "field-value-changed", {
      key: this.coords,
      value: toNumericValues(change),
    });
  }
}

window.customElements.define(DisaggregationField.is, DisaggregationField);
