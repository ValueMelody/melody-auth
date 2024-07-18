import { html } from 'hono/html'

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
          h1 { padding: 0; margin: 0; }
          .flex-row { display: flex; flex-direction: row; }
          .flex-col { display: flex; flex-direction: column; }
          .flex-wrap { flex-wrap: wrap; }
          .justify-between { justify-content: space-between; }
          .justify-center { justify-content: center; }
          .items-center { align-items: center; }
          .hidden { display: none; }
          .text-sm { font-size: 14px; }
          .text-red { color: red; }
          .p-2 { padding: 8px; }
          .p-4 { padding: 16px; }
          .ml-2 { margin-left: 8px; }
          .mt-4 { margin-top: 16px; }
          .mt-8 { margin-top: 32px; }
          .mb-4 { margin-bottom: 16px; }
          .gap-8 { gap: 32px; }
          .gap-4 { gap: 16px; }
          .gap-2 { gap: 8px; }
          .border { border: 1px solid lightgray; }
          .rounded-lg { border-radius: 16px; }
          .rounded-md { border-radius: 8px; }
          .w-full { width: 100%; }
          .main {
            background-color: lightgray;
            height: 100vh;
            width: 100%;
          }
          .container {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.1);;
            background-color: white;
            padding: 32px;
          }
          .logo {
            width: 40px;
          }
          .button {
            background-color: white;
            cursor: pointer;
            border: 1px solid lightgray;
            padding: 8px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 16px;
          }
          .button-outline {
            background-color: white;
            cursor: pointer;
            border: none;
            padding: 8px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 16px;
          }
          .button-text {
            background-color: unset;
            cursor: pointer;
            border: none;
            padding: 8px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 16px;
            color: darkslategray;
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
          .alert {
            background-color: red;
            color: white;
            border-radius: 8px;
            padding: 8px 16px;
            font-size: 14px;
            width: 240px;
            align-self: center;
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
