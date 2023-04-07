import {css} from 'lit-element';
// TODO - submodule should not import it fro here

const validationStyles = css`
  sl-input[data-user-invalid] div[slot='help-text'] {
    display: block;
  }

  sl-input div[slot='help-text'] {
    display: none;
  }
  sl-input[data-user-invalid] {
    --sl-input-border-color: red;
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
