import { relations } from "drizzle-orm";
import { boolean, integer, jsonb, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const courses = pgTable("courses", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    imageSrc: text("image_src").notNull(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
    userProgress: many(userProgress),
    units: many(units),
}));

export const units = pgTable("units", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(), //Unit 1
    description: text("description").notNull(), //Learn the basics of Spanish
    courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade"}).notNull(),
    order: integer("order").notNull(),
})

export const unitsRelations = relations(units, ({many,one}) => ({
    course: one(courses, {
        fields: [units.courseId],
        references: [courses.id]
    }),

    lessons: many(lessons),
}));

export const lessons = pgTable("lessons", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    unitId: integer("unit_id").references(() => units.id, { onDelete: "cascade" }).notNull(),
    order: integer("order").notNull(),
});

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
    unit: one(units, {
        fields: [lessons.unitId],
        references: [units.id],
    }),
    challenges: many(challenges),
}));

export const challengesEnum = pgEnum("type", ["SELECT", "ASSIST"]);

// export const challenges = pgTable("challenges", {
//     id: serial("id").primaryKey(),
//     lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
//     type: challengesEnum("type").notNull(),
//     question: text("question").notNull(),
//     order: integer("order").notNull(),
// });

export const challenges = pgTable("challenges", {
    id: serial("id").primaryKey(),
    lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
    type: varchar("type", { length: 50 }).notNull(), // "assist", "select", "image", "audio", "fill-in-the-blank"
    question: text("question").notNull(),
    imageUrl: text("image_url"), // Hình ảnh cho câu hỏi dạng image
    audioUrl: text("audio_url"), // Âm thanh cho câu hỏi dạng audio
    correctAnswer: text("correct_answer"), // Đáp án đúng nếu là dạng điền từ
    order: integer("order").notNull(),
});

// export const challengesRelations = relations(challenges, ({ one, many }) => ({
//     lesson: one(lessons, {
//         fields: [challenges.lessonId],
//         references: [lessons.id],
//     }),

//     challengeOptions: many(challengeOptions),

//     challengeProgress: many(challengeProgress),
// }));

export const challengesRelations = relations(challenges, ({ one, many }) => ({
    lesson: one(lessons, {
        fields: [challenges.lessonId],
        references: [lessons.id],
    }),
    challengeOptions: many(challengeOptions),
    challengeProgress: many(challengeProgress),
    challengeGames: many(challengeGames),
}));

export const challengeOptions = pgTable("challenge_options", {
    id: serial("id").primaryKey(),
    challengeId: integer("challenge_id").references(() => challenges.id, { onDelete: "cascade" }).notNull(),
    text: text("text").notNull(),
    correct: boolean("correct").notNull(),
    imageSrc: text("image_src"),
    audioSrc: text("audio_src"),
});

export const challengeOptionsRelations = relations(challengeOptions, ({ one }) => ({
    challenge: one(challenges, {
        fields: [challengeOptions.challengeId],
        references: [challenges.id],
    }),
}));
export const challengeGames = pgTable("challenge_games", {
    id: serial("id").primaryKey(),
    challengeId: integer("challenge_id").references(() => challenges.id, { onDelete: "cascade" }).notNull(),
    answer1: text("answer1").notNull(),
    answer2: text("answer2").notNull(),
    correct: boolean("correct").notNull(),
    imageSrc: text("image_src"),
    audioSrc: text("audio_src"),
});
export const challengeGamesRelations = relations(challengeGames, ({ one }) => ({
    challenge: one(challenges, {
        fields: [challengeGames.challengeId],
        references: [challenges.id],
    }),
}));
export const challengeProgress = pgTable("challenge_progress", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    challengeId: integer("challenge_id").references(() => challenges.id, { onDelete: "cascade" }).notNull(),
    completed: boolean("completed").notNull().default(false),
});

export const challengeProgressRelations = relations(challengeProgress, ({ one }) => ({
    challenge: one(challenges, {
        fields: [challengeProgress.challengeId],
        references: [challenges.id],
    }),
}));

export const userProgress = pgTable("user_progress", {
    userId: text("user_id").primaryKey(),
    userName: text("user_name").notNull().default("User"),
    userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
    activeCourseId: integer("active_course_id").references(() => courses.id, {onDelete: "cascade"}),
    hearts: integer("hearts").notNull().default(5),
    points: integer("points").notNull().default(0),
});

export const userProgressRelations = relations(userProgress, ({ one }) => ({
    activeCourse: one(courses,{
        fields: [userProgress.activeCourseId],
        references: [courses.id],
    }),
}));


export const userSubscriptionPayOS = pgTable("user_subscription_payos", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().unique(),
    orderCode: text("order_code").notNull().unique(),
    priceId: text("price_id").notNull(),
    status: text("status").notNull().default("PENDING"),
    currentPeriodEnd: timestamp("current_period_end"), // ✅ Cho phép null ban đầu
});

export const vocabularys = pgTable("vocabularys", {
    id: serial("id").primaryKey(),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
    title: text("title").notNull(), // Tiêu đề bộ từ vựng
    description: text("description"),
    order: integer("order").notNull(),
});
export const vocabularySetRelations = relations(vocabularys, ({ one, many }) => ({
    course: one(courses, {
        fields: [vocabularys.courseId],
        references: [courses.id],
    }),
    quizzes: many(quiz),
    items: many(vocabularyItems),
}));

export const vocabularyItems = pgTable("vocabulary_items", {
    id: serial("id").primaryKey(),
    vocabularyId: integer("vocabulary_id").references(() => vocabularys.id, { onDelete: "cascade" }).notNull(),
    word: text("word").notNull(),
    meaning: text("meaning").notNull(),
    order: integer("order").notNull(),
});

export const vocabularyItemRelations = relations(vocabularyItems, ({ one }) => ({
    vocabulary: one(vocabularys, {
        fields: [vocabularyItems.vocabularyId],
        references: [vocabularys.id],
    }),
}));

export const quiz = pgTable("quiz", {
    id: serial("id").primaryKey(),
    vocabularyId: integer("vocabulary_set_id").references(() => vocabularys.id, { onDelete: "cascade" }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    question: text("question").notNull(),
    options: jsonb("options").notNull(),
    correctAnswer: text("correct_answer").notNull(),
    explanation: text("explanation"),
    order: integer("order").notNull(),
    audioUrl: text("audio_url"),
    imageUrl: text("image_url"),
});

export const quizRelations = relations(quiz, ({ one }) => ({
    vocabularySet: one(vocabularys, {
        fields: [quiz.vocabularyId],
        references: [vocabularys.id],
    }),
}));