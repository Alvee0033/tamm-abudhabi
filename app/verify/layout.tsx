import { Suspense } from "react";
import VerifyPage from "./page";

/**
 * Wraps VerifyPage in Suspense since it reads search params client-side
 */
export default function VerifyLayout() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="spinner" />
        </div>
      }
    >
      <VerifyPage />
    </Suspense>
  );
}
