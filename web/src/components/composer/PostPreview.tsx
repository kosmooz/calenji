"use client";

import { Instagram, Facebook, Heart, MessageCircle, Send, Bookmark, ThumbsUp, MessageSquare, Share } from "lucide-react";

interface PostPreviewProps {
  caption: string;
  mediaUrls: string[];
  platform: "INSTAGRAM" | "FACEBOOK";
  accountName: string;
  accountAvatar?: string | null;
}

export default function PostPreview({
  caption,
  mediaUrls,
  platform,
  accountName,
  accountAvatar,
}: PostPreviewProps) {
  const isIG = platform === "INSTAGRAM";
  const firstMedia = mediaUrls[0];
  const isVideo = firstMedia && /\.(mp4|webm|mov)$/i.test(firstMedia);

  if (isIG) {
    return (
      <div className="w-full max-w-[280px] bg-white rounded-xl border border-[#e8e5e0] overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              {accountAvatar ? (
                <img src={accountAvatar} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Instagram className="h-3 w-3 text-gray-500" />
              )}
            </div>
          </div>
          <span className="font-semibold text-[#262626]">{accountName}</span>
        </div>

        {/* Media */}
        <div className="aspect-square bg-[#f7f6f3] relative">
          {firstMedia ? (
            isVideo ? (
              <video src={firstMedia} className="w-full h-full object-cover" muted />
            ) : (
              <img src={firstMedia} className="w-full h-full object-cover" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#c4c3c0]">
              <Instagram className="h-8 w-8" />
            </div>
          )}
          {mediaUrls.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full">
              1/{mediaUrls.length}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5" />
              <MessageCircle className="h-5 w-5" />
              <Send className="h-5 w-5" />
            </div>
            <Bookmark className="h-5 w-5" />
          </div>
          {caption && (
            <p className="text-[11px] text-[#262626] leading-relaxed whitespace-pre-line">
              <span className="font-semibold">{accountName}</span>{" "}
              {caption.length > 100 ? caption.slice(0, 100) + "..." : caption}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Facebook preview
  return (
    <div className="w-full max-w-[280px] bg-white rounded-xl border border-[#e8e5e0] overflow-hidden text-xs">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center">
          {accountAvatar ? (
            <img src={accountAvatar} className="w-full h-full rounded-full object-cover" />
          ) : (
            <Facebook className="h-4 w-4 text-white" />
          )}
        </div>
        <div>
          <div className="font-semibold text-[#050505]">{accountName}</div>
          <div className="text-[10px] text-[#65676B]">Maintenant · 🌐</div>
        </div>
      </div>

      {/* Caption */}
      {caption && (
        <div className="px-3 pb-2">
          <p className="text-[12px] text-[#050505] leading-relaxed whitespace-pre-line">
            {caption.length > 150 ? caption.slice(0, 150) + "..." : caption}
          </p>
        </div>
      )}

      {/* Media */}
      {firstMedia && (
        <div className="aspect-video bg-[#f7f6f3]">
          {isVideo ? (
            <video src={firstMedia} className="w-full h-full object-cover" muted />
          ) : (
            <img src={firstMedia} className="w-full h-full object-cover" />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-around px-3 py-2 border-t border-[#e8e5e0]">
        <button className="flex items-center gap-1 text-[#65676B]">
          <ThumbsUp className="h-4 w-4" /> J&apos;aime
        </button>
        <button className="flex items-center gap-1 text-[#65676B]">
          <MessageSquare className="h-4 w-4" /> Commenter
        </button>
        <button className="flex items-center gap-1 text-[#65676B]">
          <Share className="h-4 w-4" /> Partager
        </button>
      </div>
    </div>
  );
}
