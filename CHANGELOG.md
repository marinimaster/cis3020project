# Change Log

## Login Flow

- `public/index.html`
  Converted the page from admin-only login to a role-selection login page.
  Standard user is now the default selection, and admin login is available from the same form.

- `public/index.js`
  Added role-based form behavior so the selected login type updates:
  `/api/login/standard` with redirect to `/dashboard`
  `/api/login/admin` with redirect to `/admin/dashboard`

## Dashboard Split

- `private/dashboard.html`
  Reassigned this file to the standard user dashboard.

- `private/admin-dashboard.html`
  Added a dedicated admin dashboard and moved the original admin-focused layout here.

## Server Routing

- `src/index.mjs`
  Added a separate admin dashboard route at `/admin/dashboard`.
  Kept `/dashboard` for the standard user dashboard.
  Restricted `/api/students` to the admin role.
  Added empty login endpoint stubs for:
  `/api/login/standard`
  `/api/login/admin`

## Notes For Your Next Step

- The placeholder login endpoints currently return `501 Not Implemented`.
- The dashboard guards expect `request.session.user.role` to be either `standard` or `admin` once you add your login logic.
