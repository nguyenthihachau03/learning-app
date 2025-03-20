import {
  Edit,
  NumberInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
  required,
} from "react-admin";
import { useFormContext } from "react-hook-form";

export const ChallengeEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="question" validate={[required()]} label="Question" />
        <SelectInput
          source="type"
          validate={[required()]}
          choices={[
            { id: "SELECT", name: "SELECT" },
            { id: "ASSIST", name: "ASSIST" },
            { id: "AUDIO", name: "AUDIO" },
            { id: "FILL_IN_BLANK", name: "FILL_IN_BLANK" },
            { id: "GAME", name: "GAME" },
            { id: "VOICE", name: "VOICE" },
          ]}
        />

        <ConditionalFields />

        <ReferenceInput source="lessonId" reference="lessons" />
        <NumberInput source="order" validate={required()} label="Order" />
      </SimpleForm>
    </Edit>
  );
};

// Lấy `type` từ record khi có dữ liệu
const ConditionalFields = () => {
  const { watch, getValues } = useFormContext();
  const type = watch("type") || getValues("type"); // Lấy từ watch hoặc từ record

  return (
    <>
      {type === "AUDIO" && (
        <>
          <TextInput source="optionAudioSrc" label="Audio URL" />
        </>
      )}
      {(type === "FILL_IN_BLANK" || type === "VOICE") && (
        <>
          <TextInput source="correctAnswer" label="Correct Answer" />
        </>
      )}
    </>
  );
};
