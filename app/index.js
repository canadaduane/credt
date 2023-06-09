import html from "solid-js/html";

export default html`
  <html>
    <body>
      <div>Hello! {() => name()}</div>
    </body>
  </html>
`;
