"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { useState, useEffect, useTransition } from "react"; // ✅ Đã thêm useState

import { Button } from "@/components/ui/button";
import { refillHearts } from "@/actions/user-progress";
import EmbeddedPayment from "./embedded-payment"; // Import component nhúng thanh toán

const POINT_TO_REFILL = 10; //export de reuse o file khac

type Props = {
    hearts: number;
    points: number;
    hasActiveSubscription: boolean;
};

export const Items = ({ hearts, points, hasActiveSubscription }: Props) => {

    const router = useRouter();
    const searchParams = useSearchParams();
    const paymentStatus = searchParams.get("payment");

    useEffect(() => {
        if (paymentStatus === "success") {
            toast.success("Thanh toán thành công! Cập nhật tài khoản...");
            setTimeout(() => {
                router.replace("/shop"); // ✅ Xóa query param
                window.location.reload();
            }, 1500);
        }
    }, [paymentStatus]);

    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

    //hook
    const [pending, startTransition] = useTransition();

    const onRefillHearts = () => {
        if (pending || hearts === 5 || points < POINT_TO_REFILL) {
            return;
        }

        startTransition(() => {
            refillHearts()
                .catch(() => toast.error("Something went wrong"));
        });
    };

    // const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(props.hasActiveSubscription);
    const [isActiveSubscription, setIsActiveSubscription] = useState<boolean>(hasActiveSubscription);

    const onUpgrade = () => {
        fetch("/api/payos/create-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                orderCode: Date.now(),
                amount: 2000,
                description: "Nâng cấp lên gói VIP",
            }),
        })
            .then((res) => res.json())
            .then((response) => {
                if (response.success && response.data.checkoutUrl) {
                    console.log("✅ Checkout URL nhận được:", response.data.checkoutUrl);
                    window.open(response.data.checkoutUrl, "_blank"); // 🛠 Mở link trực tiếp
                } else {
                    toast.error("Không thể tạo link thanh toán");
                }
            })
            .catch(() => toast.error("Lỗi khi gọi API thanh toán"));
    };

    return (
        <ul className="w-full">
            <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
                <Image
                    src="/heart.svg"
                    alt="Heart"
                    height={60}
                    width={60}
                />
                <div className="flex-1">
                    <p className="text-neutral-600 text-base lg:text-xl font-bold">
                        Refill Hearts
                    </p>
                </div>
                <Button
                    onClick={onRefillHearts}
                    disabled={pending || hearts === 5 || points < POINT_TO_REFILL}
                >
                    {hearts === 5
                        ? "full"
                        : (
                            <div className="flex items-center">
                                <Image
                                    src="/points.svg"
                                    alt="Points"
                                    height={20}
                                    width={20}
                                />
                                <p>
                                    {POINT_TO_REFILL}
                                </p>
                            </div>
                        )
                    }
                </Button>
            </div>
            <div className="flex items-center w-full p-4 pt-8 gap-x-4 border-t-2">
                <Image
                    src="/unlimited.svg"
                    alt="Unlimited"
                    height={60}
                    width={60}
                />
                <div className="flex-1">
                    <p className="text-neutral-600 text-base lg:text-xl font-bold">
                        Unlimited hearts
                    </p>
                </div>
                <Button
                    onClick={onUpgrade}
                    disabled={pending || hasActiveSubscription}
                >
                    {hasActiveSubscription ? "active" : "upgrade"}
                </Button>
            </div>
        </ul>
    )
}