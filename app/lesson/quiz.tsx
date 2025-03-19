"use client"

import { toast } from "sonner";
import Image from "next/image";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { useAudio, useWindowSize, useMount } from "react-use";

import { reduceHearts } from "@/actions/user-progress";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { challengeGames, challengeOptions, challenges, userSubscriptionPayOS } from "@/db/schema"
import { usePracticeModal } from "@/store/use-practice-modal";
import { upsertChallengeProgress } from "@/actions/challenge-progress";

import { Header } from "./header";
import { Footer } from "./footer";
import { Challenge } from "./challenge";
import { ResultCard } from "./result-card";
import { QuestionBubble } from "./question-bubble";
import { GameBubble } from "./game-bubble";

type Props = {
    initialPercentage: number,
    initialHearts: number,
    initialLessonId: number,
    initialLessonChallenges: (typeof challenges.$inferSelect & {
        completed: boolean,
        challengeOptions: typeof challengeOptions.$inferSelect[];
        challengeGames: typeof challengeGames.$inferSelect[];
    })[],
    userSubcription: typeof userSubscriptionPayOS.$inferSelect & {
        isActive: boolean;
    } | null;
};

export const Quiz = ({
    initialPercentage,
    initialHearts,
    initialLessonId,
    initialLessonChallenges,
    userSubcription
}: Props) => {

    const { open: openHeartsModal } = useHeartsModal();
    const { open: openPracticeModal } = usePracticeModal();

    useMount(() => {
        if (initialPercentage === 100) {
            openPracticeModal();
        }
    });

    const { width, height } = useWindowSize();

    const router = useRouter();

    const [finishAudio] = useAudio({ src: "/finish.mp3", autoPlay: true });
    const [
        correctAudio,
        _c,
        correctControls,
    ] = useAudio({ src: "/correct.wav" });
    const [
        incorrectAudio,
        _i,
        incorrectControls,
    ] = useAudio({ src: "/incorrect.mp3" });

    // //Bo qua loi useAudio() ref to <audio> element is empty at mount tam thoi vi code chay van on :((
    const originalConsoleError = console.error;
    console.error = (...args) => {
        if (!args[0].includes("useAudio() ref to <audio> element is empty at mount")) {
            originalConsoleError(...args);
        }
    };
    // const originalConsoleError = console.error;
    // console.error = (...args) => {
    //     const errorMessage = typeof args[0] === "string" ? args[0] : "";

    //     // Bỏ qua lỗi `useAudio` rỗng
    //     if (errorMessage.includes("useAudio() ref to <audio> element is empty at mount")) {
    //         return;
    //     }

    //     // Bỏ qua lỗi `src` rỗng
    //     if (errorMessage.includes('An empty string ("") was passed to the src attribute')) {
    //         return;
    //     }

    //     // Bỏ qua cảnh báo `sizes` trong Next.js
    //     if (errorMessage.includes("Image with src") && errorMessage.includes("missing `sizes` prop")) {
    //         return;
    //     }

    //     // Hiển thị các lỗi khác
    //     originalConsoleError(...args);
    // };


    const [pending, startTransition] = useTransition();

    const [lessonId] = useState(initialLessonId);
    const [hearts, setHearts] = useState(initialHearts);
    const [percentage, setPercentage] = useState(() => {
        return initialPercentage === 100 ? 0 : initialPercentage;
    });
    const [challenges] = useState(initialLessonChallenges);
    const [activeIndex, setActiveIndex] = useState(() => {
        const uncompletedIndex = challenges.findIndex((challenge) => !challenge.completed);
        return uncompletedIndex === -1 ? 0 : uncompletedIndex;
    });

    const [selectedOption, setSelectedOption] = useState<number | undefined>();
    const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");
    const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
    const challenge = challenges[activeIndex];
    const options = challenge?.challengeOptions ?? [];

    const onNext = () => {
        setActiveIndex((current) => current + 1);
    };

    const [fillInText, setFillInText] = useState(""); // Lưu trữ câu trả lời nhập vào

    const onSelect = (id: number) => {
        if (status !== "none") return;

        if (challenge.type === "FILL_IN_BLANK") {
            return; // Không chọn ID mà sẽ xử lý theo văn bản nhập vào
        }

        setSelectedOption(id);
    };

    const onContinue = () => {
        console.log("Challenge data:", challenge);
        console.log("User input:", fillInText);
        console.log("Correct answer:", challenge.correctAnswer);

        if (status === "wrong") {
            setStatus("none");
            setSelectedOption(undefined);
            setFillInText(""); // Reset ô nhập liệu nếu là FILL_IN_BLANK
            return;
        }

        if (status === "correct") {
            onNext(); // Chuyển câu mới
            setStatus("none");
            setSelectedOption(undefined);
            setFillInText(""); // Reset input
            return;
        }

        if (challenge.type === "GAME") {
            setStatus("correct");

            startTransition(() => {
                upsertChallengeProgress(challenge.id)
                    .then(() => {
                        setTimeout(() => {
                            onNext(); // Chuyển sang câu tiếp theo
                            setStatus("none"); // Reset trạng thái để còn học lại
                        }, 1000);
                    })
                    .catch(() => toast.error("Something went wrong! Please try again."));
            });

            return; // Dừng tại đây để không tiếp tục các xử lý khác
        }

        if (challenge.type === "FILL_IN_BLANK") {
            const userInput = fillInText.trim().toLowerCase();
            const correctAnswer = challenge.correctAnswer?.trim().toLowerCase() || "";

            if (!userInput) return; // Không cho phép bấm CHECK khi chưa nhập gì

            if (userInput === correctAnswer) {
                console.log("Answer is correct!");

                setStatus("correct"); // Đặt trạng thái đúng

                startTransition(() => {
                    upsertChallengeProgress(challenge.id)
                        .then(() => {
                            setTimeout(() => {
                                onNext(); // Chuyển sang câu tiếp theo sau khi cập nhật
                                setFillInText(""); // Reset input
                                setStatus("none"); // Đặt lại trạng thái
                            }, 1000);
                        })
                        .catch(() => toast.error("Something went wrong! Please try again."));
                });
            } else {
                console.log("Answer is wrong!");
                setStatus("wrong");
                setHearts((pre) => Math.max(pre - 1, 0));
            }
            return;
        }

        if (!selectedOption) return; // Nếu không chọn thì không tiếp tục

        const correctOption = options.find((option) => option.correct);

        if (!correctOption) {
            console.error("No correct option found!");
            return;
        }

        if (correctOption.id === selectedOption) {
            startTransition(() => {
                upsertChallengeProgress(challenge.id)
                    .then(() => {
                        correctControls.play();
                        setStatus("correct");
                        setPercentage((pre) => pre + 100 / challenges.length);

                        if (initialPercentage === 100) {
                            setHearts((pre) => Math.min(pre + 1, 5));
                        }

                        setTimeout(() => {
                            onNext();
                            setStatus("none");
                            setSelectedOption(undefined);
                        }, 1000);
                    })
                    .catch(() => toast.error("Something went wrong! Please try again."));
            });
        } else {
            startTransition(() => {
                reduceHearts(challenge.id)
                    .then((response) => {
                        if (response?.error === "hearts") {
                            openHeartsModal();
                            return;
                        }

                        incorrectControls.play();
                        setStatus("wrong");

                        if (!response?.error) {
                            setHearts((pre) => Math.max(pre - 1, 0));
                        }
                    })
                    .catch(() => toast.error("Something went wrong! Please try again."));
            });
        }
    };

    if (!challenge) {
        return (
            <>
                <div style={{ display: "none" }}>
                    {finishAudio && <>{finishAudio}</>}
                </div>

                <Confetti
                    recycle={false}
                    numberOfPieces={500}
                    tweenDuration={10000}
                    width={width}
                    height={height}
                />
                <div className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center h-full">
                    <Image
                        src="/finish.svg"
                        alt="Finish"
                        className="hidden lg:block"
                        width={100}
                        height={100}
                    />
                    <Image
                        src="/finish.svg"
                        alt="Finish"
                        className="block lg:hidden"
                        width={50}
                        height={50}
                    />
                    <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
                        Great job! <br />
                        You&apos;ve completed the lesson!
                    </h1>
                    <div className="flex items-center gap-x-4 w-full">
                        <ResultCard
                            variant="points"
                            value={challenges.length * 10}
                        />
                        <ResultCard
                            variant="hearts"
                            value={hearts}
                        />
                    </div>
                </div>
                <Footer
                    lessonId={lessonId}
                    status="completed"
                    onCheck={() => router.push("/learn")}
                />
            </>
        )
    }

    // const title = challenge.type === "ASSIST"
    //     ? "Chọn nghĩa của từ sau"
    //     : challenge.question;

    const title = (() => {
        switch (challenge.type) {
            // case "ASSIST":
            //     return "Chọn nghĩa của từ sau";
            // case "FILL_IN_BLANK":
            //     return <>Điền chữ còn thiếu vào chỗ trống:<br />{challenge.question}</>;
            // case "GAME":
            //     return "Nối các cặp tương ứng";
            // case "LISTENING":
            //     return "Nghe và điền từ đúng";
            // case "SPEAKING":
            //     return "Nói lại câu sau";
            case "GAME":
                return "Nối các cặp tương ứng"; // ✅ Tiêu đề cho game
            case "AUDIO":
                // return <>Nghe và chọn đáp án đúng:<br />{challenge.question}</>;
                return "Nghe và chọn đáp án đúng";
            default:
                return challenge.question;
        }
    })();

    return (
        <>
            <div style={{ display: "none" }}>
                {correctAudio && <>{correctAudio}</>}
                {incorrectAudio && <>{incorrectAudio}</>}
            </div>

            <Header
                hearts={hearts}
                percentage={percentage}
                hasActiveSubscription={!!userSubcription?.isActive}
            />
            <div className="flex-1">
                <div className="h-full flex items-center justify-center">
                    <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
                        <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700">
                            {title}
                        </h1>
                        {/* <div>
                            {challenge.type === "ASSIST" && (
                                <QuestionBubble
                                    question={challenge.question}
                                />
                            )}
                            <Challenge
                                options={options}
                                onSelect={onSelect}
                                status={status}
                                selectedOption={selectedOption}
                                disable={pending}
                                type={challenge.type}
                            />
                        </div> */}
                        {/* Hiển thị nút Nghe nếu câu hỏi có audio */}
                        {challenge.type === "AUDIO" && challenge.audioUrl && (
                            <div className="flex flex-col items-center mb-4">
                                {/* Thẻ audio có điều khiển mặc định */}
                                <audio id="audio-player" controls className="hidden">
                                    <source src={challenge.audioUrl} type="audio/mpeg" />
                                    Trình duyệt của bạn không hỗ trợ phát âm thanh.
                                </audio>

                                {/* Nút nghe */}
                                <button
                                    onClick={() => {
                                        const audioElement = document.getElementById("audio-player") as HTMLAudioElement;
                                        if (audioElement) {
                                            audioElement.currentTime = 0; // Reset về đầu
                                            audioElement.play(); // Phát lại âm thanh
                                        }
                                    }}
                                    className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition"
                                >
                                    🎵 Nghe lại
                                </button>
                            </div>
                        )}

                        <div>
                            {/* Nếu là ASSIST thì hiển thị QuestionBubble */}
                            {challenge.type === "ASSIST" && (
                                <QuestionBubble question={challenge.question} />
                            )}

                            {challenge.type === "GAME" && (
                                <GameBubble
                                    pairs={challenge.challengeGames.map(g => ({
                                        id: g.id,
                                        answer1: g.answer1,
                                        answer2: g.answer2
                                    }))}
                                    onAllCorrect={onContinue}
                                />
                            )}

                            {/* Nếu là FILL_IN_BLANK thì hiển thị ô nhập */}
                            {challenge.type === "FILL_IN_BLANK" ? (
                                <input
                                    type="text"
                                    value={fillInText}
                                    onChange={(e) => {
                                        console.log("Input value changed:", e.target.value); // Debug input
                                        setFillInText(e.target.value);
                                    }}
                                    placeholder="Nhập câu trả lời..."
                                    className="border p-2 rounded w-full text-lg"
                                />
                            ) : (
                                /* Nếu không phải FILL_IN_BLANK thì hiển thị Challenge */
                                <Challenge
                                    options={options}
                                    onSelect={onSelect}
                                    status={status}
                                    selectedOption={selectedOption}
                                    disable={pending}
                                    type={challenge.type}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* <Footer
                // disable={pending || !selectedOption}
                // disable={pending || (!selectedOption && challenge.type !== "FILL_IN_BLANK" && !fillInText)}
                status={status}
                onCheck={onContinue}
            /> */}
            <Footer
                disable={pending || (challenge.type === "FILL_IN_BLANK" ? !fillInText.trim() : !selectedOption)}
                status={status}
                onCheck={onContinue}
            />

        </>
    )
}