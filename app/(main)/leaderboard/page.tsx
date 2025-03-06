import Image from "next/image";
import { redirect } from "next/navigation";
import { getUserSubscriptionPayOS } from "@/actions/user-subscription";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { getTopTenUsers, getUserProgress } from "@/db/queries";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Promo } from "@/components/promo";

const LeaderboardPage = async () => {
  const userProgressData = await getUserProgress();
  const userSubscriptionData = await getUserSubscriptionPayOS();
  const leeaderboardData = getTopTenUsers();

  const [leeaderboard, userProgress, userSubscription] = await Promise.all([leeaderboardData, userProgressData, userSubscriptionData]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  const isPro = !!userSubscription?.isActive;

  return (
    <div className="flex flex-col items-center px-6">

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
            <Image src="/leaderboard.svg" alt="Leaderboard" height={90} width={90} />
            <h1 className="text-center font-bold text-neutral-800 text-2xl">Leaderboard</h1>
            <p className="text-muted-foreground text-center text-lg mb-6">
              See where you stand among other learners in the community.
            </p>
            <Separator className="mb-4 h-0.5 rounded-full" />
            {leeaderboard.map((userProgress, index) =>
            (
              <div key={userProgress.userId}
                className="flex w-full items-center rounded-xl p-2 px-4 hover:bg-gray-200/50"
              >
                <p className="mr-4 font-bold text-lime-700">{index + 1}</p>

                <Avatar className="ml-3 mr-6 h-12 w-12 border bg-green-500">
                  <AvatarImage
                    src={userProgress.userImageSrc}
                    className="object-cover"
                  />
                </Avatar>

                <p className="flex-1 font-bold text-neutral-800">
                  {userProgress.userName}
                </p>
                <p className="text-muted-foreground">{userProgress.points} XP</p>
              </div>
            ))}
          </div>
        </FeedWrapper>
      </div>
    </div>
  );
};

export default LeaderboardPage;