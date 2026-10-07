# Answers

## AI assistance
I used GitHub Copilot in VS Code while working through the challenge. I drove the investigation and decisions, and used it for codebase exploration, implementation suggestions, and debugging. I reviewed and adjusted the changes and checked them with local Angular and .NET builds. I want to be clear that Copilot contributed code too, particularly to the first pass of the Profile and History work. I’m happy to walk through what I kept, what I changed, and why.

## UI tasks

1. **Login and Register layout:** I gave both screens a responsive layout, with clearer form grouping, spacing, labels, and keyboard focus styles. I wanted the first step into the app to feel deliberate rather than like unstyled scaffolding.
2. **Contacts layout:** I made the contacts page easier to scan by clarifying the heading and contact count and improving the grid and message dialog presentation.
3. **Mobile navbar:** I added a collapsible menu for small screens, including an accessible toggle and closing the menu after navigation. The full navigation remains visible on desktop.
4. **Stacked Profile forms:** I separated profile details and password changes into vertically stacked forms. The profile form now includes surname, loads the user's current details, validates input, and shows request feedback.
5. **Send Message dialog:** I replaced browser prompts with an in-app dialog for the message type and body, plus sending and result feedback. The frontend now subscribes to the HTTP observable, but I found the API did not have a `POST /api/messages` action, so the request still cannot create a message until that endpoint is implemented. The History task adds the corresponding GET endpoint; it does not solve message creation.

I used Tailwind CSS for the layouts because I already use it in my SaaS work. That familiarity helped me iterate on responsive spacing and states quickly while keeping styles close to the templates. Example: [uloyiso.com services](https://uloyiso.com/#services).

## Full-stack tasks

1. **Profile:** I wired the page to the authenticated `GET /api/users/me` route and the existing profile/password POST routes. The POST actions now bind JSON request models, and the page loads current values and gives validation, loading, success, and error feedback. Passwords stay in the request body, not the URL, and the browser sends the HTTP-only auth cookie with API calls.
2. **History:** I added an authenticated `GET /api/messages` endpoint and connected the History page to it. The API scopes results to the user ID in the auth claims, returns a small response model rather than database entities, and sorts newest first. On the page, I added search, type/status filters, summary counts, refresh, and loading/error/empty states. The seeded account makes this easy to try with sample messages.

While tracing the auth issue, I found that cookie authentication was redirecting unauthenticated API requests to the POST-only login route. The browser followed that redirect with GET and got a 405. I changed API auth failures to return 401/403 instead, then added an Angular interceptor to clear stale client-side markers and route to `/login` on a protected-request 401 (without redirecting a failed login attempt). I also guarded `localStorage` access because this Angular app uses server-side rendering.

**Verification:** `npm run build` and `dotnet build` succeeded. `npm test -- --watch=false` is currently blocked before tests run because the existing `auth-guard.service.spec.ts` imports `AuthGuardService`, while the service exports `AuthGuard`. The suite had this compile issue before the History test was added; automated test repair was not part of the requested feature work.

## System design

1. **What do you think of the app in general?** I found it a good small full-stack exercise. The main pieces are easy to locate—Angular pages and services, ASP.NET controllers and EF Core, and PostgreSQL—and the seed account means you can get into the useful flows quickly. There were a few unfinished connections, which made following a feature from the screen through to the API especially important.
2. **What struck you in the code as worth improving?** The most serious security issue I noticed is that passwords are stored in the database as plain text and checked with a direct string comparison. If the database were exposed, every user's password would be immediately readable. Passwords should be stored using a dedicated password-hashing algorithm with a unique salt (for example, ASP.NET Core Identity's password hasher), and verified through that hasher; they should never be recoverable as plain text. The local-storage marker and the HTTP-only cookie also represent two different views of authentication; the marker can help with client navigation but should never be treated as proof that a request is authenticated. I would move the hard-coded API URL into environment configuration, fix places where `tap` is used as if it transforms observable values, and add consistent request validation, error responses, cancellation, and tests. I care about keeping API responsibilities separated and use Clean Architecture in my own API work; one example is my [commerce-core-api on GitHub](https://github.com/Loyiso/commerce-core-api). For this challenge, I kept to the existing controller/EF Core structure rather than forcing a larger architecture refactor into a small task. I did keep the new history API focused: it scopes the query to the authenticated user and projects the result to a response model instead of exposing EF entities. If I were taking this further, I would move the query and use-case logic behind an application service so the controller handled HTTP concerns only.
3. **What HTML/CSS changes would make this nicer to use and to work on?** Responsive layouts, consistent spacing and typography, semantic labels/headings, visible focus, and clear loading/error/empty states make the app easier to use. I used Tailwind because it is already part of my day-to-day toolkit on my SaaS project ([uloyiso.com](https://uloyiso.com/#services)); it let me move quickly while keeping the responsive styles readable near each template. Longer term, I would extract repeated buttons, form fields, badges, and spacing choices into shared components or design tokens to avoid inconsistent one-off styling.

## About the challenge

1. **What did you think of it?** I liked that the challenge asked me to work across the stack rather than only polish a screen. The message flow was a good example: tracing it showed that a frontend subscription was only part of the problem, because the matching create endpoint was missing.
2. **How could we improve it?** A concise API contract and acceptance checklist for each feature would help candidates understand expected behavior without prescribing the solution. The starter test suite's compile error could be fixed, or explicitly called out as something candidates may choose to address.
3. **Was it easy to get started — environment setup and all that?** The README is helpful and includes the ports, setup commands, seed credentials, and common troubleshooting. There are several dependencies to bring up—Docker/PostgreSQL, EF tooling, .NET, and Node—but the order is clear. I ran the frontend under Node 25 and saw Angular's warning that odd-numbered releases are not LTS, so I would use the recommended Node 20 for a clean setup.

## Anything else

The main thing I took away was to trace a feature all the way through the UI, observable, API contract, and persistence layer before deciding where the bug is. My broader API work is on [GitHub](https://github.com/Loyiso/commerce-core-api), and my SaaS work is at [uloyiso.com](https://uloyiso.com/#services).
