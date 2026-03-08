"use client";

import StoryComposer from "@/components/composer/StoryComposer";

export default function NouvelleStoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#37352f]">
          Nouvelle story
        </h1>
        <p className="text-sm text-[#73726e] mt-1">
          Créez et programmez une story pour Instagram et Facebook.
        </p>
      </div>
      <StoryComposer />
    </div>
  );
}
