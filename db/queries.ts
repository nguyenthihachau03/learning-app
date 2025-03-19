import { cache } from "react";
import db from "@/db/drizzle";
import { auth } from "@clerk/nextjs/server";
import { challengeProgress, challenges, courses, lessons, units, userProgress, userSubscriptionPayOS } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const getUserProgress = cache(async () => {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    const data = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
        with: {
            activeCourse: true,
        }
    });

    return data;
});

export const getUnits = cache(async () => {
    const { userId } = await auth();
    const userProgress = await getUserProgress();

    if (!userId || !userProgress?.activeCourseId) {
        return [];
    }

    const data = await db.query.units.findMany({
        orderBy: (units, { asc }) => [asc(units.order)],
        where: eq(units.courseId, userProgress.activeCourseId),
        with: {
            lessons: {
                orderBy: (lessons, { asc }) => [asc(lessons.order)],
                with: {
                    challenges: {
                        orderBy: (challenges, { asc }) => [asc(challenges.order)],
                        with: {
                            challengeProgress: {
                                where: eq(
                                    challengeProgress.userId,
                                    userId,
                                )
                            }
                        },
                    },
                },
            },
        },
    });

    // //vòng lặp lồng nhau qua unit → lessons → challenges → challengeProgress, để kiểm tra xem tất cả các challenge của mỗi lesson đã hoàn thành chưa.
    // const normalizedData = data.map((unit) => {
    //     const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
    //         if (lesson.challenges.length === 0) {
    //             return { ...lesson, completed: false }
    //         }

    //         const allCompletedChallenges = lesson.challenges.every((challenge) => {
    //             return (
    //                 challenge.challengeProgress &&
    //                 challenge.challengeProgress.length > 0 &&
    //                 challenge.challengeProgress.every((progress) => progress.completed)
    //             );
    //         });

    //         return { ...lesson, completed: allCompletedChallenges };
    //     });

    //     return { ...unit, lessons: lessonsWithCompletedStatus };
    // });

    // return normalizedData;

    return data.map((unit) => ({
        ...unit,
        lessons: unit.lessons.map((lesson) => {
            // Nếu lesson không có challenge nào, trả về completed: false
            if (lesson.challenges.length === 0) {
                return { ...lesson, completed: false };
            }

            let allCompleted = true; // Giả định lesson đã hoàn thành

            for (const challenge of lesson.challenges) {
                if (
                    !challenge.challengeProgress ||
                    challenge.challengeProgress.length === 0 ||
                    challenge.challengeProgress.some((progress) => !progress.completed)
                ) {
                    allCompleted = false;
                    break; // Nếu có 1 challenge chưa hoàn thành, dừng ngay
                }
            }

            return { ...lesson, completed: allCompleted };
        }),
    }));

});

export const getCourses = cache(async () => {
    const data = await db.query.courses.findMany();
    return data;
});

export const getCourseById = cache(async (courseId: number) => {
    const data = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
        with: {
            units: {
                orderBy: (units, { asc }) => [asc(units.order)],
                with: {
                    lessons: {
                        orderBy: (lessons, { asc }) => [asc(lessons.order)],
                    },
                },
            },
        },
    });

    return data;
});

export const getCourseProgress = cache(async () => {
    const { userId } = await auth();
    const userProgress = await getUserProgress();

    if (!userId || !userProgress?.activeCourseId) {
        return null;
    }

    const unitsInActiveCourse = await db.query.units.findMany({
        orderBy: (units, { asc }) => [asc(units.order)],
        where: eq(units.courseId, userProgress.activeCourseId),
        with: {
            lessons: {
                orderBy: (lessons, { asc }) => [asc(lessons.order)],
                with: {
                    unit: true,
                    challenges: {
                        with: {
                            challengeProgress: {
                                where: eq(challengeProgress.userId, userId),
                            },
                        },
                    },
                },
            },
        },
    });

    const firstUncompletedLesson = unitsInActiveCourse
        .flatMap((unit) => unit.lessons)
        .find((lesson) => {
            return lesson.challenges.some((challenge) => {
                console.log('challenge :>> ', challenge);
                return !challenge.challengeProgress
                    || challenge.challengeProgress.length === 0
                    || challenge.challengeProgress.some((progress) => progress.completed === false)
            });
        });

    return {
        activeLesson: firstUncompletedLesson,
        activeLessonId: firstUncompletedLesson?.id,
    };
});

export const getLesson = cache(async (id?: number) => {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    const courseProgress = await getCourseProgress();

    const lessonId = id || courseProgress?.activeLessonId;

    if (!lessonId) {
        return null;
    }

    const data = await db.query.lessons.findFirst({
        where: eq(lessons.id, lessonId),
        with: {
            challenges: {
                orderBy: (challenges, { asc }) => [asc(challenges.order)],
                with: {
                    challengeOptions: true,
                    challengeProgress: {
                        where: eq(challengeProgress.userId, userId),
                    },
                    challengeGames: true,
                },
            },
        },
    });

    if (!data || !data.challenges) {
        return null;
    }

    const normalizedChallenges = data.challenges.map((challenge) => {
        const completed = challenge.challengeProgress
            && challenge.challengeProgress.length > 0
            && challenge.challengeProgress.every((progress) => progress.completed);

        return { ...challenge, completed };
    });

    return { ...data, challenges: normalizedChallenges }
});

//Ty le phan tram bai hoc
export const getLessonPercentage = cache(async () => {
    const courseProgress = await getCourseProgress();

    if (!courseProgress?.activeLessonId) {
        return 0;
    }

    const lesson = await getLesson(courseProgress.activeLessonId);

    if (!lesson) {
        return 0;
    }

    const completedChallenges = lesson.challenges
        .filter((challenge) => challenge.completed);

    const percentage = Math.round(
        (completedChallenges.length / lesson.challenges.length) * 100,
    );

    return percentage;
});

// export async function getUserSubscription(userId: string) {
//     const subscription = await db.query.userSubscriptionPayOS.findFirst({
//         where: eq(userSubscriptionPayOS.userId, userId),
//         orderBy: desc(userSubscriptionPayOS.currentPeriodEnd),
//     });

//     if (!subscription || !subscription.currentPeriodEnd) { // ✅ Kiểm tra null trước
//         return { isActive: false };
//     }

//     // Kiểm tra subscription còn hạn không
//     const isActive = subscription.currentPeriodEnd > new Date();

//     return {
//         isActive,
//         currentPeriodEnd: subscription.currentPeriodEnd,
//     };
// }

const DAY_IN_MS = 86_400_000;

export const getUserSubscription = cache(async () => {
    const { userId } = await auth();

    if (!userId) return null;

    const data = await db.query.userSubscriptionPayOS.findFirst({
        where: eq(userSubscriptionPayOS.userId, userId),
    });

    if (!data) return null;

    const isActive =
        data.orderCode &&
        (data.currentPeriodEnd?.getTime() ?? 0) + DAY_IN_MS > Date.now(); //?? 0 dam bao gia tri hop le

    return {
        ...data,
        isActive: !!isActive,
    };
});

export const getTopTenUsers = cache(async () => {
    const { userId } = await auth();

    if (!userId) return [];

    const data = await db.query.userProgress.findMany({
        orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
        limit: 10,
        columns: {
            userId: true,
            userName: true,
            userImageSrc: true,
            points: true,
        },
    });

    return data;
});