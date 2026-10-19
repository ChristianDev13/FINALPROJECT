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
details, and an optional PDF CV download. Portfolio data is saved in the
current browser tab for every visitor. When signed in, selected templates,
account details, preferences, and saved portfolio designs are also persisted
to the Laravel database.

Authentication pages are available at `/login` and `/register`. Set
`VITE_API_URL` in `.env` if Laravel is not running at
`http://127.0.0.1:8000/api`. For local development, the backend uses its SQLite
database by default, so no PostgreSQL server or PHP PostgreSQL extension is
required. From `backend/`, run `php artisan migrate` and
`php artisan serve --host 127.0.0.1 --port 8000`; run `npm run dev` from
`frontend/` in another terminal. Keep both servers running to register and sign
in. Registration stores the account, then sends the user to login with their
email prefilled; submit the password there to sign in.

Forgot-password emails use Laravel's expiring, single-use reset tokens. To send
them through Gmail, set `MAIL_MAILER=smtp`, `MAIL_SCHEME=smtp`,
`MAIL_HOST=smtp.gmail.com`, and `MAIL_PORT=587` in `backend/.env`. Set
`MAIL_USERNAME` and `MAIL_FROM_ADDRESS` to your Gmail address, and set
`MAIL_PASSWORD` to a Google App Password (not your regular Gmail password).
Keep these credentials only in the ignored `backend/.env`; never put them in
frontend variables or commit them. Set `FRONTEND_URL` to the deployed frontend
origin, then run `php artisan config:clear` and restart Laravel after changing
mail settings. In local development, reset links expire after 60 minutes, and
the API does not reveal whether an email address is registered.

To use PostgreSQL instead, enable the `pdo_pgsql` PHP extension and configure
`DB_CONNECTION=pgsql`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, and
`DB_PORT` in `backend/.env`. The PostgreSQL Compose file and schema reference
are in `backend/compose.yaml` and `backend/database/`; see
`backend/database/README.md` for setup instructions. Keep database credentials
in the ignored `.env` file, not in source code.

After signing in, the landing page navigation links to **My Account** at
`/account`. The account area includes profile details, password and privacy
settings, template selection history, and saved portfolio management. Template
history and portfolio data belong to the authenticated user and are stored by
the Laravel API.
