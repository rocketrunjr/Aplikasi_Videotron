/**
 * Telegram Notification Service
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export interface TelegramMessageParams {
    chatId: string;
    text: string;
}

/**
 * Sends a message to a specific Telegram Chat ID using the Telegram Bot API.
 */
export async function sendTelegramMessage({ chatId, text }: TelegramMessageParams) {
    if (!TELEGRAM_BOT_TOKEN || !chatId) {
        console.log('[Telegram Service] Missing Bot Token or Chat ID. Skipping notification.');
        return false;
    }

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML',
            }),
        });

        const data = await response.json();
        
        if (!data.ok) {
            console.error('[Telegram Service] Error from Telegram API:', data.description);
            return false;
        }

        console.log(`[Telegram Service] Successfully sent message to ${chatId}`);
        return true;
    } catch (error) {
        console.error('[Telegram Service] Failed to send message:', error);
        return false;
    }
}
