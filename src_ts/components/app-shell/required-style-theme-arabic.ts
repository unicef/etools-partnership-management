import '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/custom-style.js';

const documentContainer = document.createElement('template');
documentContainer.innerHTML = `
  <custom-style>
    <style>
      html {
             
          --required-star-style: {
            background: url('./images/required.svg') no-repeat 99% 20%/8px;
            right: auto;
            padding-right: 15px;
          }
      }
    </style>
  </custom-style>`;

document.head.appendChild(documentContainer.content);
