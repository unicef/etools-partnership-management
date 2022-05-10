import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import '@polymer/iron-flex-layout/iron-flex-layout';
import {connect} from 'pwa-helpers/connect-mixin.js';
import orderBy from 'lodash-es/orderBy';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {store, RootState} from '../../../redux/store';
import {SharedStyles} from '../../styles/shared-styles';
import {requiredFieldStarredStyles} from '../../styles/required-field-styles';
import {isJsonStrMatch, isEmptyObject} from '../../utils/utils';
import {CountryProgram, GenericObject} from '@unicef-polymer/etools-types';
import {logWarn} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {html, LitElement, property} from 'lit-element';
import CommonMixinLit from '../mixins/common-mixin-lit';
import {get as getTranslation} from 'lit-translate';
import {fireEvent} from '../../utils/fire-custom-event';
import {PolymerElement} from '@polymer/polymer';

/**
 * @polymer
 * @customElement
 */
export class EtoolsCpStructure extends connect(store)(CommonMixinLit(LitElement)) {
  render() {
    return html`
      ${SharedStyles} ${requiredFieldStarredStyles}
      <style>
        :host {
          display: flex;
          flex-direction: row;
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
        .label="${getTranslation('CP_STRUCTURE')}"
        placeholder="&#8212;"
        .options="${this.sortedCountryProgrammes}"
        option-value="id"
        option-label="name"
        .selected="${this.selectedCp}"
        hide-search
        ?readonly="${!this.editMode}"
        ?required="${this.required}"
        auto-validate
        error-message="Please select CP Structure"
        trigger-value-change-event
        @etools-selected-item-changed="${(event: CustomEvent) => {
          this.selectedCp = event.detail.selectedItem?.id;
          fireEvent(this, 'selected-cp-changed', {value: this.selectedCp});
        }}"
      >
      </etools-dropdown>
    `;
  }

  @property({type: Array})
  countryProgrammes!: CountryProgram[];

  @property({type: Array})
  sortedCountryProgrammes!: CountryProgram[];

  @property({type: String})
  selectedCp!: string | null;

  private _appModuleItem!: GenericObject;
  @property({type: Object})
  get appModuleItem() {
    return this._appModuleItem;
  }

  set appModuleItem(val: GenericObject) {
    this._appModuleItem = val;
    this._countryProgrammesChanged();
  }

  @property({type: String})
  module!: string;

  @property({type: Boolean})
  editMode = false;

  @property({type: Boolean})
  required = false;

  private cpInitDebouncer!: Debouncer;

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.countryProgrammes, state.commonData!.countryProgrammes)) {
      this.countryProgrammes = state.commonData!.countryProgrammes;
      this._countryProgrammesChanged();
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

    this.selectedCp = currentCP ? currentCP.id.toString() : null;
  }

  _countryProgrammesChanged() {
    this.cpInitDebouncer = Debouncer.debounce(this.cpInitDebouncer, timeOut.after(10), () => {
      if (this.appModuleItem) {
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
      return parseInt(cp.id as unknown as string, 10) === parseInt(cpId, 10) && cp.expired;
    });
  }

  _getExpiredCPWarning() {
    let msg = '';
    switch (this.module) {
      case 'agreements':
        msg = 'Agreement ' + this.appModuleItem ? this.appModuleItem!.agreement_number : '';
        break;
      case 'interventions':
        msg = 'PD/SPD ' + this.appModuleItem ? this.appModuleItem!.number : '';
        break;
    }
    return msg + this._getTranslation('HAS_AN_OLD_EXPIRED_CP_STRUCTURE');
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
