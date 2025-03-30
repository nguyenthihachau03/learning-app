import {
  Edit,
  NumberInput,
  ReferenceInput,
  SimpleForm,
  TextInput,
  required,
} from "react-admin";
import { useEffect, useState } from "react";
import { useDataProvider } from "react-admin";

export const VocabularyEdit = () => {
  const [orders, setOrders] = useState<number[]>([]);
  const dataProvider = useDataProvider();

  useEffect(() => {
    dataProvider
      .getList("vocabularys", {
        pagination: { page: 1, perPage: 100 },
        sort: { field: "order", order: "ASC" },
        filter: {},
      })
      .then(({ data }) => setOrders(data.map((v) => v.order)))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);
  

  const validateOrder = (value: number) => {
    return orders.includes(value) ? "Order must be unique" : undefined;
  };

  return (
    <Edit>
      <SimpleForm>
        <NumberInput source="id" validate={[required()]} label="Id" />
        <TextInput source="title" validate={[required()]} label="Title" />
        <TextInput
          source="description"
          validate={[required()]}
          label="Description"
        />
        <ReferenceInput source="courseId" reference="courses" />
        <NumberInput source="order" validate={[required(), validateOrder]}  label="Order" />
      </SimpleForm>
    </Edit>
  );
};