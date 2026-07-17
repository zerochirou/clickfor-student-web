"use client";

import React from "react";
import {
  DefaultReactSuggestionItem,
  SuggestionMenuProps,
} from "@blocknote/react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export const CustomSlashMenu = (
  props: SuggestionMenuProps<DefaultReactSuggestionItem>,
) => {
  // Fungsi untuk menutup menu secara paksa (programmatically)
  const handleCloseMenu = () => {
    // BlockNote mendengarkan tombol 'Escape' untuk dismiss menu
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  };

  return (
    <div className="z-50 flex w-[320px] flex-col gap-2 rounded-md border bg-popover p-2 text-popover-foreground shadow-md animate-in fade-in-80">
      {/* Header */}
      <div className="px-2 pt-1 pb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Slash Menu
        </span>
      </div>

      {/* Area Scroll untuk Daftar Menu */}
      <ScrollArea className="h-[300px] w-full">
        {/* pr-3 ditambahkan agar teks tidak tertimpa scrollbar */}
        <div className="flex flex-col gap-1 pr-3">
          {props.items.map((item, index) => {
            const isSelected = props.selectedIndex === index;

            return (
              <div
                key={item.title}
                onClick={() => props.onItemClick?.(item)}
                className={cn(
                  "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                  isSelected
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {/* Ikon Item */}
                <div className="mr-3 flex h-4 w-4 items-center justify-center">
                  {item.icon}
                </div>

                {/* Teks Item */}
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  {item.subtext && (
                    <span className="text-[10px] leading-snug text-muted-foreground">
                      {item.subtext}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Tombol Tutup Menu */}
      <div
        onClick={handleCloseMenu}
        className="mt-1 cursor-pointer rounded-sm bg-muted/50 px-2 py-2 text-center text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        Tutup Menu (Esc)
      </div>
    </div>
  );
};
