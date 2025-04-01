import {
    Datagrid,
    List,
    NumberField,
    ReferenceField,
    TextField,
  } from "react-admin";

  export const VocabularyItemList = () => {
    return (
      <List>
        <Datagrid rowClick="edit">
          <NumberField source="id" />
          <TextField source="word" />
          <TextField source="meaning" />
          <ReferenceField source="vocabularyId" reference="vocabularys" />
          <TextField source="order" />
        </Datagrid>
      </List>
    );
  };