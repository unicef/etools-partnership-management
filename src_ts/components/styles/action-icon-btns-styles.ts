import { html } from "@polymer/polymer/polymer-element.js";

// language=HTML
export const actionIconBtnsStyles = html` <style>
  .action {
    color: var(--medium-icon-color);
    width: 36px;
    height: 36px;
  }

  .action.delete {
    color: var(--icon-delete-color);
  }
  .action.edit {
    color: var(--medium-icon-color);
  }
  .action.delete[disabled],
  .action.edit[disabled] {
    visibility: hidden;
  }
</style>`;
