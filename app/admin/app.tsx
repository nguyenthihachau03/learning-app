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

const dataProvider = simpleRestProvider("/api");

const App = () => {
  return (
    <Admin dataProvider={dataProvider} dashboard={Dashboard}>
      <Resource name="courses" recordRepresentation="title" list={CourseList} create={CourseCreate} edit={CourseEdit} />
      <Resource name="units" recordRepresentation="title" list={UnitList} create={UnitCreate} edit={UnitEdit} />
      <Resource name="vocabularys" recordRepresentation="title" list={VocabularyList} create={VocabularyCreate} edit={VocabularyEdit} options={{ label: "Vocabularies" }}/>
      <Resource name="vocabularyItems" recordRepresentation="title" list={VocabularyItemList} create={VocabularyItemCreate} edit={VocabularyItemEdit}/>
      <Resource name="lessons" recordRepresentation="title" list={LessonList} create={LessonCreate} edit={LessonEdit} />
      <Resource name="challenges" recordRepresentation="question" list={ChallengeList} create={ChallengeCreate} edit={ChallengeEdit} />
      <Resource name="challengeOptions" recordRepresentation="text" list={ChallengeOptionsList} create={ChallengeOptionCreate} edit={ChallengeOptionEdit} options={{ label: "Challenge Options" }} />
      <Resource name="challengeGames" recordRepresentation="title" list={ChallengeGamesList} create={ChallengeGameCreate} edit={ChallengeGameEdit} options={{ label: "Challenge Games" }}/>
      <Resource name="quiz" recordRepresentation="title" list={QuizList} create={QuizCreate} edit={QuizEdit}/>
    </Admin>
  );
};

export default App;