import { authClient } from "./src/lib/auth-client.js";

async function run() {
    try {
        console.log("Testing signIn with captchaToken mapped to fetchOptions...");
        await authClient.signIn.email({
            email: "admin@videotron.local",
            password: "admin",
        }, {
            fetchOptions: {
                headers: {
                    "x-captcha-token": "123",
                },
            }
        });
    } catch (e) {
        console.error("Error expected due to mock or real endpoint");
    }
}
run();
