import {
    Edit,
    NumberInput,
    ReferenceInput,
    SimpleForm,
    TextInput,
    required,
  } from "react-admin";

  export const VocabularyItemEdit = () => {


    return (
      <Edit>
        <SimpleForm>
          <NumberInput source="id" validate={[required()]} label="Id" />
          <TextInput source="word" validate={[required()]} label="Word" />
          <TextInput
            source="meaning"
            validate={[required()]}
            label="Meaning"
          />
          <ReferenceInput source="vocabularyId" reference="vocabularys" />
          <NumberInput source="order" validate={[required()]}  label="Order" />
        </SimpleForm>
      </Edit>
    );
  };