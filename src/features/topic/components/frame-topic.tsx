import { Card, CardContent } from "@/components/ui/card";

export function FrameTopic({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl w-full">
      <Card>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
