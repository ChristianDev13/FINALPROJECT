# Ptech portfolio frontend

Responsive React 19 landing page, styled with Tailwind CSS 4 and custom CSS.

## Run locally

```sh
npm install
npm run dev
```

Create a production bundle with `npm run build`. The landing page includes a
mobile navigation menu, responsive feature and template sections, selectable
template cards, and accessible template preview dialogs.

Authentication pages are available at `/login` and `/register`. Set
`VITE_API_URL` in `.env` if Laravel is not running at
`http://127.0.0.1:8000/api`. Keep Laravel running alongside Vite to register
and sign in.
