import { LitElement, css, html } from "lit";
import "highcharts";
import "highcharts-exporting";
import "./dashboard-layout.js";

import litLogo from "./assets/lit.svg";
import viteLogo from "/vite.svg";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class MyElement extends LitElement {
  static get properties() {
    return {
      /**
       * Copy for the read the docs hint.
       */
      docsHint: { type: String },

      /**
       * The number of times the button has been clicked.
       */
      count: { type: Number },
    };
  }

  constructor() {
    super();
    this.docsHint = "Click on the Vite and Lit logos to learn more";
    this.count = 0;
  }

  render() {
    return html`
      <header>
        <h2>Observer Dashboard</h2>
      </header>
      <dashboard-layout></dashboard-layout>
    `;
  }

  _onClick() {
    this.count++;
  }
}

window.customElements.define("idv-application", MyElement);
