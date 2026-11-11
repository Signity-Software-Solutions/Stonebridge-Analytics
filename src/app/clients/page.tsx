import { Suspense } from "react";
import { ClientsView } from "@/components/views/ClientsView";

export default function ClientsPage() {
  return (
    <Suspense>
      <ClientsView />
    </Suspense>
  );
}
