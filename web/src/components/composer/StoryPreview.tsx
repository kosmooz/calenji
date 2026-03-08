"use client";

import { Instagram, Facebook } from "lucide-react";

interface StoryPreviewProps {
  mediaUrl: string | null;
  platform: "INSTAGRAM" | "FACEBOOK";
  accountName: string;
  accountAvatar?: string | null;
}

export default function StoryPreview({
  mediaUrl,
  platform,
  accountName,
  accountAvatar,
}: StoryPreviewProps) {
  const isIG = platform === "INSTAGRAM";
  const isVideo = mediaUrl && /\.(mp4|webm|mov)$/i.test(mediaUrl);

  return (
    <div className="w-[180px] mx-auto">
      {/* Phone frame */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-[#e8e5e0] bg-black aspect-[9/16]">
        {/* Media */}
        {mediaUrl ? (
          isVideo ? (
            <video
              src={mediaUrl}
              className="absolute inset-0 w-full h-full object-cover"
              muted
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Story preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
            {isIG ? (
              <Instagram className="h-8 w-8 text-white/30" />
            ) : (
              <Facebook className="h-8 w-8 text-white/30" />
            )}
          </div>
        )}

        {/* Header overlay */}
        <div className="absolute top-0 left-0 right-0 p-2.5 bg-gradient-to-b from-black/40 to-transparent">
          {/* Progress bar */}
          <div className="w-full h-0.5 bg-white/30 rounded-full mb-2">
            <div className="w-1/3 h-full bg-white rounded-full" />
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                isIG
                  ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[1px]"
                  : "bg-[#1877F2]"
              }`}
            >
              {accountAvatar ? (
                <img
                  src={accountAvatar}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : isIG ? (
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <Instagram className="h-2.5 w-2.5 text-white" />
                </div>
              ) : (
                <Facebook className="h-2.5 w-2.5 text-white" />
              )}
            </div>
            <span className="text-[9px] text-white font-medium">
              {accountName}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-center text-[#9b9a97] mt-1.5">
        {isIG ? "Instagram Story" : "Facebook Story"}
      </p>
    </div>
  );
}
