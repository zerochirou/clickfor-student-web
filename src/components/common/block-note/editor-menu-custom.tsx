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
  const handleCloseMenu = () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  };

  return (
    // 1. Tambahkan overflow-hidden di container utama agar tidak ada yang bocor keluar dari border radius
    <div className="z-50 flex w-[320px] flex-col gap-2 rounded-md border bg-popover p-2 text-popover-foreground shadow-md animate-in fade-in-80 overflow-hidden">
      
      {/* Header */}
      <div className="px-2 pt-1 pb-1 shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Slash Menu
        </span>
      </div>

      {/* Area Scroll 
          2. Ubah h-[300px] menjadi max-h-[300px] agar menu bisa mengecil jika isinya sedikit 
      */}
      <ScrollArea className="max-h-[300px] w-full">
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
                {/* Ikon Item (tambahkan shrink-0 agar ikon tidak gepeng) */}
                <div className="mr-3 flex h-4 w-4 shrink-0 items-center justify-center">
                  {item.icon}
                </div>

                {/* Teks Item 
                    3. Tambahkan min-w-0 di sini dan truncate di span agar teks yang panjang dipotong dengan "..."
                */}
                <div className="flex flex-col min-w-0 w-full">
                  <span className="font-medium truncate">{item.title}</span>
                  {item.subtext && (
                    <span className="text-[10px] leading-snug text-muted-foreground truncate">
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
        className="mt-1 shrink-0 cursor-pointer rounded-sm bg-muted/50 px-2 py-2 text-center text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        Tutup Menu (Esc)
      </div>
    </div>
  );
};