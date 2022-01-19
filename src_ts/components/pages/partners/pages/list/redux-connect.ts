export const reduxConnect = (store: any) => (baseElement: any) =>
  class extends baseElement {
    subscribeToReduxStore() {
      // pwa-helpers/connect-mixin executes stateChanges before the element has been initialized
      this._storeUnsubscribe = store.subscribe(() => this.stateChanged(store.getState()));
      this.stateChanged(store.getState());
    }
    disconnectedCallback() {
      this._storeUnsubscribe();
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
    }
    /**
     * The `stateChanged(state)` method will be called when the state is updated.
     */
    stateChanged(_state) {}
  };
