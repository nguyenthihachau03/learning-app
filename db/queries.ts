import { cache } from "react";
import db from "@/db/drizzle";
import { auth } from "@clerk/nextjs/server";
import { challengeProgress, challenges, courses, lessons, units, userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    //TODO: confirm whether order is needed
    const data = await db.query.units.findMany({
        where: eq(units.courseId, userProgress.activeCourseId),
        with: {
            lessons: {
                with: {
                    challenges: {
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
        // TODO: populate lessons and units
    });

    return data;
});