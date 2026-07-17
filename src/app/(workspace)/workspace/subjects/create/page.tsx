import { CreateSubjectForm } from "@/features/subject/components/create-form";
import { SubjectFrame } from "@/features/subject/components/subject-frame";

export default function CreateSubjectPage() {
  return (
    <div>
      <SubjectFrame>
        <CreateSubjectForm />
      </SubjectFrame>
    </div>
  );
}
