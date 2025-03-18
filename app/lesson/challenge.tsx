import { cn } from "@/lib/utils";
import { challengeOptions, challenges } from "@/db/schema"
import { Card } from "./card";

type Props = {
    options: typeof challengeOptions.$inferSelect[];
    onSelect: (id: number) => void;
    status: "correct" | "wrong" | "none";
    selectedOption?: number;
    disable?: boolean;
    type: typeof challenges.$inferSelect["type"];
};

export const Challenge = ({
    options,
    onSelect,
    status,
    selectedOption,
    disable,
    type,
}: Props) => {
    return (
        <div className={cn(
            "grid gap-2",
            // type === "ASSIST" && "grid-cols-1",
            // type === "SELECT" && "grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]"
            type === "ASSIST" && "grid-cols-1",
            type === "SELECT" && "grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]",
            type === "IMAGE" && "grid-cols-2 gap-4", // Hiển thị dạng hình ảnh theo chiều dọc
            type === "AUDIO" && "grid-cols-2 gap-4", // Hiển thị dạng âm thanh theo chiều dọc
            type === "FILL_IN_BLANK" && "grid-cols-1" // Hiển thị dạng điền từ theo chiều dọc

        )}>
            {options.map((option, i) => (
                // <div>
                //     {JSON.stringify(option)}
                // </div>
                <Card
                    key={option.id}
                    id={option.id}
                    text={option.text}
                    imageSrc={option.imageSrc}
                    shortcut={`${i + 1}`}
                    selected={selectedOption === option.id}
                    onClick={() => onSelect(option.id)}
                    status={status}
                    audioSrc={option.audioSrc}
                    disable={disable}
                    type={type}
                />
            ))}
        </div>
    );
};