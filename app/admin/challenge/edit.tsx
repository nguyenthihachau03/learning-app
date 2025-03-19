// import {
//   Edit,
//   NumberInput,
//   ReferenceInput,
//   SelectInput,
//   SimpleForm,
//   TextInput,
//   required,
// } from "react-admin";

// export const ChallengeEdit = () => {
//   return (
//     <Edit>
//       <SimpleForm>
//         <TextInput source="question" validate={[required()]} label="Question" />
//         <SelectInput
//           source="type"
//           validate={[required()]}
//           choices={[
//             {
//               id: "SELECT",
//               name: "SELECT",
//             },
//             {
//               id: "ASSIST",
//               name: "ASSIST",
//             },
//           ]}
//         />
//         <ReferenceInput source="lessonId" reference="lessons" />
//         <NumberInput source="order" validate={required()} label="Order" />
//       </SimpleForm>
//     </Edit>
//   );
// };

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
          ]}
        />
        {/* Theo dõi giá trị type */}
        <ConditionalFields />
        <ReferenceInput source="lessonId" reference="lessons" />
        <NumberInput source="order" validate={required()} label="Order" />
      </SimpleForm>
    </Edit>
  );
};

// Component hiển thị input theo loại câu hỏi
const ConditionalFields = () => {
  const { watch } = useFormContext();
  const type = watch("type"); // Theo dõi giá trị của type

  return (
    <>
      {type === "IMAGE" && <TextInput source="imageUrl" label="Image URL" />}
      {type === "AUDIO" && <TextInput source="audioUrl" label="Audio URL" />}
      {type === "FILL_IN_BLANK" && (
        <TextInput source="correctAnswer" label="Correct Answer" />
      )}
    </>
  );
};
