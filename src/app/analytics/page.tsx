import { Suspense } from "react";
import { UsageView } from "@/components/views/UsageView";

export default function AnalyticsPage() {
  return (
    <Suspense>
      <UsageView />
    </Suspense>
  );
}
