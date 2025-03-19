import {
    BooleanField,
    Datagrid,
    List,
    NumberField,
    ReferenceField,
    TextField,
  } from "react-admin";

  export const ChallengeGamesList = () => {
    return (
      <List>
        <Datagrid rowClick="edit">
          <NumberField source="id" />
          <TextField source="answer1" />
          <TextField source="answer2" />
          <BooleanField source="correct" />
          <ReferenceField source="challengeId" reference="challenges" />
          <TextField source="imageSrc" />
          <TextField source="audioSrc" />
        </Datagrid>
      </List>
    );
  };