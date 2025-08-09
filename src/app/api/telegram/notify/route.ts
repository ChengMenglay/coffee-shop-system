import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderNotification } from '@/lib/telegram';

interface CallbackQuery {
    id: string;
    data: string;
    message: {
        chat: {
            id: number;
        };
        message_id: number;
    };
}

interface StatusUpdateBody{
    action:'complete' | 'cancel';
     orderId: string;
}
interface TelegramWebhookBody {
    orderId?: string;
    callback_query?: CallbackQuery;
    status_update?: StatusUpdateBody;
}

export interface InlineKeyboardButton {
    text: string;
    callback_data?: string;
    url?: string;
}

export interface ReplyMarkup {
    inline_keyboard: InlineKeyboardButton[][];
}


export interface EditMessageRequestBody {
    chat_id: string;
    message_id: number;
    text: string;
    parse_mode: string;
    reply_markup?: ReplyMarkup;
}

interface AnswerCallbackQueryResponse {
    ok: boolean;
    result?: boolean;
    description?: string;
}

const orderMessageMap = new Map<string, number>();

export async function POST(request: NextRequest) {
    try {
        const body: TelegramWebhookBody = await request.json();

        // Handle new order notification
        if (body.orderId) {
            return await handleNewOrderNotification(body.orderId);
        }

        //Handle status update from admin
        if(body.status_update){
            return await handleStatusUpdate(body.status_update);
        }
        
        // Handle callback queries (button clicks)
        if (body.callback_query) {
            const callbackData = body.callback_query.data;
            const chatId = body.callback_query.message.chat.id;
            const messageId = body.callback_query.message.message_id;
            console.log('Callback data:', callbackData);
            if (callbackData.startsWith('complete_order_')) {
                const orderId = callbackData.replace('complete_order_', '');
                await handleOrderComplete(body.callback_query, orderId, chatId, messageId);
            } else if (callbackData.startsWith('cancel_order_')) {
                const orderId = callbackData.replace('cancel_order_', '');
                await handleOrderCancel(body.callback_query, orderId, chatId, messageId);
            }
            
            return NextResponse.json({ ok: true });
        }
        
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error) {
        console.error('Telegram API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function handleNewOrderNotification(orderId: string) {
    try {
        // Fetch order with all related data
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: {
                    include: {
                        role: true
                    }
                },
                orderItems: {
                    include: {
                        product: true,
                        size: true,
                        sugar: true,
                        ice: true,
                        extraShot: true
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Convert order data to match expected format
        const convertedOrder = {
            id: order.id,
            userId: order.userId,
            displayId: order.displayId,
            total: order.total.toNumber(),
            paymentMethod: order.paymentMethod,
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus,
            discount: order.discount.toNumber(),
            createdAt: order.createdAt.toISOString(),
            user: {
                name: order.user.name,
                role: { name: order.user.role.name },
            },
            orderItems: order.orderItems.map((orderItem) => ({
                id: orderItem.id,
                product: {
                    name: orderItem.product.name,
                    discount: orderItem.product.discount || 0,
                    price: orderItem.product.price.toNumber(),
                },
                size: orderItem.size
                    ? {
                          sizeName: orderItem.size.sizeName,
                          priceModifier: orderItem.size.priceModifier.toNumber(),
                      }
                    : null,
                sugar: orderItem.sugar
                    ? {
                          name: orderItem.sugar.name,
                      }
                    : null,
                ice: orderItem.ice
                    ? {
                          name: orderItem.ice.name,
                      }
                    : null,
                extraShot: orderItem.extraShot
                    ? {
                          name: orderItem.extraShot.name,
                          priceModifier: orderItem.extraShot.priceModifier.toNumber(),
                      }
                    : null,
                quantity: orderItem.quantity,
                note: orderItem.note || null,
                price: orderItem.price.toNumber(),
            })),
        };

        // Send the notification with converted order
        const success = await sendOrderNotification({ order: convertedOrder });
            if (success && success.message_id) {
                orderMessageMap.set(orderId, success.message_id);
            }
        
        if (success) {
            return NextResponse.json({ success: true, message: 'Notification sent successfully' });
        } else {
            return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error sending order notification:', error);
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
}

async function handleOrderComplete(callback_query: CallbackQuery, orderId: string, chatId: number, messageId: number) {
    try {
        // Update order status in database
        const order= await prisma.order.update({
            where: { id: orderId },
            data: { orderStatus: 'Completed' }
        });

        // Edit the message to show completion
        await editTelegramMessage(
            chatId.toString(),
            messageId,
            `✅ Order #${order.displayId} has been marked as COMPLETED!`,
            null // Remove keyboard
        );

        // Send confirmation
        await answerCallbackQuery(callback_query.id, `Order #${order.displayId} marked as completed!`);
    } catch (error) {
        console.error('Error completing order:', error);
    }
}

async function handleOrderCancel(callback_query: CallbackQuery, orderId: string, chatId: number, messageId: number) {
    try {
        // Update order status in database
       const order = await prisma.order.update({
            where: { id: orderId },
            data: { orderStatus: 'Cancelled' }
        });

        // Edit the message to show cancellation
        await editTelegramMessage(
            chatId.toString(),
            messageId,
            `❌ Order #${order.displayId} has been CANCELLED!`,
            null // Remove keyboard
        );

        // Send confirmation
        await answerCallbackQuery(callback_query.id, `Order #${order.displayId} cancelled!`);
    } catch (error) {
        console.error('Error cancelling order:', error);
    }
}

async function editTelegramMessage(
    chatId: string, 
    messageId: number, 
    text: string, 
    inlineKeyboard?: InlineKeyboardButton[][] | null
) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;

    const url = `https://api.telegram.org/bot${token}/editMessageText`;

    const requestBody: EditMessageRequestBody = {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown'
    };

    if (inlineKeyboard) {
        requestBody.reply_markup = {
            inline_keyboard: inlineKeyboard
        };
    }

    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
    } catch (error) {
        console.error('Error editing message:', error);
    }
}

async function handleStatusUpdate(statusUpdate: StatusUpdateBody) {
    try {
        const { action, orderId } = statusUpdate;
        const adminChatId = process.env.TELEGRAM_BOT_ADMIN_ID;
        if (!adminChatId) {
            return NextResponse.json({ error: 'Telegram not configured' }, { status: 500 });
        }

        // Find the order by displayId to get the orderId
    const order = await prisma.order.findFirst({
    where: {
        id: orderId
    }
});

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Get the message ID from our map
        const messageId = orderMessageMap.get(order.id);

        let message: string;
        
        if (action === 'complete') {
            message = `✅ Order #${order.displayId} has been marked as COMPLETED!`;
        } else {
            message = `❌ Order #${order.displayId} has been CANCELLED!`;
        }

        // If we have the message ID, edit the existing message
        if (messageId) {
            await editTelegramMessage(
                adminChatId,
                messageId,
                message,
                null // Remove keyboard
            );
            
            // Remove from map as the order is now completed/cancelled
            orderMessageMap.delete(order.id);
        } else {
            // Fallback: send a new message if we don't have the original message ID
            const { sendTelegramMessage } = await import('@/lib/telegram');
            await sendTelegramMessage(adminChatId, message);
        }
        
        return NextResponse.json({ 
            success: true, 
            message: `${action} notification sent successfully` 
        });
        
    } catch (error) {
        console.error('Error handling status update:', error);
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
}
async function answerCallbackQuery(callbackQueryId: string, text: string): Promise<AnswerCallbackQueryResponse | null> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.error('TELEGRAM_BOT_TOKEN not found');
        return null;
    }

    const url = `https://api.telegram.org/bot${token}/answerCallbackQuery`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                callback_query_id: callbackQueryId,
                text,
                show_alert: false // Set to true if you want a popup instead of toast
            })
        });
        
        const result: AnswerCallbackQueryResponse = await response.json();
        console.log('Answer callback API response:', result);
        
        if (!response.ok) {
            console.error('Answer callback API error:', result);
            return null;
        }
        
        return result;
    } catch (error) {
        console.error('Error answering callback query:', error);
        return null;
    }
}