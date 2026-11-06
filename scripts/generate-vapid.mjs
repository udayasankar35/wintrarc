import webpush from "web-push";

const { publicKey, privateKey } = webpush.generateVAPIDKeys();

console.log(`New VAPID key pair generated.

Add these lines to .env.local and to your Vercel project's environment
variables. The private key is a secret: never commit it, paste it into a chat
or put it in client code.

NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKey}
VAPID_PRIVATE_KEY=${privateKey}
VAPID_SUBJECT=mailto:replace-with-your-email@example.com

Replacing the pair later invalidates every existing push subscription, so
keep one pair for the life of the project.`);
