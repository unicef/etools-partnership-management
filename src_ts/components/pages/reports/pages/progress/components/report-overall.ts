import {css, html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '../../../components/report-status.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {GenericObject} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';

/**
 * @LitElement
 * @customElement
 */
@customElement('report-overall')
export class ReportOverall extends LitElement {
  static get styles() {
    return [
      layoutStyles,
      css`
        .status-column etools-input::part(input) {
          width: 0;
        }
        .row {
          padding: 16px 24px !important;
        }
      `
    ];
  }
  render() {
    return html`
      <div class="row">
        <div class="col col-md-5 col-12">
          <etools-textarea
            readonly
            placeholder="—"
            label="${translate('PD_SPD_OUTPUT_EXPECTED_RESULT')}"
            .value="${this.lowerResultTitle}"
          >
          </etools-textarea>
        </div>
        <div class="col col-md-2 col-12 status-column">
          <etools-input readonly placeholder="" label="${translate('OVERALL_STATUS')}">
            <report-status
              .final="${this.final}"
              .status="${this.latestIndicator.overall_status}"
              slot="prefix"
            ></report-status>
          </etools-input>
        </div>
        <div class="col col-md-5 col-12">
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

  @property({type: Boolean})
  final = false;

  @property({type: Object})
  lowerResultTitle!: GenericObject;

  @property({type: Object})
  latestIndicator!: GenericObject;
}
