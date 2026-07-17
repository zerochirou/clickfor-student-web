import { Card, CardContent } from "@/components/ui/card";
import { CreateSubjectForm } from "@/features/subject/components/create-form";
import { SubjectFrame } from "@/features/subject/components/subject-frame";

export default function CreateSubjectPage() {
  return (
    <div>
      <SubjectFrame>
        <div className="w-full mx-auto max-w-2xl">
          <Card>
            <CardContent>
              <CreateSubjectForm />
            </CardContent>
          </Card>
        </div>
      </SubjectFrame>
    </div>
  );
}
