import {html} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

import './menu/styles/app-drawer-styles.js';

export const AppShellStyles = html`
<style include="app-drawer-styles">
  :host {
    display: block;
  }
    
  app-header-layout {
    position: relative;
  }
    
  .main-content {
    @apply --layout-flex;
    padding: 24px;
  }
  
  .page {
    display: none;
  }

  .page[active] {
    display: block;
  }
    
</style>
`;
