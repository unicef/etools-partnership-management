import {html, LitElement, property, customElement} from 'lit-element';
import '../../../../../common/components/etools-form-element-wrapper';
import '../../../components/report-status.js';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {GenericObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 */
@customElement('report-overall')
export class ReportOverall extends LitElement {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    return html`
      <div class="row-h">
        <div class="col col-5">
          <etools-form-element-wrapper2 label="PD/SPD output/expected result" .value="${this.lowerResultTitle}">
          </etools-form-element-wrapper2>
        </div>
        <div class="col col-2">
          <etools-form-element-wrapper2 label="Overall Status" no-placeholder>
            <report-status .status="${this.latestIndicator.overall_status}" slot="prefix"></report-status>
          </etools-form-element-wrapper2>
        </div>
        <div class="col col-5">
          <etools-form-element-wrapper2
            label="Narrative Assessment"
            .value="${this.latestIndicator.narrative_assessment}"
          >
          </etools-form-element-wrapper2>
        </div>
      </div>
    `;
  }

  @property({type: Object})
  lowerResultTitle!: GenericObject;

  @property({type: Object})
  latestIndicator!: GenericObject;
}
