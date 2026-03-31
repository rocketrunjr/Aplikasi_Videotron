import "dotenv/config";
import { sendTelegramMessage } from "./src/services/telegram.service.js";

async function test() {
    console.log("Testing Telegram bot message...");
    const res = await sendTelegramMessage({ chatId: "5366222833", text: "Hello dari test script localhost!" });
    console.log("Result:", res);
}

test();
