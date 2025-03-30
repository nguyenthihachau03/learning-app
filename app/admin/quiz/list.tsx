import {
    Datagrid,
    List,
    NumberField,
    ReferenceField,
    TextField,
    ChipField,
  } from "react-admin";

  export const QuizList = () => {
    return (
        <List>
            <Datagrid rowClick="edit">
                <NumberField source="id" label="ID" />
                <TextField source="question" label="Question" />
                <ChipField source="type" label="TypeType" />
                <ReferenceField source="vocabularyId" reference="vocabularys" label="Vocabulary set" />
                <TextField source="correctAnswer" label="Correct answer" />
                <NumberField source="order" label="OrderOrder" />
            </Datagrid>
        </List>
    );
  };
