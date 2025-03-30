import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    required,
    ArrayInput,
    SimpleFormIterator,
    useDataProvider
  } from "react-admin";
  import { useWatch } from "react-hook-form";
  import { useEffect, useState } from "react";
  export const QuizEdit = () => {
    const [orders, setOrders] = useState<number[]>([]);
  const dataProvider = useDataProvider();

  useEffect(() => {
    dataProvider
      .getList("quiz", {
        pagination: { page: 1, perPage: 100 },
        sort: { field: "order", order: "ASC" },
        filter: {}
      })
      .then(({ data }) => setOrders(data.map((q) => q.order)))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const validateOrder = (value: number) => {
    return orders.includes(value) ? "Order must be unique" : undefined;
  };

    return (
      <Edit>
        <SimpleForm>
          <TextInput source="question" label="QuestionQuestion" validate={required()} fullWidth />
          <SelectInput
            source="type"
            label="Type Question"
            choices={[
              { id: "SELECT", name: "Choose the correct answer" },
              { id: "TRUE_FALSE", name: "Choose right or wrong" },
              { id: "FILL_IN_BLANK", name: "Fill in the blanks" },
            ]}
            validate={required()}
          />
          <ConditionalFields />
          <ReferenceInput source="vocabularyId" reference="vocabularys">
            <SelectInput validate={required()} label="Vocabulary set" />
          </ReferenceInput>
          <NumberInput source="order" label="Order" validate={[required(), validateOrder]} />
        </SimpleForm>
      </Edit>
    );
  };
  const ConditionalFields = () => {
    const type = useWatch({ name: "type" });

    return (
      <>
        {type === "SELECT" && (
          <>
            <ArrayInput source="options" label="Add answer">
              <SimpleFormIterator>
                <TextInput source="option" label="Add answer" validate={required()} fullWidth />
              </SimpleFormIterator>
            </ArrayInput>
            <TextInput source="correctAnswer" label="Correct answer" validate={required()} fullWidth />
          </>
        )}

        {type === "TRUE_FALSE" && (
          <>
            {/* Nếu là câu đúng/sai */}
            <SelectInput
              source="correctAnswer"
              label="Correct answer"
              choices={[
                { id: "true", name: "True" },
                { id: "false", name: "False" },
              ]}
              validate={required()}
            />
          </>
        )}

        {type === "FILL_IN_BLANK" && (
          <>
            <TextInput source="correctAnswer" label="Correct answer" validate={required()} fullWidth />
          </>
        )}
        <TextInput source="explanation" label="Explain" fullWidth />
        <TextInput source="audioUrl" label="Link Audio" fullWidth />
        <TextInput source="imageUrl" label="Link ImageImage" fullWidth />
      </>
    );
  };
