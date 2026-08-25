# Vincenzo Sacco — author site & the *What Will I Do All Day?* survey

A Vite + React + TypeScript site with two parts:

- **`/`** — the author landing page for the published books.
- **`/survey`** — an interactive, phone-first survey for the next book,
  *What Will I Do All Day?*. It walks a reader from question 1 to question 15,
  builds a formatted **Word report** from their answers, and emails it.

## The survey at a glance

| | |
|---|---|
| Questions | 15, in the six parts of the printed survey |
| Screens | One question at a time, with progress, Back, Skip and a review page |
| Saves | Every answer is stored on the device as it is typed; the survey can be closed and resumed |
| Delivery | A `.docx` report plus a `.json` copy of the raw answers, emailed to you |
| If offline | The response is held on the device and sent automatically on the next visit |
| Phones | Works in Safari on iPhone and Chrome on Android, and installs to the home screen |

### What the emailed report contains

1. **At a glance** — a one-line profile and a table of cross-cut signals: horizon,
   bigger worry, day clarity, work intent, confidence, support, prior effort.
2. **In their own words** — the free-text answers on their own, ready to quote.
3. **Every answer** — all 15 questions in order, with skipped ones marked.
4. **Follow-up** — the email address, and whether consent to contact was given.

The `.json` attachment is the same response flattened to one row of key/value
pairs, so responses can be piled into a spreadsheet without retyping.

## Running it

```sh
npm install
npm run dev      # http://localhost:8080
npm run test     # unit + flow tests
npm run lint
npm run build
```

## Setting up email delivery

Reports are sent by a small serverless function, `api/send-report.ts`. It is a
standard `Request` → `Response` handler, so it runs on Vercel, Netlify
(`netlify/functions/send-report.ts` re-exports it), Cloudflare Pages and Deno
Deploy unchanged. It sends through [Resend](https://resend.com).

1. Create a Resend account and verify the domain you will send from.
2. Set three environment variables in your host's dashboard — never in the
   client bundle:

   | Variable | Value |
   |---|---|
   | `RESEND_API_KEY` | Your Resend API key |
   | `REPORT_TO_EMAIL` | Where reports are delivered — your inbox |
   | `REPORT_FROM_EMAIL` | A verified sender, e.g. `survey@yourdomain.com` |

3. Deploy. The app posts to `/api/send-report` by default; point it elsewhere
   with `VITE_REPORT_ENDPOINT` at build time if your host uses another path.

See `.env.example`. Until the variables are set the endpoint answers `503`, and
the app tells the respondent their answers are saved and will be sent later —
nothing is lost, and everything queued is retried on the next visit.

### Using a different email service

Only the last step of `api/send-report.ts` is Resend-specific: one `fetch` to
`https://api.resend.com/emails` with `from`, `to`, `subject`, `text` and
base64 `attachments`. Swap that call for Postmark, SendGrid or SES and the rest
of the pipeline is unchanged.

## Installing on a phone

The app ships a web manifest, icons and a service worker, so it installs like a
native app and keeps working on a weak connection:

- **iPhone** — open the site in Safari, Share → *Add to Home Screen*.
- **Android** — open in Chrome, menu → *Install app* / *Add to Home Screen*.

The installed app opens straight into the survey.

## How the code fits together

```
src/survey/
  questions.ts   the 15 questions, their choices and the intro/closing copy
  types.ts       question and answer shapes
  answers.ts     formatting, "answered?" rules, the derived signals, flat export
  docx.ts        builds the Word report as OOXML
  zip.ts         a small store-only ZIP writer (a .docx is a ZIP of XML parts)
  storage.ts     draft autosave and the outbox of undelivered responses
  submit.ts      builds the response, posts it, downloads or shares it
src/components/survey/   intro, one screen per question kind, review, done
src/pages/Survey.tsx     the flow: intro -> questions -> review -> sent
api/send-report.ts       the serverless email endpoint
```

The Word report is generated in the browser with no third-party library, so it
also builds under Node in the tests — `src/survey/__tests__/docx.test.ts` opens
the package back up and checks the XML.

### Changing the survey

Edit `src/survey/questions.ts`. Add an entry, give it a unique `id`, a `number`,
one of the six `part` labels and a `kind` (`single`, `multi`, `text`, `scale`,
`details`, `contact`). The progress bar, the review page, the Word report and the
spreadsheet export all follow from that one definition — nothing else needs
touching. The tests check the numbering, unique ids and the parts.

### Regenerating the app icons

```sh
python3 scripts/generate-icons.py   # needs Pillow
```
