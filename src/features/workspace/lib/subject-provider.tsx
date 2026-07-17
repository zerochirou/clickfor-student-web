"use client";

import { Subject } from "@/types/subject";
import { createContext, useContext, useState, ReactNode } from "react";

interface SubjectContextType {
  subject: Subject;
  setSubject: React.Dispatch<React.SetStateAction<Subject>>;
}

// 1. Inisialisasi Context
const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

// 2. Buat Provider Component
export function SubjectProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: Subject;
}) {
  // Gunakan initialData dari Server Component sebagai state awal
  const [subject, setSubject] = useState<Subject>(initialData);

  return (
    <SubjectContext.Provider value={{ subject, setSubject }}>
      {children}
    </SubjectContext.Provider>
  );
}

// 3. Buat Custom Hook untuk kemudahan konsumsi data
export function useSubject() {
  const context = useContext(SubjectContext);

  if (context === undefined) {
    throw new Error("useSubject harus digunakan di dalam SubjectProvider");
  }

  return context;
}
