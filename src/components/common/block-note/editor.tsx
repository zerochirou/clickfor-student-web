"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import {
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { Block, filterSuggestionItems } from "@blocknote/core";
import { en } from "@blocknote/core/locales";
import { CustomSlashMenu } from "./editor-menu-custom";

// --- Import Shadcn UI Components ---
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CircleCheck, GitMerge, HardDrive, HardDriveUpload, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EditorProps {
  onSave?: (data: Block[]) => Promise<void>;
  onFetchLatest?: () => Promise<string | null>; // API ambil data server
  initialContent?: string;
  documentId: string;
  isPending?: boolean;
}

export default function Editor({
  onSave,
  onFetchLatest,
  initialContent,
  documentId,
  isPending,
}: EditorProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [hasUnsavedUI, setHasUnsavedUI] = useState(false);

  // State Konflik
  const [conflictData, setConflictData] = useState<string | null>(null);

  const hasUnsavedChanges = useRef(false);
  const storageKey = `editor_draft_${documentId}`;

  // --- SOLUSI 1: Fungsi aman untuk mengambil data awal (Hindari Null) ---
  const getInitialData = () => {
    if (typeof window === "undefined") return undefined;
    
    try {
      const localDraft = localStorage.getItem(storageKey);
      if (localDraft && localDraft !== "null" && localDraft !== "[]") {
        return JSON.parse(localDraft);
      }
      if (initialContent && initialContent !== "null" && initialContent !== "[]") {
        return JSON.parse(initialContent);
      }
    } catch (e) {
      console.error("Gagal mem-parsing data awal", e);
    }
    
    // Kembalikan undefined agar BlockNote membuat array kosong standar dengan aman
    return undefined; 
  };

  const editor = useCreateBlockNote({
    dictionary: {
      ...en,
      placeholders: {
        ...en.placeholders,
        default: "Ketik '/' untuk menu, atau paste link",
      },
    },
    tables: {
      splitCells: true,
      cellBackgroundColor: true,
      cellTextColor: true,
      headers: true,
    },
    initialContent: getInitialData(), // Menggunakan fungsi yang aman
  });

  useEffect(() => {
    if (editor) editor.focus();
  }, [editor]);

  const { resolvedTheme } = useTheme();
  const currentTheme =
    resolvedTheme === "light" || resolvedTheme === "dark" ? resolvedTheme : "dark";

  // --- SOLUSI 2: Pengecekan Perbedaan Cerdas (Abaikan Null vs Paragraf Kosong) ---
  const checkServerDifference = async () => {
    if (!onFetchLatest) return false;
    try {
      const rawLatest = await onFetchLatest();
      
      // Fungsi untuk menormalisasi data dari server (amankan null / string kosong)
      const parseServerData = (data: null | string) => {
        if (!data || data === "null" || data === "") return [];
        if (typeof data === "string") {
          try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return Array.isArray(data) ? data : [];
      };

      const serverBlocks = parseServerData(rawLatest);
      const localBlocks = editor.document;

      // CEK CERDAS: Jika dokumen baru (server kosong) dan editor lokal juga cuma berisi 1 paragraf kosong bawaan Blocknote
      const isServerEmpty = serverBlocks.length === 0;
      const isLocalEmpty = 
        localBlocks.length === 0 || 
        (localBlocks.length === 1 && localBlocks[0].type === "paragraph" && (!localBlocks[0].content || (Array.isArray(localBlocks[0].content) && localBlocks[0].content.length === 0)));

      if (isServerEmpty && isLocalEmpty) {
        return false; // Sama-sama kosong, berarti tidak ada konflik.
      }

      // Jika sama-sama ada isinya, bandingkan stringnya
      const normServer = JSON.stringify(serverBlocks);
      const normLocal = JSON.stringify(localBlocks);

      if (normServer !== normLocal) {
        // Simpan dalam format string array agar bisa di-replace nanti
        setConflictData(JSON.stringify(serverBlocks)); 
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Gagal mengecek server:", error);
      return false;
    }
  };

  // --- Background Routine ---
  useEffect(() => {
    const performRoutine = async () => {
      if (!navigator.onLine || conflictData) return;

      const hasDiff = await checkServerDifference();

      if (!hasDiff && hasUnsavedChanges.current) {
        setIsSyncing(true);
        try {
          if (onSave) {
            await onSave(editor.document);
          }
          hasUnsavedChanges.current = false;
          setHasUnsavedUI(false);
          setLastSynced(new Date());
        } catch (error) {
          console.error("Gagal auto-save:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    const syncInterval = setInterval(performRoutine, 5000);

    const handleBeforeUnload = () => {
      if (hasUnsavedChanges.current && !conflictData && onSave) {
        onSave(editor.document);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [conflictData]); 

  // --- Handler Dialog ---
  const handleUseServerVersion = () => {
    if (!conflictData) return;
    try {
      const parsedServerData = JSON.parse(conflictData);
      // Jika dari server kosong array [], Blocknote butuh undefined untuk mereset
      if (parsedServerData.length === 0) {
         editor.replaceBlocks(editor.document, [{ type: "paragraph", content: [] }]);
      } else {
         editor.replaceBlocks(editor.document, parsedServerData);
      }

      localStorage.setItem(storageKey, conflictData);
      hasUnsavedChanges.current = false;
      setHasUnsavedUI(false);
      setConflictData(null);
    } catch (error) {
      console.error("Gagal parse data server", error);
    }
  };

  const handleForceOverwrite = async () => {
    if (!conflictData) return;
    setIsSyncing(true);
    try {
      if (onSave) {
        await onSave(editor.document);
      }
      localStorage.setItem(storageKey, JSON.stringify(editor.document));
      hasUnsavedChanges.current = false;
      setHasUnsavedUI(false);
      setLastSynced(new Date());
      setConflictData(null);
    } catch (error) {
      console.error("Gagal memaksa simpan ke server", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between text-xs text-muted-foreground font-medium mx-auto max-w-3xl mb-4">
        
        <AlertDialog>
          {conflictData && (
            <AlertDialogTrigger
              render={
                <Button
                  variant={conflictData ? "destructive" : "outline"}
                  disabled={!conflictData}
                  size="sm"
                  className={conflictData ? "animate-pulse" : "opacity-50"}
                >
                  <GitMerge />
                  resolve the conflict
                </Button>
              }
            />
          )}

          <AlertDialogContent className={"w-auto"}>
            <AlertDialogHeader>
              <AlertDialogTitle>Perbedaan Data Ditemukan</AlertDialogTitle>
              <AlertDialogDescription>
                Data yang ada di layar Anda saat ini <b>berbeda</b> dengan data
                terbaru di server (kemungkinan telah diedit di perangkat lain).
                <br />
                <br />
                Silakan pilih versi mana yang ingin dipertahankan. Tindakan ini
                tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={handleUseServerVersion}
                variant={"default"}
              >
                <HardDrive /> Use Server Version
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleForceOverwrite}
                variant={"outline"}
              >
                <HardDriveUpload /> Force Save My Version
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex items-center">
          {conflictData ? (
            <Badge variant={'destructive'} className="animate-pulse flex items-center gap-1 text-destructive">
              <Spinner /> Waiting for the decision 
            </Badge>
          ) : isPending || isSyncing ? (
            <Badge className="animate-pulse flex items-center gap-1">
              <Spinner /> Synchronizing
            </Badge>
          ) : hasUnsavedUI ? (
            <Badge variant={"secondary"} className="animate-pulse">
              <Pencil className="w-3 h-3 mr-1" /> There are local changes
            </Badge>
          ) : lastSynced ? (
            <Badge variant={"secondary"}>
              <HardDriveUpload className="w-3 h-3 mr-1" />
              Saved on {format(lastSynced, "HH:mm")}
            </Badge>
          ) : (
            <Badge variant={"outline"}><CircleCheck className="w-3 h-3 mr-1" /> There has been no change</Badge>
          )}
        </div>
      </div>

      <BlockNoteView
        theme={currentTheme}
        slashMenu={false}
        editor={editor}
        onChange={() => {
          if (conflictData) return; 

          const currentData = editor.document;
          localStorage.setItem(storageKey, JSON.stringify(currentData));
          hasUnsavedChanges.current = true;

          if (!hasUnsavedUI) {
            setHasUnsavedUI(true);
          }
        }}
      >
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query) =>
            filterSuggestionItems(getDefaultReactSlashMenuItems(editor), query)
          }
          suggestionMenuComponent={CustomSlashMenu}
        />
      </BlockNoteView>
    </div>
  );
}