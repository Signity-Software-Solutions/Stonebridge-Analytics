import { Suspense } from "react";
import { SpendView } from "@/components/views/SpendView";

export default function ProgramSpendPage() {
  return (
    <Suspense>
      <SpendView />
    </Suspense>
  );
}
