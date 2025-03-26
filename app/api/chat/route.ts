import { NextRequest, NextResponse } from "next/server";

type ChatMessage = { role: "user" | "assistant"; content: string };

// Bản đồ lưu hội thoại theo session
const conversationMap: Record<string, ChatMessage[]> = {};

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { message, sessionId } = body;

        if (!message || !sessionId) {
            return NextResponse.json({ error: "Missing message or sessionId" }, { status: 400 });
        }

        // Lấy lịch sử hội thoại theo sessionId
        let history = conversationMap[sessionId] || [];
        history.push({ role: "user", content: message });

        // Giới hạn số tin nhắn để tránh quá dài (ví dụ: 10 dòng gần nhất)
        if (history.length > 10) {
            history = history.slice(-10);
        }

        // Gửi lịch sử hội thoại lên API
        const openaiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: "google/gemma-3-4b-it:free",
                models: [
                    "deepseek/deepseek-r1-zero:free",
                    "mistralai/mistral-small-3.1-24b-instruct:free",
                    "gryphe/mythomax-l2-13b:free",
                ],
                messages: [
                    {
                        role: "system",
                        content: "Bạn là một trợ lý AI thông minh. Luôn luôn trả lời và giải thích bằng tiếng Việt, trừ khi người dùng yêu cầu sử dụng ngôn ngữ khác.",
                    },
                    ...history,
                ],
            }),
        });

        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.json();
            return NextResponse.json({ error: errorData }, { status: openaiResponse.status });
        }

        const data = await openaiResponse.json();
        const botMessage: ChatMessage = {
            role: "assistant",
            content: data.choices[0].message.content.trim(),
        };

        // Thêm phản hồi của bot vào lịch sử và cập nhật bản đồ
        history.push(botMessage);
        conversationMap[sessionId] = history;

        return NextResponse.json({ response: botMessage.content });
    } catch (error) {
        console.error("GPT API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
