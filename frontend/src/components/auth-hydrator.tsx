"use client";

import { useEffect } from "react";

import { useAuth } from "@/store/auth";

/** Restores the session from persisted tokens on first client mount. */
export function AuthHydrator() {
  const hydrate = useAuth((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return null;
}
