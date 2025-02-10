"use client"

import { toast } from "sonner";
import { useState, useTransition } from "react";

import { challengeOptions, challenges } from "@/db/schema"
import { upsertChallengeProgress } from "@/actions/challenge-progress";

import { Header } from "./header";
import { Footer } from "./footer";
import { Challenge } from "./challenge";
import { QuestionBubble } from "./question-bubble";
import { reduceHearts } from "../../actions/user-progress";

type Props = {
    initialPercentage: number,
    initialHearts: number,
    initialLessonId: number,
    initialLessonChallenges: (typeof challenges.$inferSelect & {
        completed: boolean,
        challengeOptions: typeof challengeOptions.$inferSelect[];
    }) [],
    userSubcription: any; //TODO: replace with subscription DB type
};

export const Quiz = ({
    initialPercentage,
    initialHearts,
    initialLessonId,
    initialLessonChallenges,
    userSubcription
}: Props) => {

    const [pending, startTransition] = useTransition();

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
        if(status !== "none") return;

        setSelectedOption(id);
    };

    const onContinue = () => {
        if(!selectedOption) return;

        if(status === "wrong") {
            setStatus("none");
            setSelectedOption(undefined);
            return;
        }

        if(status === "correct") {
            onNext();
            setStatus("none");
            setSelectedOption(undefined);
            return;
        }

        const correctOption = options.find((option) => option.correct);

        if(!correctOption) {
            console.error("No correct option found!");
            return;
        }

        if(correctOption.id === selectedOption) {
            startTransition(() => {
                upsertChallengeProgress(challenge.id)
                .then((response) => {
                    if(response?.error === "hearts") {
                        console.error("Missing hearts!");
                        return;
                    }

                    setPercentage((pre) => pre + 100 / challenges.length);
                    setStatus("correct");

                    //Day la luyen tap
                    if(initialPercentage === 100) {
                        setHearts((pre) => Math.min(pre + 1, 5));
                    }
                }).catch(()=>toast.error("Something went wrong! Please try again."));
            });
        } else {
            startTransition(() => {
                reduceHearts(challenge.id)
                .then((response) => {
                    if(response?.error === "hearts") {
                        console.error("Missing hearts!");
                        return;
                    }

                    setStatus("wrong");

                    if(!response?.error) {
                        setHearts((pre) => Math.max(pre - 1, 0));
                    }

                }).catch(() => toast.error("Something went wrong! Please try again."));
            });
        }
    };

    const title = challenge.type === "ASSIST"
    ? "Select the correct meaning"
    : challenge.question;

    return (
        <>
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