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
  onFetchLatest?: () => Promise<string | null>;
  initialContent?: string;
  documentId: string;
  isPending?: boolean;
}

// Fungsi helper yang ditaruh di luar agar rapi
const parseDataSafe = (data: string | null) => {
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

  const [conflictData, setConflictData] = useState<string | null>(null);

  const hasUnsavedChanges = useRef(false);
  const storageKey = `editor_draft_${documentId}`;

  // KUNCI PERBAIKAN: Ingatan terakhir tentang isi server
  // Saat pertama kali load, ingatan kita adalah "initialContent"
  const lastKnownServerRef = useRef<string>(JSON.stringify(parseDataSafe(String(initialContent))));

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
    initialContent: getInitialData(),
  });

  useEffect(() => {
    if (editor) editor.focus();
  }, [editor]);

  const { resolvedTheme } = useTheme();
  const currentTheme =
    resolvedTheme === "light" || resolvedTheme === "dark" ? resolvedTheme : "dark";

  // --- LOGIKA PENGECEKAN BARU YANG BENAR ---
  const checkServerDifference = async () => {
    if (!onFetchLatest) return false;
    
    try {
      const rawLatest = await onFetchLatest();
      const serverBlocks = parseDataSafe(rawLatest);
      const currentServerString = JSON.stringify(serverBlocks);

      // KITA BANDINGKAN SERVER SAAT INI DENGAN SERVER TERAKHIR YANG KITA TAHU
      // Jika sama (meskipun dua-duanya null/kosong), berarti tidak ada orang lain yang ubah!
      if (currentServerString === lastKnownServerRef.current) {
        return false;
      }

      // Jika kodenya sampai sini, berarti currentServerString BEDA dengan lastKnownServerRef
      // Artinya ada perangkat lain / orang lain yang sudah menimpa server
      setConflictData(currentServerString); 
      return true;

    } catch (error) {
      console.error("Gagal mengecek server:", error);
      return false; // Anggap aman jika gagal fetch
    }
  };

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
          
          // SETELAH BERHASIL SAVE: Update "ingatan" server kita dengan data yang baru disave
          lastKnownServerRef.current = JSON.stringify(editor.document);
          
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
      if (parsedServerData.length === 0) {
         editor.replaceBlocks(editor.document, [{ type: "paragraph", content: [] }]);
      } else {
         editor.replaceBlocks(editor.document, parsedServerData);
      }

      // Update ingatan kita dengan data server
      lastKnownServerRef.current = conflictData;
      
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
      
      const currentDocString = JSON.stringify(editor.document);
      
      // Update ingatan kita dengan data yang baru saja kita paksa save
      lastKnownServerRef.current = currentDocString;
      
      localStorage.setItem(storageKey, currentDocString);
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

          <AlertDialogContent>
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