import {
  HomeIcon,
  Table2Icon,
} from "lucide-react";

export const sidebarLinks = [
  {
    title: "Overview",
    url: "/",
    icon: <HomeIcon />,
    isActive: true,
  },
  {
    title: "Subjects",
    url: "/subjects",
    icon: <Table2Icon />,
    items: [
      {
        title: "Topics",
        url: "/subjects/topics",
      },
      {
        title: "Task",
        url: "/subjects/tasks",
      }
    ],
  },
];
