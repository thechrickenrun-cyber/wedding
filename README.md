# Pattree & Supatpong E-Wedding Card

Next.js wedding invitation with Thai/English copy, light/dark themes, music playback, RSVP submission, and Google Sheets storage.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Google Sheets RSVP

Create a Google Cloud service account, share the target Google Sheet with the service account email, then set these environment variables in `.env.local` and Vercel:

```bash
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_PRIVATE_KEY=
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SHEETS_SHEET_NAME=RSVP
```

The private key can be pasted with escaped newlines. The API route converts `\n` sequences before authenticating.

Suggested sheet columns. The first column is stored as `dd-MM-yyyy` in the Asia/Bangkok timezone.

```text
Date, Name, Attendance, Guest Count, Phone, Message, Locale
```

## Build

```bash
npm run build
npm run lint
```
