import { Suspense } from "react";
import { HomeView } from "@/components/views/HomeView";

export default function HomePage() {
  return (
    <Suspense>
      <HomeView />
    </Suspense>
  );
}
