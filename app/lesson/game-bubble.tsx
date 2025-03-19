import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type GameBubbleProps = {
    pairs: { id: number; answer1: string; answer2: string }[];
    onAllCorrect: () => void; // Callback khi nối đúng tất cả
};

const shuffleArray = <T,>(array: T[]): T[] => {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export const GameBubble = ({ pairs, onAllCorrect }: GameBubbleProps) => {
    const [selectedAnswer1, setSelectedAnswer1] = useState<number | null>(null);
    const [selectedAnswer2, setSelectedAnswer2] = useState<number | null>(null);
    const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
    const [incorrectPair, setIncorrectPair] = useState<boolean>(false);
    const [shuffledAnswers, setShuffledAnswers] = useState<
        { id: number; answer2: string }[]
    >([]);

    // Xáo trộn answer2 nhưng giữ nguyên id để so sánh đúng
    useEffect(() => {
        setShuffledAnswers(shuffleArray(pairs.map(p => ({ id: p.id, answer2: p.answer2 }))));
    }, [pairs]);

    const handleSelect = (id: number, type: "answer1" | "answer2") => {
        if (matchedPairs.includes(id)) return; // Nếu đã chọn đúng trước đó, bỏ qua

        if (type === "answer1") {
            setSelectedAnswer1(id);
        } else {
            setSelectedAnswer2(id);
        }

        // Khi đã chọn đủ 2 nút
        if (selectedAnswer1 !== null && type === "answer2") {
            const firstPair = pairs.find((p) => p.id === selectedAnswer1);
            const secondPair = shuffledAnswers.find((p) => p.id === id);

            if (firstPair && secondPair && firstPair.id === secondPair.id) {
                // Nếu đúng, thêm vào danh sách cặp đã nối
                setMatchedPairs((prev) => [...prev, selectedAnswer1, id]);
                setSelectedAnswer1(null);
                setSelectedAnswer2(null);
            } else {
                // Nếu sai, hiển thị màu đỏ trong 500ms
                setIncorrectPair(true);
                setTimeout(() => {
                    setIncorrectPair(false);
                    setSelectedAnswer1(null);
                    setSelectedAnswer2(null);
                }, 500);
            }
        }
    };

    // Kiểm tra nếu đã nối đúng tất cả các cặp, gọi onAllCorrect và reset trạng thái
    useEffect(() => {
        if (matchedPairs.length === pairs.length * 2) {
            onAllCorrect();
            setTimeout(() => {
                setMatchedPairs([]);
                setSelectedAnswer1(null);
                setSelectedAnswer2(null);
            }, 500);
        }
    }, [matchedPairs, pairs.length, onAllCorrect]);

    return (
        <div className="grid grid-cols-2 gap-4 w-full">
            <div className="flex flex-col gap-2">
                {pairs.map((pair) => (
                    <Button
                        key={`left-${pair.id}`}
                        variant={
                            matchedPairs.includes(pair.id)
                                ? "primary"
                                : selectedAnswer1 === pair.id
                                ? incorrectPair
                                    ? "danger"
                                    : "primary"
                                : "primaryOutline"
                        }
                        onClick={() => handleSelect(pair.id, "answer1")}
                        disabled={matchedPairs.includes(pair.id)}
                    >
                        {pair.answer1}
                    </Button>
                ))}
            </div>
            <div className="flex flex-col gap-2">
                {shuffledAnswers.map((pair) => (
                    <Button
                        key={`right-${pair.id}`}
                        variant={
                            matchedPairs.includes(pair.id)
                                ? "primary"
                                : selectedAnswer2 === pair.id
                                ? incorrectPair
                                    ? "danger"
                                    : "primary"
                                : "primaryOutline"
                        }
                        onClick={() => handleSelect(pair.id, "answer2")}
                        disabled={matchedPairs.includes(pair.id)}
                    >
                        {pair.answer2}
                    </Button>
                ))}
            </div>
        </div>
    );
};
