import {
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    required,
    ArrayInput,
    SimpleFormIterator,
  } from "react-admin";
  import { useWatch } from "react-hook-form";

  export const QuizCreate = () => {
    return (
      <Create>
        <SimpleForm>
          <TextInput source="question" label="Câu hỏi" validate={required()} fullWidth />
          <SelectInput
            source="type"
            label="Loại câu hỏi"
            choices={[
              { id: "SELECT", name: "Chọn đáp án đúng" },
              { id: "TRUE_FALSE", name: "Chọn đúng sai" },
              { id: "FILL_IN_BLANK", name: "Điền vào chỗ trống" },
            ]}
            validate={required()}
          />
          <ConditionalFields />
          <ReferenceInput source="vocabularyId" reference="vocabularys">
            <SelectInput validate={required()} label="Bộ từ vựng" />
          </ReferenceInput>

          <NumberInput source="order" label="Thứ tự" validate={required()} />
        </SimpleForm>
      </Create>
    );
  };
  const ConditionalFields = () => {
    const type = useWatch({ name: "type" });

    return (
      <>
        {type === "SELECT" && (
          <>
            <ArrayInput source="options" label="Thêm đáp án">
              <SimpleFormIterator>
                <TextInput source="option" label="Thêm đáp án" validate={required()} fullWidth />
              </SimpleFormIterator>
            </ArrayInput>
            <TextInput source="correctAnswer" label="Đáp án đúng" validate={required()} fullWidth />
          </>
        )}

        {type === "TRUE_FALSE" && (
          <>
            {/* Nếu là câu đúng/sai */}
            <SelectInput
              source="correctAnswer"
              label="Đáp án đúng"
              choices={[
                { id: "true", name: "Đúng" },
                { id: "false", name: "Sai" },
              ]}
              validate={required()}
            />
          </>
        )}

        {type === "FILL_IN_BLANK" && (
          <>
            <TextInput source="correctAnswer" label="Đáp án đúng" validate={required()} fullWidth />
          </>
        )}
        <TextInput source="explanation" label="Giải thích" fullWidth />
        <TextInput source="audioUrl" label="Link Audio" fullWidth />
        <TextInput source="imageUrl" label="Link Hình ảnh" fullWidth />
      </>
    );
  };