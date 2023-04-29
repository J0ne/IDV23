import { LitElement, css, html } from "lit";
import "@shoelace-style/shoelace/dist/themes/light.css";
import "@shoelace-style/shoelace";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
import "highcharts";
import "highcharts-exporting";
import "./dashboard-layout.js";

setBasePath("https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist");

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
  createRenderRoot() {
    return this;
  }

  render() {
    return html` <dashboard-layout></dashboard-layout> `;
  }

  _onClick() {
    this.count++;
  }
}

window.customElements.define("idv-application", MyElement);
