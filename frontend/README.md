# Ptech portfolio frontend

Responsive React 19 landing page, styled with Tailwind CSS 4 and custom CSS.

## Run locally

```sh
npm install
npm run dev
```

Create a production bundle with `npm run build`. The landing page includes a
mobile navigation menu, responsive feature and template sections, selectable
template cards, accessible template preview dialogs, and portfolio builders.
Choose a template on the landing page and select **Build
your portfolio** to enter profile, about, skills, education, projects, and
contact details. The Minimal template has a separate editor at `/create` and
standalone output page at `/portfolio/minimal`. The Creative template has a
separate editor at `/create/creative` and standalone output page at `/portfolio/creative`, with creative introduction, about,
skills, JPG/PNG uploaded featured project images, social links, and contact
details. The creative editor starts with one project; add or remove project
entries as needed without fixed project numbers.
The Professional template has a dedicated editor at `/create/professional` and
a standalone output page at `/portfolio/professional`, with career summary,
work experience, skills, education, certifications, achievements, contact
details, and an optional PDF CV download. Minimal, Creative, and Professional
portfolio data are saved in the current browser tab.
Template selection and builders work without an account; login and
registration remain available as separate pages while backend account
features are being developed.

Authentication pages are available at `/login` and `/register`. Set
`VITE_API_URL` in `.env` if Laravel is not running at
`http://127.0.0.1:8000/api`. To start the local PostgreSQL database, run
`docker compose --env-file ..\backend\.env up -d` from the `database` folder.
Then run `php artisan migrate` and `php artisan serve --host 127.0.0.1 --port
8000` from the `backend` folder. Keep PostgreSQL and Laravel running alongside
Vite to register and sign in. Registration stores the account, then sends the
user to login; it does not sign them in automatically.
