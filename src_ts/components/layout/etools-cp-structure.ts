import {PolymerElement, html} from '@polymer/polymer';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import '@polymer/iron-flex-layout/iron-flex-layout';
import {connect} from 'pwa-helpers/connect-mixin.js';
import orderBy from 'lodash-es/orderBy';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {store, RootState} from '../../store';
import {SharedStyles} from '../styles/shared-styles';
import {requiredFieldStarredStyles} from '../styles/required-field-styles';
import {isJsonStrMatch, isEmptyObject} from '../utils/utils';
import {CountryProgram, GenericObject} from '@unicef-polymer/etools-types';
import {logWarn} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {property} from '@polymer/decorators';

/**
 * @polymer
 * @customElement
 */
export class EtoolsCpStructure extends connect(store)(PolymerElement) {
  static get template() {
    return html`
      ${SharedStyles} ${requiredFieldStarredStyles}
      <style>
        :host {
          @apply --layout-horizontal;
        }

        *[hidden] {
          display: none !important;
        }

        #cpStructure {
          width: 100%;
        }
      </style>

      <etools-dropdown
        id="cpStructure"
        label="CP Structure"
        placeholder="&#8212;"
        options="[[sortedCountryProgrammes]]"
        option-value="id"
        option-label="name"
        selected="{{selectedCp}}"
        hide-search
        readonly$="[[!editMode]]"
        required$="[[required]]"
        auto-validate
        error-message="Please select CP Structure"
      >
      </etools-dropdown>
    `;
  }

  @property({type: Array})
  countryProgrammes!: CountryProgram[];

  @property({type: Array})
  sortedCountryProgrammes!: CountryProgram[];

  @property({type: String, notify: true})
  selectedCp!: string;

  @property({type: Object})
  appModuleItem: GenericObject | null = null;

  @property({type: String})
  module!: string;

  @property({type: Boolean})
  editMode = false;

  @property({type: Boolean})
  required = false;

  private cpInitDebouncer!: Debouncer;

  static get observers() {
    return ['_countryProgrammesChanged(countryProgrammes, appModuleItem)'];
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.countryProgrammes, state.commonData!.countryProgrammes)) {
      this.countryProgrammes = state.commonData!.countryProgrammes;
    }
  }

  _getCurrentCountryProgramme(cpOptions: CountryProgram[]) {
    if (isEmptyObject(cpOptions)) {
      return null;
    }

    if (cpOptions.length === 1) {
      // just one cp available
      return cpOptions[0];
    } else {
      // more than 1 cp available, use first one found that is active, not special and not future
      return cpOptions.find((cp: CountryProgram) => cp.active && !cp.future && !cp.special);
    }
  }

  setDefaultSelectedCpStructure() {
    if (isEmptyObject(this.sortedCountryProgrammes)) {
      return;
    }

    const currentCP = this._getCurrentCountryProgramme(this.sortedCountryProgrammes);

    this.set('selectedCp', currentCP ? currentCP.id : null);
  }

  _countryProgrammesChanged(_countryProgrammes: CountryProgram[], appModuleItem: any) {
    this.cpInitDebouncer = Debouncer.debounce(this.cpInitDebouncer, timeOut.after(10), () => {
      if (appModuleItem) {
        this._prepareCpsForDisplay();

        if (!this.selectedCp) {
          this.setDefaultSelectedCpStructure();
        } else {
          if (this._hasExpiredCpAssigned(this.selectedCp)) {
            logWarn(this._getExpiredCPWarning());
          }
        }
      }
    });
  }

  _prepareCpsForDisplay() {
    const displayableCps = orderBy(this.countryProgrammes, ['future', 'active', 'special'], ['desc', 'desc', 'asc']);

    // NOTE: Do not remove this code yet, it might be restored in the future
    // if (!this.appModuleItem || !this.appModuleItem.id) {
    //   // On new intervention or agreement
    //   this._markExpiredCpsAsDisabled(displayableCps);
    // } else {
    //   this._resetExpiredCpsMarkedAsDisabled(displayableCps);
    // }

    this.sortedCountryProgrammes = displayableCps;
  }

  // _markExpiredCpsAsDisabled(sortedCps) {
  //   this._markExpiredCps(sortedCps, true);
  // }

  // _resetExpiredCpsMarkedAsDisabled(sortedCps) {
  //   this._markExpiredCps(sortedCps, false);
  // }

  // _markExpiredCps(sortedCps, disabled) {
  //   sortedCps.forEach((element) => {
  //     if (element.expired) {
  //       element.disableSelection = disabled;
  //     }
  //   });
  // }

  _hasExpiredCpAssigned(cpId: string) {
    if (cpId || !isEmptyObject(this.countryProgrammes)) {
      return false;
    }

    return this.countryProgrammes.some((cp: CountryProgram) => {
      return parseInt(cp.id, 10) === parseInt(cpId, 10) && cp.expired;
    });
  }

  _getExpiredCPWarning() {
    let msg = '';
    switch (this.module) {
      case 'agreements':
        msg = 'Agreement ' + this.appModuleItem ? this.appModuleItem!.agreement_number : '';
        break;
      case 'interventions':
        msg = 'PD/SSFA ' + this.appModuleItem ? this.appModuleItem!.number : '';
        break;
    }
    return msg + ' has an old/expired CP Structure!';
  }

  resetCpDropdownInvalidState() {
    const cp = this._getCpStructureDropdown();
    if (cp) {
      cp.resetInvalidState();
    }
  }

  validate() {
    const cp = this._getCpStructureDropdown();
    return cp ? cp.validate() : true;
  }

  _getCpStructureDropdown() {
    return this.shadowRoot!.querySelector('#cpStructure') as PolymerElement & {
      resetInvalidState(): void;
      validate(): boolean;
    };
  }
}

window.customElements.define('etools-cp-structure', EtoolsCpStructure);
