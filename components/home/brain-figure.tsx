// شعار «الدماغ + الدارة» بأسلوب نيون متدرّج لقسم البطل.
// SVG مضمّن بخلفية شفافة (يعتمد خلفية الموقع)، بتدرّج بنفسجي ناعم وتوهّج نيون.
import type { SVGProps } from "react";

export function BrainFigure({
  title = "Orvion",
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="30 150 740 770"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      {...props}
    >
      <defs>
        <linearGradient id="neonGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7a8eff" />
          <stop offset="50%" stopColor="#9fa8ff" />
          <stop offset="100%" stopColor="#b8c0ff" />
        </linearGradient>

        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="15" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#neonGlow)">
        <path
          d="M 400,200
             C 470,200 520,220 560,260
             C 620,320 670,380 690,480
             C 710,560 710,650 640,730
             C 610,765 550,790 480,790
             L 480,740
             C 530,740 570,720 600,690
             C 650,630 650,550 640,490
             C 625,410 580,360 530,310
             C 495,275 450,260 400,260 Z"
          fill="none"
          stroke="url(#neonGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M 400,200
             C 330,200 280,220 240,260
             C 180,320 130,380 110,480
             C 90,560 90,650 160,730
             C 190,765 250,790 320,790
             L 320,740
             C 270,740 230,720 200,690
             C 150,630 150,550 160,490
             C 175,410 220,360 270,310
             C 305,275 350,260 400,260 Z"
          fill="none"
          stroke="url(#neonGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M 310,790 L 310,610 L 230,510 L 230,450"
          fill="none"
          stroke="url(#neonGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="230" cy="420" r="25" fill="none" stroke="url(#neonGradient)" strokeWidth="12" />

        <path
          d="M 490,735 L 490,580 L 570,490 L 570,430"
          fill="none"
          stroke="url(#neonGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="570" cy="400" r="25" fill="none" stroke="url(#neonGradient)" strokeWidth="12" />

        <path
          d="M 370,260 L 370,820 C 370,870 430,870 430,820 L 430,480"
          fill="none"
          stroke="url(#neonGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M 430,480 L 430,360"
          fill="none"
          stroke="url(#neonGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="430" cy="330" r="25" fill="none" stroke="url(#neonGradient)" strokeWidth="12" />
      </g>
    </svg>
  );
}
