"use client"

import { toast } from "sonner";
import Image from "next/image";
import Confetti from "react-confetti";
import { useAudio, useWindowSize } from "react-use";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";

import { reduceHearts } from "@/actions/user-progress";
import { challengeOptions, challenges } from "@/db/schema"
import { upsertChallengeProgress } from "@/actions/challenge-progress";

import { Header } from "./header";
import { Footer } from "./footer";
import { Challenge } from "./challenge";
import { ResultCard } from "./result-card";
import { QuestionBubble } from "./question-bubble";

type Props = {
    initialPercentage: number,
    initialHearts: number,
    initialLessonId: number,
    initialLessonChallenges: (typeof challenges.$inferSelect & {
        completed: boolean,
        challengeOptions: typeof challengeOptions.$inferSelect[];
    })[],
    userSubcription: any; //TODO: replace with subscription DB type
};

export const Quiz = ({
    initialPercentage,
    initialHearts,
    initialLessonId,
    initialLessonChallenges,
    userSubcription
}: Props) => {

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

    //Bo qua loi useAudio() ref to <audio> element is empty at mount tam thoi vi code chay van on :((
    const originalConsoleError = console.error;
    console.error = (...args) => {
        if (!args[0].includes("useAudio() ref to <audio> element is empty at mount")) {
            originalConsoleError(...args);
        }
    };

    const [pending, startTransition] = useTransition();

    const [lessonId] = useState(initialLessonId);
    const [hearts, setHearts] = useState(initialHearts);
    const [percentage, setPercentage] = useState(initialPercentage);
    const [challenges] = useState(initialLessonChallenges);
    const [activeIndex, setActiveIndex] = useState(() => {
        const uncompletedIndex = challenges.findIndex((challenge) => !challenge.completed);
        return uncompletedIndex === -1 ? 0 : uncompletedIndex;
    });

    const [selectedOption, setSelectedOption] = useState<number | undefined>();
    const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");

    const challenge = challenges[activeIndex];
    const options = challenge?.challengeOptions ?? [];

    const onNext = () => {
        setActiveIndex((current) => current + 1);
    };

    const onSelect = (id: number) => {
        if (status !== "none") return;

        setSelectedOption(id);
    };

    const onContinue = () => {
        if (!selectedOption) return;

        if (status === "wrong") {
            setStatus("none");
            setSelectedOption(undefined);
            return;
        }

        if (status === "correct") {
            onNext();
            setStatus("none");
            setSelectedOption(undefined);
            return;
        }

        const correctOption = options.find((option) => option.correct);

        if (!correctOption) {
            console.error("No correct option found!");
            return;
        }

        if (correctOption.id === selectedOption) {
            startTransition(() => {
                upsertChallengeProgress(challenge.id)
                    .then((response) => {
                        if (response?.error === "hearts") {
                            console.error("Missing hearts!");
                            return;
                        }

                        correctControls.play();
                        setStatus("correct");
                        setPercentage((pre) => pre + 100 / challenges.length);

                        //Day la luyen tap
                        if (initialPercentage === 100) {
                            setHearts((pre) => Math.min(pre + 1, 5));
                        }
                    }).catch(() => toast.error("Something went wrong! Please try again."));
            });
        } else {
            startTransition(() => {
                reduceHearts(challenge.id)
                    .then((response) => {
                        if (response?.error === "hearts") {
                            console.error("Missing hearts!");
                            return;
                        }

                        incorrectControls.play();
                        setStatus("wrong");

                        if (!response?.error) {
                            setHearts((pre) => Math.max(pre - 1, 0));
                        }

                    }).catch(() => toast.error("Something went wrong! Please try again."));
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

    const title = challenge.type === "ASSIST"
        ? "Select the correct meaning"
        : challenge.question;

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
                        <div>
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
                        </div>
                    </div>
                </div>
            </div>
            <Footer
                disable={pending || !selectedOption}
                status={status}
                onCheck={onContinue}
            />
        </>
    )
}