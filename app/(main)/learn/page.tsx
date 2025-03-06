import { redirect } from "next/navigation";

import { lessons, units as unitsSchema } from "@/db/schema";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Header } from "./header";
import { getCourseProgress, getLessonPercentage, getUnits, getUserProgress } from "@/db/queries";
import { Unit } from "./unit";
import { getUserSubscriptionPayOS } from "@/actions/user-subscription";
import { Promo } from "@/components/promo";

const LearnPage = async () => {

    const userProgressData = getUserProgress();
    const courseProgressData = getCourseProgress();
    const lessonPercentageData = getLessonPercentage();
    const unitsData = getUnits();
    const userSubcriptionData = getUserSubscriptionPayOS();

    const [
        userProgress,
        units,
        courseProgress,
        lessonPercentage,
        userSubscription,
    ] = await Promise.all([
        userProgressData,
        unitsData,
        courseProgressData,
        lessonPercentageData,
        userSubcriptionData
    ]);

    if (!userProgress || !userProgress.activeCourse) {
        redirect("/courses");
    }

    if (!courseProgress) {
        redirect("/courses");
    }

    const isPro = !!userSubscription?.isActive;

    return (
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
                <Header title={userProgress.activeCourse.title} />
                {
                    units.map((unit) => (
                        <div key={unit.id} className="mb-10">
                            {/* {JSON.stringify(unit)} */}
                            <Unit
                                id={unit.id}
                                order={unit.order}
                                description={unit.description}
                                title={unit.title}
                                lessons={unit.lessons}
                                activeLesson={courseProgress?.activeLesson as typeof lessons.$inferSelect & {
                                    unit: typeof unitsSchema.$inferSelect;
                                } | undefined}
                                activeLessonPercentage={lessonPercentage}
                            />
                        </div>
                    ))
                }
            </FeedWrapper>
        </div>
    );
};

export default LearnPage;