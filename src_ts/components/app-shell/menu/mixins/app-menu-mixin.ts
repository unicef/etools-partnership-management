import {Constructor} from '@unicef-polymer/etools-types';
import {LitElement, property} from 'lit-element';
import {PolymerElement} from '@polymer/polymer';

/**
 * App menu functionality mixin
 * @polymer
 * @mixinFunction
 */
export function AppMenuMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class AppMenuClass extends baseClass {
    @property({type: Boolean})
    smallMenu = false;

    public connectedCallback() {
      super.connectedCallback();
      this._initMenuListeners();
      this._initMenuSize();
    }

    public disconnectedCallback() {
      super.disconnectedCallback();
      this._removeMenuListeners();
    }

    private _initMenuListeners(): void {
      this._toggleSmallMenu = this._toggleSmallMenu.bind(this);
      this._resizeMainLayout = this._resizeMainLayout.bind(this);
      this._toggleDrawer = this._toggleDrawer.bind(this);

      this.addEventListener('toggle-small-menu', this._toggleSmallMenu as any);
      this.addEventListener('resize-main-layout', this._resizeMainLayout);
      this.addEventListener('drawer', this._toggleDrawer);
    }

    private _removeMenuListeners(): void {
      this.removeEventListener('toggle-small-menu', this._toggleSmallMenu as any);
      this.removeEventListener('resize-main-layout', this._resizeMainLayout);
      this.removeEventListener('drawer', this._toggleDrawer);
    }

    private _initMenuSize(): void {
      this.smallMenu = this._isSmallMenuActive();
    }

    private _isSmallMenuActive(): boolean {
      /**
       * etoolsPmpSmallMenu localStorage value must be 0 or 1
       */
      const menuTypeStoredVal: string | null = localStorage.getItem('etoolsAppSmallMenuIsActive');
      if (!menuTypeStoredVal) {
        return false;
      }
      return !!parseInt(menuTypeStoredVal, 10);
    }

    private _toggleSmallMenu(e: CustomEvent): void {
      e.stopImmediatePropagation();
      this.smallMenu = e.detail && e.detail.smallMenu != undefined ? e.detail.smallMenu : !this.smallMenu;
      this._smallMenuValueChanged(this.smallMenu);
    }

    protected _resizeMainLayout(e: Event) {
      e.stopImmediatePropagation();
      this._updateDrawerStyles();
      this._notifyLayoutResize();
    }

    private _smallMenuValueChanged(newVal: boolean) {
      const localStorageVal: number = newVal ? 1 : 0;
      localStorage.setItem('etoolsAppSmallMenuIsActive', String(localStorageVal));
    }

    private _updateDrawerStyles(): void {
      const drawerLayout = this.shadowRoot?.querySelector('#layout') as PolymerElement;
      if (drawerLayout) {
        drawerLayout.updateStyles();
      }
      const drawer = this.shadowRoot?.querySelector('#drawer') as PolymerElement;
      if (drawer) {
        drawer.updateStyles();
      }
    }

    private _notifyLayoutResize(): void {
      const layout = this.shadowRoot?.querySelector('#layout') as PolymerElement & {notifyResize(): void};
      if (layout) {
        layout.notifyResize();
      }
      const headerLayout = this.shadowRoot?.querySelector('#appHeadLayout') as PolymerElement & {
        notifyResize(): void;
      };
      if (headerLayout) {
        headerLayout.notifyResize();
      }
    }

    private _toggleDrawer(): void {
      // @ts-ignore
      this.shadowRoot?.querySelector('#drawer').toggle();
    }
  }
  return AppMenuClass;
}
