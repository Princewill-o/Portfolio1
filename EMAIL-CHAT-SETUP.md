# Messages setup

The desktop Messages app uses a real Node server, private SQLite conversations,
Resend outgoing email and authenticated incoming-email webhooks. It is not Apple's
iMessage service. Princewill receives each visitor message by email and can reply
from that email; the response returns to the same visitor's website conversation.

## Connect delivery

1. Create a Resend account at https://resend.com and verify a sending domain.
2. Enable email receiving using a dedicated subdomain or the Resend-provided
   receiving domain. Keep existing personal-email MX records unchanged.
3. Copy `.env.example` to `.env`. Set `CHAT_OWNER_EMAIL` to Princewill's inbox,
   `CHAT_FROM_EMAIL` to a verified sending address, `CHAT_INBOUND_DOMAIN` to the
   receiving domain, and `RESEND_API_KEY` to a server-side API key with sending and
   receiving permissions. Never share these secrets through the browser.
4. Deploy this Node application with Node 24+, persistent disk for `data/`, HTTPS,
   and `PUBLIC_ORIGIN` set to its exact public origin. A static-only deployment
   cannot process messages. Set `HOST=0.0.0.0` on your hosting service.
5. In Resend, add `https://YOUR-HOST/api/chat/webhook`, subscribe to
   `email.received`, and copy its signing secret to `RESEND_WEBHOOK_SECRET`.
6. Run `npm run dev` locally or `npm start` on the host. Configuration is read at
   server startup. For local webhook testing, use an HTTPS tunnel and its exact
   origin in `PUBLIC_ORIGIN`; open the site at that origin as well.

## Test real delivery before publishing

Send a message from a fresh browser. Confirm it arrives in Princewill's mailbox.
Reply ABOVE the quoted original email without changing Reply-To. Keep the site
open; the reply should appear in that conversation within about eight seconds.
Open another browser/profile: it must not see the first visitor's conversation.
Check duplicate webhook deliveries do not duplicate replies. If delivery fails,
the app reports failure and keeps the draft available for retry.

The UI remains explicitly unavailable until every required setting is present.
No live delivery is claimed before this end-to-end test. An API acceptance means
the email service accepted the message; it is not proof of inbox delivery.

## Data and reply behaviour

Messages remain in `data/chat.sqlite`; back up and retain that directory according
to your privacy policy. Do not commit or include it in downloadable source bundles.
Visitors authenticate with an HttpOnly same-site session cookie. A visitor can
resume the conversation in that browser for 30 days; clearing cookies loses access.
There is no cross-device account recovery. The visitor's supplied email is shown
to Princewill but is not an authenticated identity. Replies are accepted only from
`CHAT_OWNER_EMAIL` and the private per-chat receiving address. Use that mailbox's
primary From address when replying. Plain-text replies are supported; attachments
and HTML-only replies are not published into the chat.

Abuse controls include request-size limits, same-origin writes, hourly limits,
per-conversation daily limits, signed webhook verification and idempotent email
requests. Use a reverse proxy/CDN abuse policy for a public launch. Avoid multiple
server replicas against one local SQLite file.

Documentation: https://resend.com/docs/receive-emails,
https://resend.com/docs/api-reference/emails/send-email,
https://resend.com/docs/api-reference/emails/retrieve-received-email.
