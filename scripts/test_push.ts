require('dotenv').config();
console.log("PUB:", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
console.log("PRI:", process.env.VAPID_PRIVATE_KEY);
