import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

interface TopicTabsProps {
  components: { title: ReactNode; content: ReactNode }[];
}

export function TopicTabs({ components }: TopicTabsProps) {
  return (
    <Tabs defaultValue="account" className="">
      <TabsList className="mx-auto max-w-3xl w-full bg-card mt-6">
        {components.map((component, index) => (
          <TabsTrigger key={index} value={index.toString()}>
            {component.title}
          </TabsTrigger>
        ))}
      </TabsList>
      <Separator className="my-4 mx-auto max-w-3xl w-full" />
      {components.map((component, index) => (
        <TabsContent key={index} value={index.toString()}>
          {component.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
