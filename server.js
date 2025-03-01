const axios = require("axios");
const PushBullet = require('pushbullet').default
require('dotenv').config()

const PUSHBULLET_ACCESS_TOKEN = process.env.PUSHBULLET_ACCESS_TOKEN // Replace with your token
const pusher = new PushBullet(PUSHBULLET_ACCESS_TOKEN);

console.log(PUSHBULLET_ACCESS_TOKEN)

// new PushBullet()

const CRYPTO_ID = "pi-network"; // CoinGecko ID
const FIAT = "eur";
const TARGET_PRICE = 1.75; // Change this

async function getCryptoPrice() {
    try {
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${CRYPTO_ID}&vs_currencies=${FIAT}`;
        const response = await axios.get(url);
        return response.data[CRYPTO_ID][FIAT];
    } catch (error) {
        console.error("Error fetching crypto price:", error);
        return null;
    }
}

function sendNotification(price) {
    const message = `🚨 Alert! ${CRYPTO_ID.toUpperCase()} price dropped to €${price} 🚨`;
    pusher.note({}, "Crypto Price Alert", message, (error, response) => {
        if (error) console.error("Pushbullet Error:", error);
        else console.log("Notification Sent:", response);
    });
}

async function monitorPrice() {
    while (true) {
        const price = await getCryptoPrice();
        if (price) {
            console.log(`Current ${CRYPTO_ID} price: €${price}`);
            if (price <= TARGET_PRICE) {
                sendNotification(price);
                break;
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 60000));
    }
}

monitorPrice();
