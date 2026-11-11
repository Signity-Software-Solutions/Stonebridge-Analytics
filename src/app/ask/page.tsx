import { Suspense } from "react";
import { AskView } from "@/components/views/AskView";

export default function AskPage() {
  return (
    <Suspense>
      <AskView />
    </Suspense>
  );
}
