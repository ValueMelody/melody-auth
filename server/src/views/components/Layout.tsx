import { html } from "hono/html";

const Layout = ({ children }: { children: any }) => html`
  <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400..600&display=swap" rel="stylesheet">
        <style>
          body { padding: 0; margin: 0; font-family: "Inter", sans-serif; font-size: 16px; }
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
          .mt-4 { margin-top: 16px; }
          .gap-4 { gap: 16px; }
          .gap-2 { gap: 8px; }
          .rounded-lg { border-radius: 16px; }
          .rounded-md { border-radius: 8px; }
          .main {
            background-color: lightgray;
            height: 100vh;
            width: 100%;
          }
          .container {
            background-color: white;
            padding: 32px;
          }
          .button {
            background-color: white;
            cursor: pointer;
            border: 1px solid lightgray;
            padding: 12px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 16px;
          }
          .input {
            background-color: white;
            border: 1px solid lightgray;
            padding: 12px;
            border-radius: 8px;
            min-width: 240px;
          }
          .label {
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <main class="flex-col items-center justify-center main">
          <section class="flex-col justify-center items-center container rounded-lg">
            ${children}
          </section>
        </main>
    </body>
  </html>
`

export default Layout
