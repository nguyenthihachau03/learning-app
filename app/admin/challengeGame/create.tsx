import {
    BooleanInput,
    Create,
    ReferenceInput,
    SimpleForm,
    TextInput,
    required,
  } from "react-admin";

  export const ChallengeGameCreate = () => {
    return (
      <Create>
        <SimpleForm>
          <TextInput source="answer1" validate={[required()]} label="Text" />
          <TextInput source="answer2" validate={[required()]} label="Text" />
          <BooleanInput source="correct" label="Correct option" />
          <ReferenceInput source="challengeId" reference="challenges" />
          <TextInput source="imageSrc" label="Image URL" />
          <TextInput source="audioSrc" label="Audio URL" />
        </SimpleForm>
      </Create>
    );
  };