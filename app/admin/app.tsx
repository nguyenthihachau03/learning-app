"use client";

import simpleRestProvider from "ra-data-simple-rest";
import { Admin, Resource } from "react-admin";
import { ChallengeCreate } from "./challenge/create";
import { ChallengeEdit } from "./challenge/edit";
import { ChallengeList } from "./challenge/list";
import { ChallengeOptionCreate } from "./challengeOption/create";
import { ChallengeOptionEdit } from "./challengeOption/edit";
import { ChallengeOptionsList } from "./challengeOption/list";
import { CourseCreate } from "./course/create";
import { CourseEdit } from "./course/edit";
import { CourseList } from "./course/list";
import { LessonCreate } from "./lesson/create";
import { LessonEdit } from "./lesson/edit";
import { LessonList } from "./lesson/list";
import { UnitCreate } from "./unit/create";
import { UnitEdit } from "./unit/edit";
import { UnitList } from "./unit/list";
import { ChallengeGamesList } from "./challengeGame/list";
import { ChallengeGameCreate } from "./challengeGame/create";
import { ChallengeGameEdit } from "./challengeGame/edit";
import { QuizList } from "./quiz/list";
import { QuizEdit } from "./quiz/edit";
import { QuizCreate } from "./quiz/create";
import { VocabularyList } from "./vocabulary/list";
import { VocabularyEdit } from "./vocabulary/edit";
import { VocabularyCreate } from "./vocabulary/create";
import { VocabularyItemList } from "./vocabularyItem/list";
import { VocabularyItemCreate } from "./vocabularyItem/create";
import { VocabularyItemEdit } from "./vocabularyItem/edit";
import Dashboard from "./dashboard";
import customLayout from "./customLayout";

const dataProvider = simpleRestProvider("/api");

const App = () => {
  return (
    <Admin dataProvider={dataProvider} dashboard={Dashboard} layout={customLayout}>
      <Resource name="courses" recordRepresentation="title" options={{ label: "Khóa học" }} list={CourseList} create={CourseCreate} edit={CourseEdit} />
      <Resource name="units" recordRepresentation="title" options={{ label: "Bài học" }} list={UnitList} create={UnitCreate} edit={UnitEdit} />
      <Resource name="vocabularys" recordRepresentation="title" options={{ label: "Từ vựng" }} list={VocabularyList} create={VocabularyCreate} edit={VocabularyEdit} />
      <Resource name="vocabularyItems" recordRepresentation="title" options={{ label: "Chi tiết từ vựng" }} list={VocabularyItemList} create={VocabularyItemCreate} edit={VocabularyItemEdit}/>
      <Resource name="lessons" recordRepresentation="title" options={{ label: "Bài giảng" }} list={LessonList} create={LessonCreate} edit={LessonEdit} />
      <Resource name="challenges" recordRepresentation="question" options={{ label: "Bài tập" }} list={ChallengeList} create={ChallengeCreate} edit={ChallengeEdit} />
      <Resource name="challengeOptions" recordRepresentation="text" options={{ label: "Đáp án bài tập" }} list={ChallengeOptionsList} create={ChallengeOptionCreate} edit={ChallengeOptionEdit} />
      <Resource name="challengeGames" recordRepresentation="title" options={{ label: "Mini Game" }} list={ChallengeGamesList} create={ChallengeGameCreate} edit={ChallengeGameEdit} />
      <Resource name="quiz" recordRepresentation="title" options={{ label: "Quiz" }} list={QuizList} create={QuizCreate} edit={QuizEdit}/>
    </Admin>
  );
};

export default App;
