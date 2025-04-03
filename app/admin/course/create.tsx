import { Create, SimpleForm, TextInput } from "react-admin";
import { Box } from "@mui/material";

export const CourseCreate = () => (
  <Create>
    <SimpleForm>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextInput source="title" label="Tiêu đề khóa học" fullWidth />
        <TextInput source="description" label="Mô tả" multiline fullWidth />
        <TextInput source="imageSrc" label="Ảnh (URL)" fullWidth />
      </Box>
    </SimpleForm>
  </Create>
);
