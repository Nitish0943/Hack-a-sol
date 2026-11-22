<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## KrishiSetu implementation status

- Completed: landing, login, registration, farmer portal, officer portal, administrator portal, and the documented core routes.
- Data mode: sample/demo records are explicitly labelled; no Supabase or live policy data is silently represented as real.
- Shared components: `components/portal-layout.tsx` and `components/ui-kit.tsx`.
- Validation: `npm run typecheck` and `npm run build` pass.
- Remaining integration work: Supabase authentication/data storage, role protection, policy and grievance APIs, document storage, live IVR/SMS and real notification providers.
