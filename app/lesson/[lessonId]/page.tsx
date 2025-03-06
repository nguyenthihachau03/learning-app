import { redirect } from "next/navigation";
import { getLesson, getUserProgress, getUserSubscription } from "@/db/queries";
import { Quiz } from "../quiz";

type Props = {
    params: Promise<{ lessonId: string }>; // ✅ Định nghĩa params là Promise
};

const LessonIdPage = async ({ params }: Props) => {
    // ✅ Chờ params được resolve trước khi sử dụng
    const resolvedParams = await params;
    const lessonId = Number(resolvedParams.lessonId);
    const userSubcriptionData = getUserSubscription();
    // ✅ Kiểm tra nếu lessonId không hợp lệ thì chuyển hướng
    if (isNaN(lessonId) || lessonId <= 0) {
        redirect("/learn");
    }

    // ✅ Gọi dữ liệu từ database
    const [lesson, userProgress, userSubcription] = await Promise.all([
        getLesson(lessonId),
        getUserProgress(),
        userSubcriptionData,
    ]);

    // ✅ Nếu không tìm thấy lesson hoặc userProgress, chuyển hướng
    if (!lesson || !userProgress) {
        redirect("/learn");
    }

    // ✅ Tính toán phần trăm hoàn thành bài học
    const initialPercentage =
        (lesson.challenges.filter((challenge) => challenge.completed).length /
            lesson.challenges.length) *
        100;

    return (
        <Quiz
            initialLessonId={lesson.id}
            initialLessonChallenges={lesson.challenges}
            initialHearts={userProgress.hearts}
            initialPercentage={initialPercentage}
            userSubcription={userSubcription}
        />
    );
};

export default LessonIdPage;
