// شعار أورفيون: دماغ بأسلوب دارة إلكترونية (Brain + Circuit).
// يرث اللون من النصّ المحيط عبر currentColor، ويُحجَّم عبر className (مثل h-8 w-8).
import type { SVGProps } from "react";

export function BrainLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 300 410"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Orvion"
      {...props}
    >
      {/* الهيكل: حدّ الدماغ + فاصل النصفين + المسارات (دارات) */}
      <g
        stroke="currentColor"
        strokeWidth={13}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* حدّ الدماغ */}
        <path d="M150 60 C168 44 196 44 210 60 C232 52 256 72 250 98 C272 104 276 140 256 156 C274 174 268 208 246 214 C252 242 230 262 204 256 C196 282 166 286 150 274 C134 286 104 282 96 256 C70 262 48 242 54 214 C32 208 26 174 44 156 C24 140 28 104 50 98 C44 72 68 52 90 60 C104 44 132 44 150 60 Z" />
        {/* فاصل النصفين أعلى الدماغ */}
        <path d="M150 72 V116" />
        {/* المسار الأوسط — يمتدّ أسفل الدماغ كساق */}
        <path d="M150 140 V372" />
        {/* مسار يسار ينعطف نحو المركز */}
        <path d="M96 188 V250 C96 268 110 274 124 274" />
        {/* مسار يمين ينعطف نحو المركز */}
        <path d="M204 172 V238 C204 256 190 262 176 262" />
      </g>

      {/* العُقَد (نقاط الاتصال) — حلقات تبدو كنقاط مجوّفة */}
      <g stroke="currentColor" strokeWidth={10} fill="none">
        <circle cx="150" cy="128" r="7" />
        <circle cx="96" cy="176" r="7" />
        <circle cx="204" cy="160" r="7" />
      </g>
    </svg>
  );
}
