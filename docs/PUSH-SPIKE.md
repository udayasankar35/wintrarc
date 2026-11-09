# Push spike

A throwaway tool that proves one thing before any feature depends on it: a real
push message can travel from this server, through a browser's push service, to a
device. Stage 9 builds the real notification system on what this proves.

## What exists

- `src/sw/sw.ts`: the app's service worker (served at `/serwist/sw.js`). Its push
  handler shows a notification, and a click opens a same-origin page. The
  decisions live in `src/sw/push-logic.ts`, which has unit tests. The worker is
  registered by the app on every page, so installing the app also enables push.
- `/dev/push-spike`: a page that inspects the device, asks for permission only
  after a button press and never after a refusal, subscribes, and sends a test.
- `POST /api/dev/push-test`: sends one test push. It is hidden (HTTP 404) unless
  `ENABLE_PUSH_SPIKE=true`, needs the secret `x-spike-token`, only talks to real
  push-service hosts, and is rate limited to 10 calls a minute.
- The page is honest about state. It says "subscribed" only when the browser
  holds a real subscription, and it tells iPhone users to install the app first.

## Set it up

1. Generate a key pair: `npm run vapid`. Keep one pair for the life of the
   project, because replacing it invalidates every subscription.
2. Put these in `.env.local` and in Vercel (Project Settings, Environment
   Variables). Use a random token of at least 16 characters.

   ```text
   ENABLE_PUSH_SPIKE=true
   PUSH_SPIKE_TOKEN=<random token>
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<from npm run vapid>
   VAPID_PRIVATE_KEY=<from npm run vapid>
   VAPID_SUBJECT=mailto:you@example.com
   ```

3. Redeploy. `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is inlined at build time, so a
   restart is not enough.
4. Check with `npm run check-env`, then open `/dev/push-spike` on the device.
5. When you are done testing, remove `ENABLE_PUSH_SPIKE` and redeploy. The page
   and route disappear.

Push needs HTTPS. `localhost` counts as secure for desktop testing, but a phone
needs the deployed URL.

## Test on each device

Open `/dev/push-spike`, press **Enable notifications**, allow the prompt, enter
the token, press **Send test push**, then watch for the notification. A message
saying "the push service accepted the message" only means delivery was
accepted. The notification must actually appear on the device.

| Device                             | How to run it                                                                           |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| Desktop Chrome or Edge             | Open the page in a normal window. Private windows do not support push.                  |
| Windows and macOS                  | Repeat in each browser you care about. Optionally install the app first.                |
| Android Chrome                     | Install the app from the browser menu, open it from the Home Screen, then run the test. |
| iPhone or iPad (iOS 16.4 or later) | Safari, Share, Add to Home Screen. Open WINTRARC from the Home Screen icon, then test.  |

Also check these on at least one device: tapping the notification opens the
spike page, denying the prompt shows "Notifications are blocked" with no second
prompt, and unsubscribing then subscribing again works.

## Results (fill in)

| Date | Device and OS | Browser | Installed | Prompt shown | Subscribed | Test accepted (HTTP) | Notification appeared | Click opened page |
| ---- | ------------- | ------- | --------- | ------------ | ---------- | -------------------- | --------------------- | ----------------- |
|      |               |         |           |              |            |                      |                       |                   |

## What automation verified, and what it could not

Verified in the build environment:

- The service worker registers and activates, and is served as JavaScript with
  `Cache-Control: no-store`.
- The page renders on desktop and phone viewports with no horizontal scroll, and
  reports "Allowed, but this device is not subscribed" when permission is granted
  without a subscription.
- The route returns 404 when disabled, 401 for a missing or wrong token, 400 for
  malformed JSON and for endpoints that are not real push services (including
  the cloud metadata address), 429 once the rate limit is hit, and never echoes a
  key or token in any response.

Not verifiable here:

- **Real delivery.** Automated browsers run in an incognito-style mode, where
  Chrome does not support the Push API, so subscribing fails with "permission
  denied". The page reports this clearly. Real subscription and delivery on
  Chrome, Android and iOS must be tested by hand with the table above.

## Troubleshooting

- **"Registration failed - permission denied"**: you are in a private window, or
  notifications are blocked for the site.
- **iPhone shows "Install to the Home Screen first"**: open the app from the
  Home Screen icon, not from Safari. iOS gives push only to installed apps.
- **Test returns 404**: `ENABLE_PUSH_SPIKE` is not `true` in this deployment.
- **Test returns 410**: the subscription expired. Unsubscribe and subscribe again.
- **Accepted but nothing appears**: check Focus or Do Not Disturb, system
  notification settings for the browser or app, and that the app is not
  force-closed on Android battery savers.
