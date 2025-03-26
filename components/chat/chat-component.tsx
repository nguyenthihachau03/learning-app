"use client";
import React, { useState } from "react";
import Image from "next/image";

type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

const ChatComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input } as const;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Lưu hoặc lấy sessionId cố định cho người dùng
      let sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        sessionId = crypto.randomUUID(); // hoặc dùng Date.now() + Math.random() nếu cần đơn giản
        localStorage.setItem("sessionId", sessionId);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          sessionId, // Gửi sessionId lên để bot biết phiên người dùng nào
        }),
      });

      const data = await res.json();
      if (data.response) {
        // Nếu là danh sách từ vựng, tách thành nhiều tin nhắn
        const wordList = data.response.split("\n").filter((item: string) => item.trim() !== "");
        setMessages((prev) => [
          ...prev,
          ...wordList.map((text: string) => ({ role: "bot", text })),
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "bot", text: "❗ Không nhận được phản hồi từ trợ lý." }]);
      }
    } catch (error) {
      console.error("Chat API Error:", error);
      setMessages((prev) => [...prev, { role: "bot", text: "❗ Có lỗi xảy ra khi gửi tin nhắn." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50">
      {/* Nút mở chat */}
      <button
        onClick={toggleChat}
        className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition"
      >
        <Image src="/mascot.svg" alt="chat bot" width={24} height={24} />
      </button>

      {/* Hộp chat */}
      {isOpen && (
        <div className="w-80 h-96 bg-white rounded-lg shadow-xl mt-2 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-lg">
            <span>Trợ lý AI</span>
            <button onClick={toggleChat} className="text-white font-bold">✖</button>
          </div>

          {/* Nội dung tin nhắn */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && !loading ? (
              <p className="text-gray-500 text-center">💬 Bắt đầu trò chuyện với trợ lý AI...</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2 items-start ${msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  {msg.role === "bot" && (
                    <Image src="/mascot.svg" alt="bot" width={24} height={24} />
                  )}
                  <div
                    className={`p-2 rounded-lg max-w-[75%] break-words ${msg.role === "user"
                      ? "bg-blue-100 text-right"
                      : "bg-gray-100 text-left"
                      }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  {msg.role === "user" && (
                    <Image src="/mascot_sad.svg" alt="user" width={24} height={24} />
                  )}
                </div>
              ))
            )}
            {loading && <p className="text-gray-400 text-center">✍️ Đang phản hồi...</p>}
          </div>

          {/* Ô nhập tin nhắn */}
          <div className="border-t p-3 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-2 border rounded-lg"
              placeholder="Nhập tin nhắn..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} className="text-blue-600 text-lg">➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
