import { Card, CardContent } from "@/components/ui/card";

export function FrameTask({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
