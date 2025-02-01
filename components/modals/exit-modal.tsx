"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useExitModel } from "@/store/use-exit-modal";

export const ExitModel = () => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const { isOpen, close } = useExitModel();

    useEffect(() => setIsClient(true), []);

    if (!isClient) {
        return null;
    }

    return(
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center w-full justify-center">
                        <Image
                            src="/mascot_sad.svg"
                            alt="Mascot Sad"
                            height={120}
                            width={120}
                        />
                    </div>
                    <DialogTitle className="text-center font-bold text-2xl">
                        Wait, don't go!
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        You're about to leave the lesson. Are you sure?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mb-4">
                    <div className="flex flex-col gap-y-4 w-full">
                        <Button
                        variant="primary"
                        className="w-full"
                        size="lg"
                        onClick={close}
                        >
                            Keep learning
                        </Button>
                        <Button
                        variant="dangerOutline"
                        className="w-full"
                        size="lg"
                        onClick={() => {
                            close();
                            router.push("/learn")
                        }}
                        >
                            End session
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};