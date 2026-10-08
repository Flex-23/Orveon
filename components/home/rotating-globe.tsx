"use client";

// يضمّن كرة الـ SVG المتحركة داخل DOM الصفحة مباشرةً، فتأخذ خلفية الموقع الشفافة
// (بلا الصندوق الأبيض الذي يطليه المتصفح حول SVG المعروض عبر <object>)،
// ويشغّل سكربتها الداخلي يدوياً لأن السكربت لا يعمل عند الحقن عبر innerHTML.
import { useEffect, useRef } from "react";
import { preload } from "react-dom";

export function RotatingGlobe({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  // يبدأ تنزيل ملف الكرة مع HTML الأولي (وسم preload) بدل انتظار الترطيب ثم fetch.
  preload("/globe-rotating.svg", { as: "fetch" });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let injected: HTMLScriptElement | null = null;

    fetch("/globe-rotating.svg")
      .then((res) => res.text())
      .then((svgText) => {
        if (cancelled || !host) return;

        // افصل السكربت عن الرسم، واحقن الرسم فقط
        const scriptMatch = svgText.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
        const markup = svgText.replace(/<script[\s\S]*?<\/script>/i, "");
        host.innerHTML = markup;

        // اجعل الـ SVG يملأ الحاوية بدل مقاسه الثابت 720×720
        const svg = host.querySelector("svg");
        if (svg) {
          svg.setAttribute("width", "100%");
          svg.setAttribute("height", "100%");
          svg.style.display = "block";
        }

        // شغّل سكربت الكرة ضمن سياق المستند (يبني الشبكة واليابسة ويحرّكها)
        const raw = scriptMatch?.[1];
        const code = raw
          ? raw.replace(/^\s*<!\[CDATA\[/, "").replace(/\]\]>\s*$/, "")
          : "";
        if (code) {
          const s = document.createElement("script");
          s.textContent = code;
          document.body.appendChild(s);
          injected = s;
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      injected?.remove();
      if (host) host.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label="كرة أرضية رقمية دوّارة"
      className={["rotating-globe", className].filter(Boolean).join(" ")}
    />
  );
}
