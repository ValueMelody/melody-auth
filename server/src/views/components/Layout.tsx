import { html } from "hono/html";

const Layout = ({ children }: { children: any }) => html`
  <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { padding: 0; margin: 0; }
          a { text-decoration: none; }
          p { padding: 0; margin: 0; }
          .flex-row { display: flex; flex-direction: row; }
          .flex-col { display: flex; flex-direction: column; }
          .flex-wrap { flex-wrap: wrap; }
          .justify-between { justify-content: space-between; }
          .justify-center { justify-content: center; }
          .items-center { align-items: center; }
          .p-2 { padding: 8px; }
          .p-4 { padding: 16px; }
          .gap-4 { gap: 16px; }
          .gap-2 { gap: 8px; }
          .rounded-lg { border-radius: 16px; }
          .rounded-md { border-radius: 8px; }
          .main {
            background-color: lightgray;
            height: 100%;
            width: 100%;
          }
          .container {
            background-color: white;
          }
          .button-outline {
            background-color: white;
            border: 1px solid lightgray;
            padding: 8px;
          }
        </style>
      </head>
      <body>
        <main class="flex-col items-center justify-center main">
          <section class="flex-col justify-center items-center container rounded-lg p-4">
            ${children}
          </section>
        </main>
    </body>
  </html>
`

export default Layout
