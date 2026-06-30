"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { login } = useAppState();
  const [status, setStatus] = useState("Verifying link...");
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token=")) {
      setStatus("Invalid link. Please try signing up again.");
      return;
    }

    const params = new URLSearchParams(hash.replace("#", ""));
    const accessToken = params.get("access_token");

    if (!accessToken) {
      setStatus("Invalid link. Please try signing up again.");
      return;
    }

    fetch(`${BACKEND_URL}/auth/verify-magic-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          login(data.email || "", data.name || "");
          window.location.hash = "";
          router.push("/dashboard");
        } else {
          setStatus(data.message || "Verification failed. Please try again.");
        }
      })
      .catch(() => {
        setStatus("Network error. Please try again.");
      });
  }, [router, login, BACKEND_URL]);

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-gray-400 font-mono">{status}</p>
      </div>
    </div>
  );
}
