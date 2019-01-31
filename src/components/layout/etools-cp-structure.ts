import { PolymerElement, html } from '@polymer/polymer';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import '@polymer/iron-flex-layout/iron-flex-layout';
import { connect } from 'pwa-helpers/connect-mixin.js';
// @ts-ignore
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin';
import 'etools-dropdown/etools-dropdown.js'
import { store, RootState } from '../../store.js';
import {SharedStyles} from '../styles/shared-styles.js'
import {requiredFieldStarredStyles} from '../styles/required-field-styles.js'
import { isJsonStrMatch } from '../utils/utils.js';




    /**
     * @polymer
     * @customElement
     * @appliesMixin EtoolsLogsMixin
     */
    class EtoolsCpStructure extends connect(store)(EtoolsLogsMixin(PolymerElement)) {
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

          <etools-dropdown id="cpStructure"
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
                            error-message="Please select CP Structure">
          </etools-dropdown>
        `;
      }

      static get properties() {
        return {
          countryProgrammes: {
            type: Array,
            statePath: 'countryProgrammes'
          },
          sortedCountryProgrammes: {
            type: Array
          },
          selectedCp: {
            type: Number,
            notify: true
          },
          /**
           * appModuleItem could be agreement or intervention
           */
          appModuleItem: {
            type: Object,
            value: null
          },
          /**
           * module will indicate the appmodule where cp selector is used;
           * could be 'agreements' or 'intervention'
           */
          module: {
            type: String
          },
          editMode: {
            type: Boolean,
            value: false
          },
          required: {
            type: Boolean,
            value: false
          }
        };
      }

      static get observers() {
        return [
          '_countryProgrammesChanged(countryProgrammes, appModuleItem)'
        ];
      }

      stateChanged(state: RootState) {
        if (isJsonStrMatch(this.countryProgrammes, state.commonData!.countryProgrammes)) {
          this.countryProgrammes = state.commonData!.countryProgrammes;
        }
      }

      _getCurrentCountryProgramme(cpOptions) {
        if (_.isEmpty(cpOptions)) {
          return null;
        }

        if (cpOptions.length === 1) {
          // just one cp available
          return cpOptions[0];
        } else {
          // more than 1 cp available, use first one found that is active, not special and not future
          return cpOptions.find(cp => cp.active && !cp.future && !cp.special);
        }
      }

      setDefaultSelectedCpStructure() {
        if (_.isEmpty(this.sortedCountryProgrammes)) {
          return;
        }

        let currentCP = this._getCurrentCountryProgramme(this.sortedCountryProgrammes);

        this.set('selectedCp', currentCP ? currentCP.id : null);
      }

      _countryProgrammesChanged(countryProgrammes, appModuleItem) {
        this.cpInitDebouncer = Debouncer.debounce(this.cpInitDebouncer,
            timeOut.after(10),
            () => {
              if (appModuleItem) {
                this._prepareCpsForDisplay();

                if (!this.selectedCp) {
                  this.setDefaultSelectedCpStructure();
                } else {
                  if (this._hasExpiredCpAssigned(this.selectedCp)) {
                    this.logWarn(this._getExpiredCPWarning());
                  }
                }
              }
            });
      }

      _prepareCpsForDisplay() {
        let displayableCps = _.orderBy(this.countryProgrammes,
                                      ['future', 'active', 'special'],
                                      ['desc', 'desc', 'asc']);

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
        if (cpId || !_.isEmpty(this.countryProgrammes)) {
          return false;
        }

        return this.countryProgrammes.some((cp) => {
          return parseInt(cp.id, 10) === parseInt(cpId, 10) && cp.expired;
        });

      }

      _getExpiredCPWarning() {
        let msg = '';
        switch (this.module) {
          case 'agreements':
            msg = `Agreement ${this.appModuleItem.agreement_number}`;
            break;
          case 'interventions':
            msg = `PD/SSFA ${this.appModuleItem.number}`;
            break;
        }
        return msg + ' has an old/expired CP Structure!';
      }

      resetCpDropdownInvalidState() {
        let cp = this._getCpStructureDropdown();
        if (cp) {
          cp.resetInvalidState();
        }
      }

      validate() {
        let cp = this._getCpStructureDropdown();
        return cp ? cp.validate() : true;
      }

      _getCpStructureDropdown() {
        return this.shadowRoot.querySelector('#cpStructure');
      }

    }

    window.customElements.define('etools-cp-structure', EtoolsCpStructure);
