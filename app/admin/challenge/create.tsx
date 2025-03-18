// import {
//   Create,
//   NumberInput,
//   ReferenceInput,
//   SelectInput,
//   SimpleForm,
//   TextInput,
//   required,
// } from "react-admin";

// export const ChallengeCreate = () => {
//   return (
//     <Create>
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
//     </Create>
//   );
// };

// import {
//   Create,
//   NumberInput,
//   ReferenceInput,
//   SelectInput,
//   SimpleForm,
//   TextInput,
//   required,
// } from "react-admin";
// import { useState } from "react";

// export const ChallengeCreate = () => {
//   const [type, setType] = useState("");
//   return (
//     <Create>
//       <SimpleForm>
//         <TextInput source="question" validate={[required()]} label="Question" />
//         <SelectInput
//           source="type"
//           validate={[required()]}
//           choices={[
//             { id: "SELECT", name: "Chọn đáp án đúng" },
//             { id: "ASSIST", name: "Từ nào tương ứng" },
//             { id: "IMAGE", name: "Câu hỏi hình ảnh" },
//             { id: "AUDIO", name: "Câu hỏi âm thanh" },
//             { id: "FILL_IN_BLANK", name: "Điền vào chỗ trống" },
//           ]}
//           onChange={(e) => setType(e.target.value)}
//         />
//         {type === "IMAGE" && <TextInput source="imageUrl" label="Image URL" />}
//         {type === "AUDIO" && <TextInput source="audioUrl" label="Audio URL" />}
//         {type === "FILL_IN_BLANK" && (
//           <TextInput source="correctAnswer" label="Correct Answer" />
//         )}
//         <ReferenceInput source="lessonId" reference="lessons" />
//         <NumberInput source="order" validate={required()} label="Order" />
//       </SimpleForm>
//     </Create>
//   );
// };
import {
  Create,
  NumberInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
  required,
} from "react-admin";
import { useFormContext } from "react-hook-form";

export const ChallengeCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="question" validate={[required()]} label="Question" />
        <SelectInput
          source="type"
          validate={[required()]}
          choices={[
            { id: "SELECT", name: "Chọn đáp án đúng" },
            { id: "ASSIST", name: "Từ nào tương ứng" },
            { id: "IMAGE", name: "Câu hỏi hình ảnh" },
            { id: "AUDIO", name: "Câu hỏi âm thanh" },
            { id: "FILL_IN_BLANK", name: "Điền vào chỗ trống" },
          ]}
        />
        {/* Theo dõi giá trị type */}
        <ConditionalFields />
        <ReferenceInput source="lessonId" reference="lessons" />
        <NumberInput source="order" validate={required()} label="Order" />
      </SimpleForm>
    </Create>
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