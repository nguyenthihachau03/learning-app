import {
  BooleanInput,
  Create,
  NumberInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
  required,
  useNotify,
} from "react-admin";
import { useDataProvider } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";

export const ChallengeCreate = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const handleSubmit = async (data: any) => {
    try {
      // Tạo challenge
      const challenge = await dataProvider.create("challenges", { data });

      if (challenge?.data?.id) {
        const challengeId = challenge.data.id;

        // Tạo ChallengeOptions cho các loại phù hợp
        if (["ASSIST", "SELECT", "AUDIO"].includes(data.type)) {
          const defaultOptions = [
            {
              challengeId,
              text: data.option1Text,
              correct: data.option1Correct,
              imageSrc: data.type === "SELECT" ? data.option1Image : null,
              audioSrc: data.type === "AUDIO" ? data.option1Audio : null,
            },
            {
              challengeId,
              text: data.option2Text,
              correct: data.option2Correct,
              imageSrc: data.type === "SELECT" ? data.option2Image : null,
              audioSrc: data.type === "AUDIO" ? data.option2Audio : null,
            },
            {
              challengeId,
              text: data.option3Text,
              correct: data.option3Correct,
              imageSrc: data.type === "SELECT" ? data.option3Image : null,
              audioSrc: data.type === "AUDIO" ? data.option3Audio : null,
            },
            {
              challengeId,
              text: data.option4Text,
              correct: data.option4Correct,
              imageSrc: data.type === "SELECT" ? data.option4Image : null,
              audioSrc: data.type === "AUDIO" ? data.option4Audio : null,
            },
          ];

          // Gửi API để tạo challenge options
          await Promise.all(
            defaultOptions.map((option) =>
              dataProvider.create("challengeOptions", { data: option })
            )
          );
        }

        // Xử lý FILL_IN_BLANK & VOICE
        if (["FILL_IN_BLANK", "VOICE"].includes(data.type)) {
          await dataProvider.create("challengeOptions", {
            data: {
              challengeId,
              text: data.correctAnswer,
              correct: true,
            },
          });
        }

        // Xử lý GAME (tạo số lượng cặp từ dựa trên `numberOfPairs`)
        if (data.type === "GAME" && data.numberOfPairs > 0) {
          const gamePairs = [];
          for (let i = 1; i <= data.numberOfPairs; i++) {
            gamePairs.push({
              challengeId,
              answer1: data[`answer${i}A`],  // Cặp từ 1
              answer2: data[`answer${i}B`],  // Cặp từ 2
              correct: true, // Mặc định tất cả là `true`
            });
          }

          await Promise.all(
            gamePairs.map((pair) =>
              dataProvider.create("challengeGames", { data: pair })
            )
          );
        }

        notify("Challenge and options created successfully!", { type: "success" });
      } else {
        notify("Error creating challenge.", { type: "error" });
      }
    } catch (error) {
      console.error("Error creating challenge:", error);
      notify("Failed to create challenge.", { type: "error" });
    }
  };

  return (
    <Create>
      <SimpleForm onSubmit={handleSubmit}>
        <TextInput source="question" validate={[required()]} label="Question" />
        <SelectInput
          source="type"
          validate={[required()]}
          choices={[
            { id: "SELECT", name: "SELECT" },
            { id: "ASSIST", name: "ASSIST" },
            { id: "AUDIO", name: "AUDIO" },
            { id: "FILL_IN_BLANK", name: "FILL_IN_BLANK" },
            { id: "GAME", name: "GAME" },
            { id: "VOICE", name: "VOICE" },
          ]}
          optionValue="id"
          optionText="name"
        />
        <ReferenceInput source="lessonId" reference="lessons" />
        <NumberInput source="order" validate={required()} label="Order" />

        {/* Hiển thị các trường nhập cho Challenge Options hoặc Game */}
        <ConditionalChallengeFields />
      </SimpleForm>
    </Create>
  );
};

// Component nhập thông tin theo loại Challenge
const ConditionalChallengeFields = () => {
  const { watch } = useFormContext();
  const type = watch("type");
  const numberOfPairs = watch("numberOfPairs") || 0; // Lấy số lượng cặp, mặc định là 0

  if (["ASSIST", "SELECT", "AUDIO"].includes(type)) {
    return (
      <>
        <h3>Challenge Options</h3>
        {[1, 2, 3, 4].map((num) => (
          <div key={num}>
            <TextInput source={`option${num}Text`} label={`Option ${num} Text`} validate={[required()]} />
            {type === "SELECT" && <TextInput source={`option${num}Image`} label="Image URL" />}
            {type === "AUDIO" && <TextInput source={`option${num}Audio`} label="Audio URL" />}
            <BooleanInput source={`option${num}Correct`} label="Correct Option" />
          </div>
        ))}
      </>
    );
  }

  if (["FILL_IN_BLANK", "VOICE"].includes(type)) {
    return <TextInput source="correctAnswer" label="Correct Answer" validate={[required()]} />;
  }

  if (type === "GAME") {
    return (
      <>
        <NumberInput source="numberOfPairs" label="Number of Pairs" validate={[required()]} />
        {numberOfPairs > 0 && (
          <>
            <h3>Answer Pairs</h3>
            {[...Array(numberOfPairs)].map((_, index) => (
              <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                <TextInput source={`answer${index + 1}A`} label={`Pair ${index + 1} - Answer 1`} validate={[required()]} />
                <TextInput source={`answer${index + 1}B`} label={`Pair ${index + 1} - Answer 2`} validate={[required()]} />
              </div>
            ))}
          </>
        )}
      </>
    );
  }

  return null;
};
