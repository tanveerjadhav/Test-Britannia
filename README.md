# Britannia Snackin — Final Next.js + Supabase

This is the production-ready MVP for the live community artwork.

## Stack
- Next.js
- Vercel
- GitHub
- Supabase Database
- Supabase Storage
- Supabase Realtime

## 1. Supabase
The SQL is in `supabase/setup.sql`. You already ran this in the Supabase project.

## 2. Vercel environment variables
In Vercel → Project → Settings → Environment Variables add:

`NEXT_PUBLIC_SUPABASE_URL` = `https://iulrjvqygsopssxxqiwb.supabase.co`

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = your `sb_publishable_...` key

Do not add a service_role/secret key.

## 3. Deploy
Import the GitHub repo in Vercel. Framework: Next.js. Root directory: `./`.
Vercel will install dependencies and build automatically.

## 4. Realtime test
Open the deployed site in two windows.
Upload a face in one window.
After the insert succeeds, the other window receives the Supabase Realtime INSERT and updates the artwork.

## Important
The visual renderer uses the exact Snackin silhouette and currently has 4,096 visual slots for browser performance. The database can contain far more participants. The next scale pass can use a server-generated composite for 10K–100K+ faces while retaining realtime updates.
