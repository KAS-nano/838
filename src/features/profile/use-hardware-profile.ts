"use client";

import { useEffect, useState } from "react";
import { demoHardwareProfile, PROFILE_CHANGED_EVENT, PROFILE_KEY, readHardwareProfile } from "./local-store";

export function useHardwareProfile() {
  const [state, setState] = useState({ profile: demoHardwareProfile, isDemo: true, loaded: false });

  useEffect(() => {
    const refresh = () => {
      const saved = readHardwareProfile();
      setState({ profile: saved ?? demoHardwareProfile, isDemo: saved === null, loaded: true });
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === PROFILE_KEY || event.key === null) refresh();
    };
    refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener(PROFILE_CHANGED_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PROFILE_CHANGED_EVENT, refresh);
    };
  }, []);

  return state;
}
