import {
    Create,
    NumberInput,
    ReferenceInput,
    SimpleForm,
    TextInput,
    required,
    ArrayInput,
    SimpleFormIterator,
  } from "react-admin";

  export const VocabularyItemCreate = () => {
    return (
      <Create>
        <SimpleForm>
          <ReferenceInput source="vocabularyId" reference="vocabularys" label="Vocabularys" />
          <ArrayInput source="vocabularies" label="Vocabulary Item">
            <SimpleFormIterator>
              <TextInput source="word" validate={[required()]} label="Word" />
              <TextInput
                source="meaning"
                validate={[required()]}
                label="Meaning"
              />
              <NumberInput source="order" validate={[required()]} label="Order" />
            </SimpleFormIterator>
          </ArrayInput>
        </SimpleForm>
      </Create>
    );
  };
