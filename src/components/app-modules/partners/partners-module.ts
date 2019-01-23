import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-button/paper-button';
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-route/app-route';

import {connect} from "pwa-helpers/connect-mixin";
import {store} from "../../../store";
import {GestureEventListeners} from "@polymer/polymer/lib/mixins/gesture-event-listeners";

// @ts-ignore
import EtoolsMixinFactory from "etools-behaviors/etools-mixin-factory";
// @ts-ignore
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin';
import ScrollControl from "../../mixins/scroll-control-mixin";
import EventHelper from "../../mixins/event-helper-mixin";
import ModuleMainElCommonFunctionalityMixin from '../mixins/module-common-mixin';
import ModuleRoutingMixin from '../mixins/module-routing-mixin';

import '../../layout/page-content-header';
import '../../layout/page-content-header-slotted-styles';



/**
 * @polymer
 * @mixinFunction
 * @appliesMixin GestureEventListeners
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin EventHelper
 * @appliesMixin ScrollControl
 * @appliesMixin ModuleRoutingMixin
 * @appliesMixin ModuleMainElCommonFunctionality
 */
const PartnersModuleRequiredMixins = EtoolsMixinFactory.combineMixins([
  GestureEventListeners, EtoolsLogsMixin, EventHelper, ScrollControl,
  ModuleRoutingMixin, ModuleMainElCommonFunctionalityMixin
], PolymerElement);

/**
 * @polymer
 * @customElement
 * @appliesMixin PartnersModuleRequiredMixins
 */
class PartnersModule extends connect(store)(PartnersModuleRequiredMixins as any) {

  public static get template() {
    // main template
    // language=HTML
    return html`
      <h1>Partners pages will load from here...</h1>
    `;
  }

}

window.customElements.define('partners-module', PartnersModule);
