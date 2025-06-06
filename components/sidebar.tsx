import Image from "next/image";
import { cn } from "../lib/utils";
import Link from "next/link";
import { SidebarItem } from "./sidebar-item";
import {
    ClerkLoading,
    ClerkLoaded,
    UserButton,
} from "@clerk/nextjs";
import { Loader } from "lucide-react";

type Props = {
    className?: string;
};

export const Sidebar = ({ className }: Props) => {
    return (
        <div className={cn("flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col", className)}>
            <Link href="/learn">
                <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
                    <Image src="/mascot.svg" alt="Mascot" width={40} height={40} />
                    <h1 className="lg:text-xl text-2xl font-extrabold tracking-wide">Learning App</h1>
                </div>
            </Link>
            <div className="flex flex-col gap-y-2 flex-1">
                <SidebarItem label="Learn" href="/learn" iconSrc="/learn.svg"/>
                <SidebarItem label="Leaderboard" href="/leaderboard" iconSrc="/leaderboard.svg"/>
                <SidebarItem label="Test" href="/testform" iconSrc="/quest.svg"/>
                <SidebarItem label="Quiz" href="/quiz" iconSrc="/quiz.png"/>
                {/* <SidebarItem label="Chatbot" href="/mobile-chat" iconSrc="/robot.svg" /> */}
                <SidebarItem label="Chatbot" href="/mobile-chat" iconSrc="/robot.svg" className="lg:hidden" />
                <SidebarItem label="Shop" href="/shop" iconSrc="/shop.svg"/>
            </div>
            <div className="p-4 hidden lg:block">
                <ClerkLoading>
                    <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
                </ClerkLoading>
                <ClerkLoaded>
                    <UserButton />
                </ClerkLoaded>
            </div>
        </div>
    );
};