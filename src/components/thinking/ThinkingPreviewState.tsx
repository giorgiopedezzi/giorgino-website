"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import styles from "./EditorialSystem.module.css";

export function ThinkingPreviewState() {
  const router = useRouter();

  useEffect(() => {
    const refresh = window.setInterval(() => router.refresh(), 5000);
    return () => window.clearInterval(refresh);
  }, [router]);

  return <aside className={styles.previewState} aria-label="Draft preview active"><span>Draft preview — local changes refresh automatically.</span><Link href="/api/thinking-preview/disable" prefetch={false}>Exit preview</Link></aside>;
}
