import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {store} from '../../../redux/store';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';

import {html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {use} from 'lit-translate';
import {appLanguages} from '../../../config/app-constants';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {toolbarDropdownStyles} from '@unicef-polymer/etools-unicef/src/styles/toolbar-dropdown-styles';
import {User} from '@unicef-polymer/etools-types';
import 'dayjs/locale/fr.js';
import 'dayjs/locale/ru.js';
import 'dayjs/locale/pt.js';
import 'dayjs/locale/ar.js';
import 'dayjs/locale/ro.js';
import 'dayjs/locale/es.js';
import dayjs from 'dayjs';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import pmpEdpoints from '../../endpoints/endpoints';
import {updateUserData} from '../../../redux/actions/user';
import {setActiveLanguage} from '../../../redux/actions/active-language';
import {RootState} from '../../pages/interventions/pages/intervention-tab-pages/common/types/store.types';

/**
 * @LitElement
 * @customElement
 */
@customElement('languages-dropdown')
export class LanguagesDropdown extends connect(store)(LitElement) {
  @property({type: Object})
  profile!: User;

  @state()
  selectedLanguage!: string;

  @state()
  initialLanguage!: string;

  @state()
  langUpdateInProgress = false;

  constructor() {
    super();
  }

  render(): TemplateResult {
    // main template
    // language=HTML
    return html`
      ${toolbarDropdownStyles}
      <!-- shown options limit set to 250 as there are currently 195 countries in the UN council and about 230 total -->
      <etools-dropdown
        transparent
        .selected="${this.selectedLanguage}"
        .options="${appLanguages}"
        option-label="display_name"
        option-value="value"
        @etools-selected-item-changed="${this.languageChanged}"
        trigger-value-change-event
        hide-search
        allow-outside-scroll
        no-label-float
        .disabled="${this.langUpdateInProgress}"
        min-width="120px"
        placement="bottom-end"
        .syncWidth="${false}"
      ></etools-dropdown>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
  }

  stateChanged(state: RootState): void {
    if (state.activeLanguage.activeLanguage && state.activeLanguage.activeLanguage !== this.selectedLanguage) {
      this.selectedLanguage = state.activeLanguage.activeLanguage;
      window.EtoolsLanguage = this.selectedLanguage;
      this.initialLanguage = this.selectedLanguage;
      this.setLanguageDirection();
    }
  }

  private setLanguageDirection() {
    setTimeout(() => {
      const htmlTag = document.querySelector('html');
      if (this.selectedLanguage === 'ar') {
        htmlTag!.setAttribute('dir', 'rtl');
        this.setAttribute('dir', 'rtl');
        this.dir = 'rtl';
      } else if (htmlTag!.getAttribute('dir')) {
        htmlTag!.removeAttribute('dir');
        this.removeAttribute('dir');
        this.dir = '';
      }
    });
  }

  languageChanged(e: CustomEvent): void {
    if (!e.detail.selectedItem) {
      return;
    }

    const newLanguage = e.detail.selectedItem.value;
    if (newLanguage) {
      dayjs.locale(newLanguage);
      // Event caught by self translating npm packages
      fireEvent(this, 'language-changed', {language: newLanguage});
    }
    if (newLanguage !== this.selectedLanguage) {
      window.EtoolsLanguage = newLanguage;
      use(newLanguage).then(() => {
        if (this.profile?.preferences?.language != newLanguage) {
          this.updateUserPreference(newLanguage);
        }
      });
    }
  }

  private updateUserPreference(language: string) {
    sendRequest({endpoint: pmpEdpoints.myProfile, method: 'PATCH', body: {preferences: {language: language}}})
      .then((response) => {
        store.dispatch(updateUserData(response));
        store.dispatch(setActiveLanguage(language));
      })
      .catch((err: any) => parseRequestErrorsAndShowAsToastMsgs(err, this));
  }
}
