"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import {
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  filterSuggestionItems,
} from "@blocknote/core";
import { en } from "@blocknote/core/locales";

import { useTheme } from "next-themes";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { format } from "date-fns";

import { Spinner } from "@/components/ui/spinner";
import { Topic } from "@/types/topic";

import { CustomSlashMenu } from "./editor-menu-custom";
import { TopicCardBlock } from "./topic-card-block";

/**
 * Daftarkan seluruh default block dan custom topicCard.
 *
 * createReactBlockSpec mengembalikan factory, sehingga umumnya
 * harus dipanggil dengan TopicCardBlock().
 */
const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    topicCard: TopicCardBlock(),
  },
});

/**
 * Gunakan tipe Block berdasarkan custom schema.
 * Jangan memakai Block bawaan dari @blocknote/core karena tidak
 * mengetahui keberadaan block "topicCard".
 */
type EditorBlock = typeof schema.Block;


interface EditorProps {
  onSave?: (data: EditorBlock[]) => Promise<void>;
  initialContent?: string;
  documentId: string;
  isPending?: boolean;
  topics: Topic[];
}

/**
 * Membaca data lokal atau initialContent secara aman.
 *
 * JSON.parse tidak boleh dipanggil langsung tanpa try-catch karena
 * draft yang rusak akan membuat seluruh editor gagal dirender.
 */
function getInitialContent(
  storageKey: string,
  initialContent?: string,
): EditorBlock[] | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const storedContent = window.localStorage.getItem(storageKey);
  const rawContent = storedContent || initialContent;

  if (!rawContent) {
    return undefined;
  }

  try {
    const parsedContent: unknown = JSON.parse(rawContent);

    if (!Array.isArray(parsedContent) || parsedContent.length === 0) {
      return undefined;
    }

    return parsedContent as EditorBlock[];
  } catch (error) {
    console.error("Initial content editor tidak valid:", error);

    // Hapus draft lokal yang rusak agar editor dapat dibuka kembali.
    window.localStorage.removeItem(storageKey);

    return undefined;
  }
}

export default function Editor({
  onSave,
  initialContent,
  documentId,
  topics,
  isPending = false,
}: EditorProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [hasUnsavedUI, setHasUnsavedUI] = useState(false);

  const hasUnsavedChanges = useRef(false);
  const storageKey = `editor_draft_${documentId}`;

  const editor = useCreateBlockNote(
    {
      schema,

      dictionary: {
        ...en,
        placeholders: {
          ...en.placeholders,
          default: "Ketik '/' untuk menu, atau '@' untuk topik",
        },
      },

      tables: {
        splitCells: true,
        cellBackgroundColor: true,
        cellTextColor: true,
        headers: true,
      },

      initialContent: getInitialContent(storageKey, initialContent),
    },

    /**
     * Buat ulang editor hanya ketika dokumen berubah.
     */
    [documentId],
  );

  const { resolvedTheme } = useTheme();

  const currentTheme: "light" | "dark" =
    resolvedTheme === "light" ? "light" : "dark";

  useEffect(() => {
    editor.focus();
  }, [editor]);

  const syncToServer = useCallback(async () => {
    if (!hasUnsavedChanges.current || isSyncing) {
      return;
    }

    if (!navigator.onLine) {
      return;
    }

    setIsSyncing(true);

    try {
      const dataToSave = editor.document;

      if (!onSave) {
        console.warn("Handler onSave belum diberikan.");
        return;
      }

      await onSave(dataToSave);

      hasUnsavedChanges.current = false;
      setHasUnsavedUI(false);
      setLastSynced(new Date());

      /**
       * Server sudah berhasil menerima data.
       * Draft lokal tetap dapat disimpan sebagai cache.
       *
       * Apabila ingin menghapusnya setelah sync:
       * localStorage.removeItem(storageKey);
       */
    } catch (error) {
      console.error(
        "Gagal menyinkronkan data ke server. Draft tetap tersimpan secara lokal.",
        error,
      );
    } finally {
      setIsSyncing(false);
    }
  }, [editor, isSyncing, onSave]);

  useEffect(() => {
    const syncInterval = window.setInterval(() => {
      void syncToServer();
    }, 10_000);

    /**
     * Ketika koneksi kembali tersedia, langsung coba sync.
     */
    const handleOnline = () => {
      void syncToServer();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.clearInterval(syncInterval);
      window.removeEventListener("online", handleOnline);
    };
  }, [syncToServer]);

  const handleEditorChange = useCallback(() => {
    try {
      const currentData = editor.document;

      window.localStorage.setItem(
        storageKey,
        JSON.stringify(currentData),
      );

      hasUnsavedChanges.current = true;
      setHasUnsavedUI(true);
    } catch (error) {
      console.error("Gagal menyimpan draft editor ke localStorage:", error);
    }
  }, [editor, storageKey]);

  const getTopicMenuItems = useCallback(
    async (query: string) => {
      const normalizedQuery = query.trim().toLowerCase();

      return topics
        .filter((topic) =>
          topic.name.toLowerCase().includes(normalizedQuery),
        )
        .map((topic) => ({
          title: topic.name,
          subtext: topic.description || "Tidak ada deskripsi",
          group: "Topik",

          onItemClick: () => {
            const cursorPosition = editor.getTextCursorPosition();
            const currentBlock = cursorPosition.block;

            /**
             * Jalankan update dan insert sebagai satu transaksi.
             * Hasil undo juga menjadi lebih konsisten.
             */
            editor.transact(() => {
              editor.updateBlock(currentBlock, {
                type: "topicCard",
                props: {
                  topicId: topic.id,
                  topicName: topic.name,
                  topicDesc: topic.description || "",
                },
              });

              editor.insertBlocks(
                [
                  {
                    type: "paragraph",
                    content: "",
                  },
                ],
                currentBlock,
                "after",
              );
            });

            editor.focus();
          },
        }));
    },
    [editor],
  );

  return (
    <>
      <div className="mx-auto mb-2 flex max-w-3xl justify-end text-xs font-medium text-muted-foreground">
        {isPending || isSyncing ? (
          <span className="flex animate-pulse items-center gap-1">
            Synchronizing
            <Spinner />
          </span>
        ) : hasUnsavedUI ? (
          <span className="animate-pulse">
            Ada perubahan lokal
          </span>
        ) : lastSynced ? (
          <span>
            Saved on {format(lastSynced, "HH:mm")}
          </span>
        ) : (
          <span>Belum ada perubahan</span>
        )}
      </div>

      <BlockNoteView
        editor={editor}
        theme={currentTheme}
        slashMenu={false}
        onChange={handleEditorChange}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) =>
            filterSuggestionItems(
              getDefaultReactSlashMenuItems(editor),
              query,
            )
          }
          suggestionMenuComponent={CustomSlashMenu}
        />

        <SuggestionMenuController
          triggerCharacter="@"
          getItems={getTopicMenuItems}
        />
      </BlockNoteView>
    </>
  );
}