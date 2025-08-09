import { InlineKeyboardButton, ReplyMarkup } from "@/app/api/telegram/notify/route";
import { PendingOrder } from "@/app/dashboard/(route)/order_management/page";

interface OrderWithRelations {
    order: PendingOrder;
}

export async function sendOrderNotification(order: OrderWithRelations) {
    try {
        const formatOrderItems = (items: typeof order.order.orderItems) => {
            return items.map((item) => {
                let itemText = `• ${item.product.name}`;
                
                // Add size if available
                if (item.size?.sizeName) {
                    itemText += ` (${item.size.sizeName})`;
                }
                
                // Add customizations
                const customizations = [];
                if (item.sugar?.name) {
                    customizations.push(`🍯 ${item.sugar.name}`);
                }
                if (item.ice?.name) {
                    customizations.push(`🧊 ${item.ice.name}`);
                }
                if (item.extraShot?.name) {
                    customizations.push(`☕ ${item.extraShot.name}`);
                }
                
                // Add customizations to item text
                if (customizations.length > 0) {
                    itemText += `\n    ${customizations.join(' | ')}`;
                }
                
                // Add note if available
                if (item.note) {
                    itemText += `\n    📝 Note: ${item.note}`;
                }
                
                // Add quantity and price
                itemText += `\n    Qty: ${item.quantity} × $${Number(item.price).toFixed(2)}`;
                
                return itemText;
            }).join('\n\n');
        };

        const message = `
🔔 *NEW ORDER ALERT!*

🛍️ *ORDER #${order.order.displayId}*
📅 ${new Date(order.order.createdAt).toLocaleString()}
👤 *Customer:* ${order.order.user.name} (${order.order.user.role.name})

📋 *ITEMS:*
${formatOrderItems(order.order.orderItems)}

💰 *PAYMENT:* ${order.order.paymentStatus ? "Paid ✅" : "Pending ⏳"}
💳 *Method:* ${order.order.paymentMethod}
💵 *Total:* $${Number(order.order.total).toFixed(2)}
${Number(order.order.discount) > 0 ? `🎟️ *Discount:* $${Number(order.order.discount).toFixed(2)}\n` : ''}
🔄 *Status:* ${order.order.orderStatus}

⏰ Please prepare this order!
`;
  const inlineKeyboard = [
            [
                {
                    text: "✅ Complete Order",
                    callback_data: `complete_order_${order.order.id}`
                },
                {
                    text: "❌ Cancel Order",
                    callback_data: `cancel_order_${order.order.id}`
                }
            ],
        ];

        const adminChatId = process.env.TELEGRAM_BOT_ADMIN_ID;
        if (!adminChatId) {
            console.error('TELEGRAM_BOT_ADMIN_ID not set in environment variables');
            return false;
        }

        const result = await sendTelegramMessage(adminChatId, message, "Markdown", inlineKeyboard);
        return result;
    } catch (error) {
        console.error("[TELEGRAM_WEBHOOK]", error);
        return false;
    }
}

export async function sendTelegramMessage(chatId: string, text: string, parseMode?: string, inlineKeyboard?: InlineKeyboardButton[][]|null) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.error('TELEGRAM_BOT_TOKEN not set in environment variables');
        return null;
    }
    
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    
    try {
        const requestBody: {chat_id: string;
    text: string;
    parse_mode: string;
    reply_markup?: ReplyMarkup;} = {
            chat_id: chatId, 
            text,
            parse_mode: parseMode as string
        };

        // Add inline keyboard if provided
        if (inlineKeyboard) {
            requestBody.reply_markup = {
                inline_keyboard: inlineKeyboard
            };
        }

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Telegram API error:', data);
            return null;
        }
        
        console.log('Message sent successfully:', data);
        return data;
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        return null;
    }
}

// Optional: Send order status updates
export async function sendOrderStatusUpdate(order: OrderWithRelations, newStatus: string) {
    try {
        const message = `
🔄 *ORDER STATUS UPDATE*

🛍️ *ORDER #${order.order.displayId}*
👤 *Customer:* ${order.order.user.name}
📊 *Status changed to:* ${newStatus}
📅 *Updated:* ${new Date().toLocaleString()}

${newStatus === 'Completed' ? '🎉 Order completed successfully!' : ''}
`;

        const adminChatId = process.env.TELEGRAM_BOT_ADMIN_ID;
        if (!adminChatId) return false;

        await sendTelegramMessage(adminChatId, message, "Markdown");
        return true;
    } catch (error) {
        console.error("[TELEGRAM_STATUS_UPDATE]", error);
        return false;
    }
}