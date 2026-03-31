# Admin Account in Standard Mode Fix

This note describes the change I made earlier so you can reproduce it yourself after you revert.

## Problem

The issue is not only the redirect line. There are two related problems:

1. An admin account can successfully authenticate through `/api/login/standard`.
2. After that, the frontend sends the browser to `/dashboard`.
3. `/dashboard` is protected by `requireRole("standard")`.
4. The middleware tries to do `response.redirect(403, "/")` or a similar `403 + redirect` combination.
5. `403` is not a redirect status code, so Express sends a response body that says something like `Redirecting to ...`, but the browser does not actually navigate.

## Root Cause

The standard login endpoint validates:

- username exists
- password matches

It does **not** validate:

- whether the account role is actually `standard`

That means an admin user can log in through the standard endpoint, get a valid session, and then get blocked only when requesting `/dashboard`.

## What To Change

### 1. Fix the role-check middleware for page redirects

In `src/index.mjs`, inside `requireRole(role)`, keep this branch:

```js
if (!request.session.user) {
    return response.redirect("/index.html");
}
```

For the role mismatch branch, do **not** use a `403` with `redirect`.

Use:

```js
if (request.session.user.role !== role) {
    return response.redirect("/index.html");
}
```

Why:

- `redirect()` should use a 3xx response to make the browser navigate.
- A `403` is an authorization error, not a redirect.
- Mixing them causes the dead "Redirecting to ..." page.

### 2. Reject cross-role logins at the login endpoint

The better fix is to stop the bad login before the session is created.

In `/api/login/standard`, after:

- finding the user
- checking the password

also verify that:

```js
user.rows[0].role === "standard"
```

If the password is correct but the role is not `standard`, return:

```js
return response.sendStatus(403);
```

Do this **before** writing `request.session.user`.

That way:

- an admin trying to log in while "Standard User" is selected gets a `403`
- the frontend stays on the index page
- no bad session is created
- no redirect to `/dashboard` ever happens

### 3. Apply the same idea to the admin endpoint

In `/api/login/admin`, also verify:

```js
user.rows[0].role === "admin"
```

If not, return `403`.

This keeps the two login modes consistent.

## Clean Way To Implement It

You have two options.

### Option A: Minimal edits in each endpoint

In `/api/login/standard`, add a role check:

```js
if (!isMatch || user.rows[0].role !== "standard") {
    return response.sendStatus(403);
}
```

In `/api/login/admin`, add:

```js
if (!isMatch || user.rows[0].role !== "admin") {
    return response.sendStatus(403);
}
```

Then only create the session after those checks pass.

### Option B: Shared helper

Create a helper like:

```js
async function handleLogin(request, response, expectedRole) {
    // lookup user
    // verify password
    // verify role === expectedRole
    // create session
    // return 200
}
```

Then call it from:

- `/api/login/standard` with `"standard"`
- `/api/login/admin` with `"admin"`

That removes duplicate logic.

## Why This Fix Works

After this change:

- admin credentials submitted through standard mode fail immediately with `403`
- the login page remains visible because the frontend only redirects on `response.ok`
- protected page routes still redirect unauthenticated or wrong-role users back to `/index.html`
- the broken non-redirect `403` response is gone

## Important Distinction

For browser page requests like `/dashboard`, redirecting to `/index.html` makes sense.

For API requests like `/api/login/standard`, returning `403` makes sense.

That separation is important:

- page routes should redirect
- API routes should return status codes

## Summary

The fix is:

1. In `requireRole`, replace the `403 + redirect` logic with a normal redirect to `/index.html`.
2. In each login endpoint, validate that the authenticated user has the correct role for that endpoint.
3. Only create `request.session.user` after both password and role checks pass.

That prevents the admin-through-standard flow from ever reaching `/dashboard`, which is the real reason the redirect problem appears.
