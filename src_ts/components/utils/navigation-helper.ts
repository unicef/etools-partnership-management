/**
 * Update app state
 */
export function replaceAppState(routePath: string, qs: string, dispatchLocationChange: boolean) {
  // Using replace state to change the URL here ensures the browser's
  // back button doesn't take you through every query
  const currentState = window.history.state;
  window.history.replaceState(currentState, '', routePath + (qs.length ? '?' + qs : ''));

  if (dispatchLocationChange) {
    window.dispatchEvent(new CustomEvent('popstate'));
  }
}

/**
 * Change app state
 */
export function changeAppState(url: string) {
  if (!url) {
    return;
  }
  window.history.pushState(window.history.state, '', url);
  window.dispatchEvent(new CustomEvent('popstate'));
}
