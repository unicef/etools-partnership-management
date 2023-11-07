import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '../../../components/report-status.js';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {GenericObject} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';

/**
 * @LitElement
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
          <etools-textarea
            readonly
            placeholder="—"
            label="${translate('PD_SPD_OUTPUT_EXPECTED_RESULT')}"
            .value="${this.lowerResultTitle}"
          >
          </etools-textarea>
        </div>
        <div class="col col-2">
          <etools-input readonly placeholder="—" label="${translate('OVERALL_STATUS')}" no-placeholder>
            <report-status .status="${this.latestIndicator.overall_status}" slot="prefix"></report-status>
          </etools-input>
        </div>
        <div class="col col-5">
          <etools-textarea
            readonly
            placeholder="—"
            label="${translate('NARRATIVE_ASSESSMENT')}"
            .value="${this.latestIndicator.narrative_assessment}"
          >
          </etools-textarea>
        </div>
      </div>
    `;
  }

  @property({type: Object})
  lowerResultTitle!: GenericObject;

  @property({type: Object})
  latestIndicator!: GenericObject;
}
