export const sendWhatsAppMessage = async (to, templateName, variables) => {
    try {
        const token = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (!token || !phoneId) {
            console.error("❌ WhatsApp Credentials missing in .env");
            return { success: false, error: "Missing Credentials in .env" };
        }

        const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

        // Default template structure for "hello_world"
        // If a real template is used, the structure needs to be dynamic.
        // For this implementation, we will use "hello_world" as the safe default trial.

        let body = {
            messaging_product: "whatsapp",
            to: to,
            type: "template",
            template: {
                name: templateName || "hello_world",
                language: {
                    code: "en_US"
                }
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ WhatsApp API Error:", JSON.stringify(data, null, 2));
            return { success: false, error: data };
        }

        console.log("✅ WhatsApp Message Sent Successfully:", data);
        return { success: true, data: data };

    } catch (error) {
        console.error("❌ Error sending WhatsApp message:", error);
        return { success: false, error: error.message };
    }
};
