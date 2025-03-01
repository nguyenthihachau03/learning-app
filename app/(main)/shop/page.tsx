import Image from "next/image";
import { redirect } from "next/navigation";
import { getUserSubscriptionPayOS } from "@/actions/user-subscription";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { getUserProgress } from "@/db/queries";

import { Items } from "./items";

type ShopPageProps = {
    searchParams: Record<string, string | undefined>;
  };

const ShopPage = async ({ searchParams }: ShopPageProps) => {
    const payment = searchParams?.payment ?? "";

    const userProgress = await getUserProgress();
    const userSubscription = await getUserSubscriptionPayOS();

    if (!userProgress || !userProgress.activeCourse) {
        redirect("/courses");
    }

    const isPro = !!userSubscription?.isActive;

    // Nếu thanh toán thành công, reload lại trang
    const shouldReload = payment === "success";

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress
                    activeCourse={userProgress.activeCourse}
                    hearts={userProgress.hearts}
                    points={userProgress.points}
                    hasActiveSubscription={isPro}
                />
            </StickyWrapper>
            <FeedWrapper>
                <div className="w-full flex flex-col items-center">
                    <Image src="/shop.svg" alt="Shop" height={90} width={90} />
                    <h1 className="text-center font-bold text-neutral-800 text-2xl">Shop</h1>
                    <p className="text-muted-foreground text-center text-lg mb-6">
                        Spend your points on cool stuff
                    </p>
                    <Items
                        hearts={userProgress.hearts}
                        points={userProgress.points}
                        hasActiveSubscription={isPro}
                    />
                    {shouldReload && <meta httpEquiv="refresh" content="2;url=/shop" />}
                </div>
            </FeedWrapper>
        </div>
    );
};

export default ShopPage;