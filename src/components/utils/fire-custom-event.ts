export const fireEvent = (el: HTMLElement, eventName: string, eventDetail?: object) => {
  el.dispatchEvent(new CustomEvent(eventName, {
    detail: eventDetail,
    bubbles: true,
    composed: true
  }));
};
