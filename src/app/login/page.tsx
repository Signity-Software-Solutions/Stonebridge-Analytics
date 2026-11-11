import { Suspense } from "react";
import { LoginCard } from "./LoginCard";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginCard />
    </Suspense>
  );
}
