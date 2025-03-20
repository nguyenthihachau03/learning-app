import {
  BooleanInput,
  Create,
  ReferenceInput,
  SimpleForm,
  TextInput,
  required,
} from "react-admin";

export const ChallengeOptionCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="text" validate={[required()]} label="Option Text" />
        <BooleanInput source="correct" label="Correct Option" />
        <ReferenceInput source="challengeId" reference="challenges" validate={[required()]} />
        <TextInput source="imageSrc" label="Image URL (if SELECT)" />
        <TextInput source="audioSrc" label="Audio URL (if AUDIO)" />
      </SimpleForm>
    </Create>
  );
};
