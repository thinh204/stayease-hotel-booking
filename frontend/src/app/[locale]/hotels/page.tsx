import React, { Suspense } from "react";
import HotelsExplorer from "@/components/hotels/HotelsExplorer";

export default function HotelsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400">Loading luxury sanctuaries...</div>}>
      <HotelsExplorer />
    </Suspense>
  );
}
