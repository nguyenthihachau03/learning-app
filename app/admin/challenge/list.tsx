// import {
//   Datagrid,
//   List,
//   NumberField,
//   ReferenceField,
//   SelectField,
//   TextField,
// } from "react-admin";

// export const ChallengeList = () => {
//   return (
//     <List>
//       <Datagrid rowClick="edit">
//         <NumberField source="id" />
//         <TextField source="question" />
//         <SelectField
//           source="type"
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
//         <ReferenceField source="lessonId" reference="lessons" />
//         <NumberField source="order" />
//       </Datagrid>
//     </List>
//   );
// };

import {
  Datagrid,
  List,
  NumberField,
  ReferenceField,
  SelectField,
  TextField,
} from "react-admin";

export const ChallengeList = () => {

  return (
    <List
      resource="challenges"
      sort={{ field: "order", order: "ASC" }}
      pagination={false}
    >
      <Datagrid rowClick="edit">
        <NumberField source="id" />
        <TextField source="question" />
        <SelectField
          source="type"
          choices={[
            { id: "SELECT", name: "SELECT" },
            { id: "ASSIST", name: "ASSIST" },
            { id: "GAME", name: "GAME" },
            { id: "AUDIO", name: "AUDIO" },
            { id: "VOICE", name: "VOICE" },
            { id: "FILL_IN_BLANK", name: "FILL_IN_BLANK" },
          ]
        }
          optionValue="id"
         optionText="name"
        />
        <ReferenceField source="lessonId" reference="lessons" />
        <NumberField source="order" />
      </Datagrid>
    </List>
  );
};