import {
    Datagrid,
    List,
    NumberField,
    ReferenceField,
    TextField,
  } from "react-admin";

  export const VocabularyList = () => {
    return (
      <List resource="vocabularys" sort={{ field: "order", order: "ASC" }}>
        <Datagrid rowClick="edit">
          <NumberField source="id" />
          <TextField source="title" />
          <TextField source="description" />
          <ReferenceField source="courseId" reference="courses" />
          <TextField source="order" />
        </Datagrid>
      </List>
    );
  };