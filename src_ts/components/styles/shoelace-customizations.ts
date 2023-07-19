import {css} from 'lit-element';
// TODO - submodule should not import it fro here

const validationStyles = css`
  sl-input div[slot='help-text'] div.char-counter,
  sl-textarea div[slot='help-text'] div.char-counter {
    visibility: visible;
  }
  sl-textarea[show-char-counter] div.err-msg {
    overflow-x: clip;
  }

  sl-input[readonly] div[slot='help-text'] div.char-counter,
  sl-textarea[readonly] div[slot='help-text'] div.char-counter {
    visibility: hidden;
  }

  sl-input[data-user-invalid] div[slot='help-text'] div.err-msg,
  sl-textarea[data-user-invalid] div[slot='help-text'] div.err-msg {
    visibility: visible;
    height: 15px;
    overflow: visible;
  }

  sl-input div[slot='help-text'] div.err-msg,
  sl-textarea div[slot='help-text'] div.err-msg {
    visibility: hidden;
    height: 15px;
    overflow: hidden;
    white-space: nowrap;
  }
  sl-input[data-user-invalid],
  sl-textarea[data-user-invalid] {
    --sl-input-border-color: red;
  }
  sl-input,
  sl-textarea {
    --sl-input-required-content-color: red;
  }
  .err-msg {
    color: red;
  }
`;

const labelStyles = css`
  sl-input,
  sl-textarea {
    --sl-input-label-color: var(--secondary-text-color);
    --sl-input-required-content-color: red;
    --sl-spacing-3x-small: 0;
    --sl-input-spacing-small: 2px;
  }
  sl-input::part(form-control-label) {
    font-size: 13px;
  }
`;

export const ShoelaceCustomizations = css`
  sl-input,
  sl-textarea {
    --sl-input-font-size-small: 16px;
  }
  sl-input[readonly],
  sl-textarea[readonly] {
    --sl-input-border-width: 0;
    --sl-input-spacing-small: 0;
    --sl-input-focus-ring-color: rgba(0, 0, 0, 0);
  }

  sl-input:not([readonly]):focus::part(base),
  sl-textarea:not([readonly]):focus::part(base) {
    border: none;
    border-bottom: 2px solid var(--primary-color);
    box-shadow: 0 0 0 -1px var(--primary-color), 0 2px 3px -2px var(--primary-color);
    border-radius: 0;
  }

  sl-input::part(base),
  sl-textarea::part(base) {
    border: none;
    border-bottom: 1px solid var(--secondary-text-color);
    box-shadow: none;
    border-radius: 0;
  }

  sl-input[readonly]::part(base),
  sl-textarea[readonly]::part(base) {
    border: none;
    border-bottom: none;
  }

  ${labelStyles}
  ${validationStyles}
`;
