"use client";

// كشف تفضيل "تقليل الحركة" بشكل آمن للترطيب (SSR) عبر useSyncExternalStore:
// - لقطة الخادم تُعيد false (مطابقة لأول رسم على العميل) فلا يحدث عدم تطابق.
// - بعد الترطيب يقرأ React القيمة الحقيقية من matchMedia ويُحدّث عند تغيّرها.
// نقرأ matchMedia مباشرةً (بدل useReducedMotion من framer-motion) لتجنّب تحذير
// التطوير الذي تطبعه المكتبة، ودون استدعاء setState داخل effect.
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
