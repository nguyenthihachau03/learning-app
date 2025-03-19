"use client";

import { useEffect, useState, useRef } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

// Định nghĩa kiểu dữ liệu cho props
type MicrophoneComponentProps = {
  challenge: {
    id: number;
    question: string;
  };
  onContinue: (transcript: string) => void; // Gửi transcript lên Quiz.tsx
};

const MicrophoneComponent = ({ challenge, onContinue }: MicrophoneComponentProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("🚨 Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.");
      return;
    }

    setIsRecording(true);
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "auto"; // Tự động nhận diện ngôn ngữ

    recognitionRef.current.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIsRecording(false); // Dừng trạng thái ghi âm
      onContinue(text); // Gửi transcript về `Quiz.tsx`
    };

    recognitionRef.current.onerror = () => {
      alert("🚨 Lỗi nhận diện giọng nói. Vui lòng thử lại!");
      setIsRecording(false);
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center text-center gap-y-4">
      <p className="text-lg font-semibold text-gray-700">🎤 {challenge.question}</p>

      <button
        onClick={handleToggleRecording}
        className={`px-6 py-3 ${isRecording ? "bg-red-400 hover:bg-red-500" : "bg-blue-400 hover:bg-blue-500"} text-white font-bold rounded-lg transition`}
      >
        {isRecording ? "⏹️ Dừng ghi" : "🎙️ Ghi âm"}
      </button>

      {transcript && <p className="text-md text-gray-600 font-medium">Bạn đã nói: "{transcript}"</p>}
    </div>
  );
};

export default MicrophoneComponent;
