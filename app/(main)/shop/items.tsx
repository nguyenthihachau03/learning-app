"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { useState, useEffect, useTransition } from "react"; // ✅ Đã thêm useState

import { Button } from "@/components/ui/button";
import { refillHearts } from "@/actions/user-progress";
import { checkAndUpdateSubscription } from "@/actions/user-subscription"; // ✅ Import action server

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

    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

    // Kiểm tra trạng thái thanh toán khi user quay lại
    useEffect(() => {
        if (paymentStatus === "success") {
            onCheckSubscription();
        }
    }, [paymentStatus]);

    const onCheckSubscription = async () => {
        if (!checkoutUrl) return;

        const orderCode = checkoutUrl.split("orderCode=")[1]; // Lấy orderCode từ URL

        const res = await checkAndUpdateSubscription(orderCode);

        if (res.success) {
            toast.success("Nâng cấp thành công! Cập nhật tài khoản...");
            setTimeout(() => {
                router.replace("/shop");
                window.location.reload();
            }, 1500);
        } else {
            toast.error("Không thể xác nhận thanh toán.");
        }
    };

    const onUpgrade = async () => {
        const generatedOrderCode = Date.now(); // ✅ Giới hạn số chữ số
        console.log("📌 Order Code gửi đi:", generatedOrderCode);

        try {
            const res = await fetch("/api/payos/create-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderCode: generatedOrderCode,
                    amount: 2000,
                    description: "Nâng cấp lên gói VIP",
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("❌ [Client] API trả về lỗi:", errorData);
                toast.error("Không thể tạo link thanh toán");
                return;
            }

            const response = await res.json();
            console.log("✅ [Client] Nhận link thanh toán:", response.data.checkoutUrl);

            //     if (response.success && response.data.checkoutUrl) {
            //         const checkoutUrl = `${response.data.checkoutUrl}&orderCode=${generatedOrderCode}`; // ✅ Thêm orderCode vào URL
            //         window.open(checkoutUrl, "_blank");
            //     } else {
            //         toast.error("Không thể tạo link thanh toán");
            //     }
            // } catch (error) {
            //     console.error("❌ [Client] Lỗi khi gọi API thanh toán:", error);
            //     toast.error("Lỗi khi gọi API thanh toán");
            // }
            if (response.success && response.data.checkoutUrl) {
                window.open(response.data.checkoutUrl, "_blank");
            } else {
                toast.error("Không thể tạo link thanh toán");
            }
        } catch (error) {
            console.error("❌ [Client] Lỗi khi gọi API thanh toán:", error);
            toast.error("Lỗi khi gọi API thanh toán");
        }
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