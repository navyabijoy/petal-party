# Petal Party

Make a hand-drawn bouquet, write a note, win the room. Next.js (App Router) + Supabase, built for phone and laptop.

## Play modes
- **Solo** (`/solo`): a daily theme, a customer request and a rule-based score with hints.
- **Gift** (`/studio`): arrange a bouquet, write a card, get a link anyone can open (`/g/[id]`).
- **Friends room** (`/room`): 2-10 players share a 4-letter code, get 3 minutes to design, then vote on each other's bouquets.

## Setup
1. `npm install`
2. Create a free Supabase project, then run `supabase/schema.sql` in its SQL editor (needed for gift links).
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key.
4. `npm run dev`

Friend rooms use Supabase Realtime (presence and broadcast) and need no tables.

## Checks
- `npm test` unit tests (scoring, studio editing, room state machine)
- `npx vitest run --config vitest.smoke.config.mts` plays a full three-player room over real Realtime (needs `.env.local`)
- `npm run lint`, `npm run build`
