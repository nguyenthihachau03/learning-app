import { redirect } from "next/navigation";
import { getLesson, getUserProgress } from "@/db/queries";
import { Quiz } from "./quiz";
import { getUserSubscriptionPayOS } from "@/actions/user-subscription";

const LessonPage = async() => {
    const lessonData = getLesson();
    const userProgressData = getUserProgress();
    const userSubcriptionData = getUserSubscriptionPayOS();

    const [
        lesson,
        userProgress,
        userSubscription,
    ] = await Promise.all([
        lessonData,
        userProgressData,
        userSubcriptionData
    ]);

    if (!lesson || !userProgress) {
        redirect("/learn");
    }

    const initialPercentage = lesson.challenges
        .filter((challenge) => challenge.completed)
        .length / lesson.challenges.length * 100;

    return (
        <Quiz
            initialLessonId={lesson.id}
            initialLessonChallenges={lesson.challenges}
            initialHearts={userProgress.hearts}
            initialPercentage={initialPercentage}
            userSubcription={userSubscription}
        />
    );
};

export default LessonPage;