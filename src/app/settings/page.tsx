import { Suspense } from "react";
import { SettingsView } from "@/components/views/SettingsView";

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsView />
    </Suspense>
  );
}
