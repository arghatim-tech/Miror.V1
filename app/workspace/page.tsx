import { Suspense } from "react";
import MirorWorkspace from "@/components/miror-workspace";

export default function WorkspacePage() {
  return (
    <Suspense fallback={null}>
      <MirorWorkspace />
    </Suspense>
  );
}
