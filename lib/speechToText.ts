export const speechToText = async (audioBlob: Blob, language: string = ""): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY; // Lưu API Key vào biến môi trường
    if (!apiKey) {
        throw new Error("API Key is missing. Please set NEXT_PUBLIC_OPENAI_API_KEY.");
    }

    const formData = new FormData();
    formData.append("file", audioBlob);
    formData.append("model", "whisper-1"); // Chọn model nhận diện giọng nói của OpenAI

    if (language) {
        formData.append("language", language); // Cho phép người dùng chọn ngôn ngữ (vd: "en", "vi", "zh")
    }

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Failed to transcribe audio. Status: ${response.status}`);
    }

    const data = await response.json();
    return data.text || "";
};
