import { Suspense } from "react";
import { ActivityView } from "@/components/views/ActivityView";

export default function ActivityPage() {
  return (
    <Suspense>
      <ActivityView />
    </Suspense>
  );
}
