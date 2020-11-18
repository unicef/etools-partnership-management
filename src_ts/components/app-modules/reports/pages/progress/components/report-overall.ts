import {PolymerElement, html} from '@polymer/polymer';
import '../../../../interventions/pages/intervention-tab-pages/common/layout/etools-form-element-wrapper';
import '../../../../../styles/grid-layout-styles.js';

import '../../../components/report-status.js';
import {gridLayoutStyles} from '../../../../../styles/grid-layout-styles';
import {property} from '@polymer/decorators';
import {GenericObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 */
class ReportOverall extends PolymerElement {
  static get is() {
    return 'report-overall';
  }

  static get template() {
    return html`
      ${gridLayoutStyles}

      <div class="row-h">
        <div class="col col-5">
          <etools-form-element-wrapper label="PD/SPD output/expected result" value="[[lowerResultTitle]]">
          </etools-form-element-wrapper>
        </div>
        <div class="col col-2">
          <etools-form-element-wrapper label="Overall Status" no-placeholder>
            <report-status status="[[latestIndicator.overall_status]]" slot="prefix"></report-status>
          </etools-form-element-wrapper>
        </div>
        <div class="col col-5">
          <etools-form-element-wrapper label="Narrative Assessment" value="[[latestIndicator.narrative_assessment]]">
          </etools-form-element-wrapper>
        </div>
      </div>
    `;
  }

  @property({type: Object})
  lowerResultTitle!: GenericObject;

  @property({type: Object})
  latestIndicator!: GenericObject;
}

window.customElements.define(ReportOverall.is, ReportOverall);
