import Image from "next/image";
import { redirect } from "next/navigation";

import { getUserSubscriptionPayOS } from "@/actions/user-subscription";
import { Promo } from "@/components/promo";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { getUserProgress } from "@/db/queries";

import { Items } from "./items";
import PaymentStatus from "./PaymentStatus";

const ShopPage = async () => {
  const userProgress = await getUserProgress();
  const userSubscription = await getUserSubscriptionPayOS();

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  const isPro = !!userSubscription?.isActive;

  return (
    <div className="flex flex-col items-center px-6">
      {/* Hiển thị thông báo thanh toán */}
      <PaymentStatus />

      <div className="flex flex-row-reverse gap-[48px] px-6">
        <StickyWrapper>
          <UserProgress
            activeCourse={userProgress.activeCourse}
            hearts={userProgress.hearts}
            points={userProgress.points}
            hasActiveSubscription={isPro}
          />
          {!isPro && (<Promo />)}
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
          </div>
        </FeedWrapper>
      </div>
    </div>
  );
};

export default ShopPage;