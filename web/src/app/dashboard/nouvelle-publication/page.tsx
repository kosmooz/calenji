"use client";

import { Suspense } from "react";
import PostComposer from "@/components/composer/PostComposer";

export default function NouvellePublicationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#37352f]">
          Nouvelle publication
        </h1>
        <p className="text-sm text-[#73726e] mt-1">
          Créez et programmez une publication pour Instagram et Facebook.
        </p>
      </div>
      <Suspense>
        <PostComposer />
      </Suspense>
    </div>
  );
}
