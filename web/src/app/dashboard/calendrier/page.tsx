"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalendarView from "@/components/calendar/CalendarView";
import Dialog from "@/components/ui/dialog";
import PostComposer from "@/components/composer/PostComposer";
import StoryComposer from "@/components/composer/StoryComposer";

export default function CalendrierPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [storyComposerOpen, setStoryComposerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#37352f]">Calendrier</h1>
          <p className="text-sm text-[#73726e] mt-1">
            Visualisez et gérez vos publications programmées.
          </p>
        </div>
        <div className="relative" ref={menuRef}>
          <Button
            onClick={() => setMenuOpen(!menuOpen)}
            className="h-8 text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Créer
          </Button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg border border-[#e8e5e0] shadow-lg z-50 py-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setComposerOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#37352f] hover:bg-[#f7f6f3] transition-colors"
              >
                <FileText className="h-4 w-4 text-[#9b9a97]" />
                Publication
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setStoryComposerOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#37352f] hover:bg-[#f7f6f3] transition-colors"
              >
                <Image className="h-4 w-4 text-[#9b9a97]" />
                Story
              </button>
            </div>
          )}
        </div>
      </div>

      <CalendarView />

      {/* Post Composer Dialog */}
      <Dialog
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        title="Nouvelle publication"
        maxWidth="max-w-5xl"
      >
        <PostComposer
          key="new-from-calendar"
          onSaved={() => {
            setComposerOpen(false);
            window.location.reload();
          }}
        />
      </Dialog>

      {/* Story Composer Dialog */}
      <Dialog
        open={storyComposerOpen}
        onClose={() => setStoryComposerOpen(false)}
        title="Nouvelle story"
        maxWidth="max-w-4xl"
      >
        <StoryComposer
          key="new-story-from-calendar"
          onSaved={() => {
            setStoryComposerOpen(false);
            window.location.reload();
          }}
        />
      </Dialog>
    </div>
  );
}
