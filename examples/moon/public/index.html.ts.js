/*+ import type { Observable } from "@credt/core"; */
import { mount, html, observable as o, isServer } from "@credt/core";

function FullPageGradientDown(
  { color1, color2 } /*: { color1: string, color2: string }*/,
  ...children /*: any */
) {
  const c1 = o(color1);
  const c2 = o(color2);

  // let i = 0;
  // setInterval(() => {
  //   if (i++ % 2 == 0) {
  //     c1(color1);
  //     c2(color2);
  //   } else {
  //     c1(color2);
  //     c2(color1);
  //   }
  // }, 500);

  return html`<div
    style="
     position: relative;
     height: 100dvh;
     background-image: linear-gradient(${c1}, ${c2});
     overflow: hidden;
    "
  >
    ${children}
  </div>`;
}

function FullPageBackground({ url } /*: { url: string }*/) {
  return html`<div
    style="position: absolute; top: 0; height: 100dvh; width: 100dvw; background: url(${url}); background-size: cover; background-position: center;"
  ></div>`;
}

function Moon({ y } /*: { y : Observable<number> }*/) {
  return html`<div
    style="
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: ${() => 50 + y() / 1.4}px
      "
  >
    <img
      style="
        width: 50vw;
        max-width: 25vh;
        "
      src="./moon.svg"
    />
  </div>`;
}

await mount({
  rootImports: [import.meta.url],

  async head() {
    return html`
      <style>
        html,
        body {
          padding: 0px;
          margin: 0px;
        }
      </style>
    `;
  },

  async body() {
    const scrollY = o(0);

    let moonFacts = {};
    if (isServer) {
      moonFacts = (await import("../private/moonFacts.ts.js")).moonFacts;
    } else {
      window.onscroll = (_ev) => scrollY(window.scrollY);
    }

    return html`
      <${FullPageGradientDown} color1="#13114a" color2="#0a092a">
        <${Moon} y=${scrollY} />
        <${FullPageBackground} url="./wave-bg.svg" />
      </${FullPageGradientDown}>
      <div style="
        font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto;
        height: 100dvh;
        display: flex;
        flex-direction: column; 
        align-items: center;
        justify-content: center;
        color: #435d7b;
        background-color: #d0b641;
        gap: 20px;
      ">
        ${Object.entries(moonFacts).map(
          ([title, body]) =>
            html`<h2>${title}</h2>
              <div>${body}</div>`
        )} 
        <h3 style="color: #2f4157">Credt Framework Example</h3>
      </div>
    `;
  },
});
