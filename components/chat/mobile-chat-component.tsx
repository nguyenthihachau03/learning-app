"use client";
import { useState } from "react";
import Image from "next/image";

type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

const MobileChatComponent = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("sessionId", sessionId);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, sessionId }),
      });

      const data = await res.json();
      const wordList = data.response
        ?.split("\n")
        .filter((item: string) => item.trim() !== "") || [];

      setMessages((prev) => [
        ...prev,
        ...wordList.map((text: string): ChatMessage => ({ role: "bot", text })),
      ]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", text: "❗ Có lỗi xảy ra." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-50px)]"> {/* 50px là chiều cao MobileHeader */}
      {/* Nội dung tin nhắn */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <Image src="/robot.svg" alt="robot" width={80} height={80} />
            <p className="mt-4 text-lg font-medium">
              Hãy chat với mình nhé, mình sẽ hỗ trợ bạn học tập!
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-2 rounded-lg max-w-[75%] break-words ${
                    msg.role === "user" ? "bg-blue-100" : "bg-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <p className="text-gray-400 text-center">✍️ Đang phản hồi...</p>}
          </>
        )}
      </div>

      {/* Nhập tin nhắn */}
      <div className="p-3 flex gap-2 border-t bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Nhập tin nhắn..."
          className="flex-1 p-2 border rounded-lg"
        />
        <button onClick={sendMessage} className="text-blue-600 text-xl">➤</button>
      </div>
    </div>
  );
};

export default MobileChatComponent;
