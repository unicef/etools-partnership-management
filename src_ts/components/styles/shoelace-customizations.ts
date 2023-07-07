import {css} from 'lit-element';
// TODO - submodule should not import it fro here

const validationStyles = css`
  sl-input[data-user-invalid] div[slot='help-text'],
  sl-textarea[data-user-invalid] div[slot='help-text'] {
    visibility: visible;
    height: 15px;
    overflow: visible;
  }

  sl-input div[slot='help-text'] div,
  sl-textarea div[slot='help-text'] div {
    position: relative;
    top: 0;
    left: 0;
  }

  sl-input div[slot='help-text'],
  sl-textarea div[slot='help-text'] {
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
    --sl-spacing-3x-medium: 0;
    --sl-input-spacing-medium: 2px;
  }
  sl-input::part(form-control-label) {
    font-size: 13px;
  }
`;

export const ShoelaceCustomizations = css`
  sl-input[readonly],
  sl-textarea[readonly] {
    --sl-input-border-width: 0;
    --sl-input-spacing-medium: 0;
    --sl-input-focus-ring-color: rgba(0, 0, 0, 0);
  }
  ${labelStyles}
  ${validationStyles}
`;
