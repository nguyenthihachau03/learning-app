import { cn } from "@/lib/utils";
import { useCallback } from "react";
import { useAudio, useKey } from "react-use";

import { challenges } from "@/db/schema";
import Image from "next/image";

type Props = {
    id: number;
    imageSrc: string | null;
    audioSrc: string | null;
    text: string;
    shortcut: string;
    selected?: boolean;
    onClick: () => void;
    disable?: boolean;
    status: "correct" | "wrong" | "none";
    type: typeof challenges.$inferSelect["type"];
}

export const Card = ({
    id,
    imageSrc,
    audioSrc,
    text,
    shortcut,
    selected,
    onClick,
    disable,
    status,
    type,
}: Props) => {
    const [audio, _, controls] = useAudio({ src: audioSrc || "" });
    // Chỉ render useAudio nếu audioSrc hợp lệ và không phải dạng ASSIST
    // const audioElement = audioSrc && type !== "ASSIST" ? useAudio({ src: audioSrc })[0] : null;
    // const [audio, , controls] = useAudio({ src: audioSrc || undefined });

    // const handleClick = useCallback(() => {
    //     if (disable) return;

    //     if (audioSrc && type !== "ASSIST") {
    //         useAudio({ src: audioSrc })[2].play(); // Chỉ play nếu có audioSrc hợp lệ
    //     }

    //     onClick();
    // }, [disable, onClick, audioSrc, type]);

    // useKey(shortcut, handleClick, {}, [handleClick]);

    const handleClick = useCallback(() => {
        if (disable) return;

        controls.play();
        onClick();
    }, [disable, onClick, controls]);

    useKey(shortcut, handleClick, {}, [handleClick]); //shortcut cua element card.tsx

    return (
        <div
            onClick={handleClick}
            className={cn(
                "h-full border-2 rounded-xl border-b-4 hover:bg-black/5 p-4 lg:p-6 cursor-pointer active:border-b-2",
                selected && "border-sky-300 bg-sky-100 hover:bg-sky-100",
                selected && status === "correct" && "border-green-300 bg-green-100 hover:bg-green-100",
                selected && status === "wrong" && "border-rose-300 bg-rose-100 hover:bg-rose-100",
                disable && "pointer-events-none hover:bg-white",
                type === "ASSIST" && "lg:p-3 w-full"
            )}
        >
            {/* {audio} */}
            {/* ✅ Chỉ render audio nếu có audioSrc hợp lệ và không phải ASSIST */}
            {audioSrc && type !== "ASSIST" && audio}
            {imageSrc && (
                <div
                    className="relative aspect-square mb-4 max-h-[80px] lg:max-h-[150px] w-full"
                >
                    <Image
                        src={imageSrc}
                        fill alt={text}
                    />
                </div>
            )}
            {/* <div className={cn(
                "flex items-center justify-between",
                type === "ASSIST" && "flex-row-reverse",
            )}>
                {type === "ASSIST" && <div />}
                <p className={cn(
                    "text-neutral-600 text-sm lg:text-base",
                    selected && "text-sky-500",
                    selected && status === "correct" && "text-green-500",
                    selected && status === "wrong" && "text-rose-500",
                )}>
                    {text}
                </p>
                <div className={cn(
                    "lg:w-[30px] lg:h-[30px] w-[20px] h-[20px] border-2 flex items-center justify-center rounded-lg text-neutral-400 lg:text-[15px] text-xs font-semibold",
                    selected && "border-sky-300 text-sky-500",
                    selected && status === "correct" && "border-green-500 text-green-500",
                    selected && status === "wrong" && "border-rose-500 text-rose-500",
                )}>
                    {shortcut}
                </div>
            </div> */}
            {/* Hiển thị hình ảnh nếu là câu hỏi IMAGE */}
            {/* {type === "IMAGE" && imageSrc && (
                <div className="relative w-full h-[150px] mb-4">
                    <Image
                        src={imageSrc}
                        alt={text}
                        layout="fill"
                        objectFit="contain"
                        className="rounded-lg"
                    />
                </div>
            )} */}

            {/* Hiển thị văn bản bình thường */}
            <div className={cn(
                "flex items-center justify-between mt-2",
                type === "ASSIST" && "flex-row-reverse",
            )}>
                {type === "ASSIST" && <div />}
                <p className={cn(
                    "text-neutral-600 text-sm lg:text-base",
                    selected && "text-sky-500",
                    selected && status === "correct" && "text-green-500",
                    selected && status === "wrong" && "text-rose-500",
                )}>
                    {text}
                </p>
                <div className={cn(
                    "lg:w-[30px] lg:h-[30px] w-[20px] h-[20px] border-2 flex items-center justify-center rounded-lg text-neutral-400 lg:text-[15px] text-xs font-semibold",
                    selected && "border-sky-300 text-sky-500",
                    selected && status === "correct" && "border-green-500 text-green-500",
                    selected && status === "wrong" && "border-rose-500 text-rose-500",
                )}>
                    {shortcut}
                </div>
            </div>
        </div>
    )
}