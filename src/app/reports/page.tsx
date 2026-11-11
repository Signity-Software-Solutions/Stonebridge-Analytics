import { Suspense } from "react";
import { ReportsView } from "@/components/views/ReportsView";

export default function ReportsPage() {
  return (
    <Suspense>
      <ReportsView />
    </Suspense>
  );
}
