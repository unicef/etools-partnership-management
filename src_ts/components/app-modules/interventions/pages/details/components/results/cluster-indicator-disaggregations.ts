import {PolymerElement, html} from '@polymer/polymer';
import {gridLayoutStyles} from '../../../../../../styles/grid-layout-styles';
import {SharedStyles} from '../../../../../../styles/shared-styles';
import {buttonsStyles} from '../../../../../../styles/buttons-styles';
import {GenericObject} from '../../../../../../../typings/globals.types';
import {property} from '@polymer/decorators';

/**
 * @polymer
 * @customElement
 */
class ClusterIndicatorDisaggregations extends PolymerElement {
  static get is() {
    return 'cluster-indicator-disaggregations';
  }

  static get template() {
    return html`
      <style>
        [hidden] {
          display: none !important;
        }
        :host {
          display: block;
          width: 100%;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
        }
        paper-input {
          width: 100%;
        }
      </style>
      ${gridLayoutStyles} ${SharedStyles} ${buttonsStyles}
      <div hidden$="[[!disaggregations.length]]">
        <template is="dom-repeat" items="{{disaggregations}}" as="item">
          <div class="row-h ">
            <div class="col col-4">
              <div class="layout-vertical">
                <label class="paper-label">Disaggregate By</label>
                <label class="input-label" empty$="[[!item.name]]">[[item.name]]</label>
              </div>
            </div>
            <div class="col col-8">
              <div class="layout-vertical">
                <label class="paper-label">Disaggregation Groups</label>
                <label class="input-label" empty$="[[!item.choices]]">[[_getGroupNames(item.choices)]]</label>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="row-h" hidden$="[[!_noDisaggregations(disaggregations, disaggregations.length)]]">
        <p>There are no disaggregations added.</p>
      </div>
    `;
  }

  @property({type: Array})
  disaggregations!: [];

  _noDisaggregations(disaggregations: any, disaggregLength: number) {
    return !disaggregations || !disaggregLength;
  }
  _getGroupNames(groups: GenericObject[]) {
    if (!groups) {
      return '';
    }
    let groupNames = '';
    groups.forEach(function (g) {
      groupNames += g.value + '; ';
    });
    return groupNames;
  }
}
window.customElements.define(ClusterIndicatorDisaggregations.is, ClusterIndicatorDisaggregations);
