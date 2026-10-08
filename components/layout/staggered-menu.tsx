"use client";

// StaggeredMenu (مستوحى من React Bits) — نسخة مدفوعة بالحالة عبر CSS transitions.
// الانزلاق والتدرّج يتحكّم بهما السمة data-open على الطبقة، بلا GSAP (أكثر موثوقية).
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import "./staggered-menu.css";

export interface StaggeredMenuItem {
  label: string;
  ariaLabel?: string;
  link?: string;
  /** عند تمريره يُعرض العنصر كزرّ داخل <form action> بدل رابط (مثل تسجيل الخروج). */
  action?: (formData: FormData) => void | Promise<void>;
}

export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}

export interface StaggeredMenuProps {
  position?: "left" | "right";
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  logoUrl?: string;
  logoNode?: ReactNode;
  footer?: ReactNode;
  accentColor?: string;
  closeOnClickAway?: boolean;
  menuLabel?: string;
  closeLabel?: string;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

export const StaggeredMenu = ({
  position = "right",
  colors = ["#B497CF", "#5227FF"],
  items = [],
  socialItems = [],
  displaySocials = false,
  displayItemNumbering = false,
  className,
  logoUrl = "/next.svg",
  logoNode,
  footer,
  accentColor = "#8b88ff",
  closeOnClickAway = true,
  menuLabel = "القائمة",
  closeLabel = "إغلاق",
  onMenuOpen,
  onMenuClose,
}: StaggeredMenuProps) => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);

  // الـ Portal لا يُرسم إلا على العميل بعد التركيب (نمط آمن لـ SSR).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const setOpenState = useCallback(
    (next: boolean) => {
      setOpen((prev) => {
        if (prev === next) return prev;
        if (next) onMenuOpen?.();
        else onMenuClose?.();
        return next;
      });
    },
    [onMenuOpen, onMenuClose],
  );

  const close = useCallback(() => setOpenState(false), [setOpenState]);

  // إغلاق عند النقر خارج اللوحة
  useEffect(() => {
    if (!closeOnClickAway || !open) return;
    const onDown = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [closeOnClickAway, open, close]);

  // إغلاق عند Escape + منع تمرير الصفحة خلف القائمة
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  const accentStyle = { ["--sm-accent" as string]: accentColor } as CSSProperties;

  const layerColors = (() => {
    const raw = colors && colors.length ? colors.slice(0, 4) : ["#1e1e22", "#35353c"];
    const arr = [...raw];
    if (arr.length >= 3) {
      const mid = Math.floor(arr.length / 2);
      arr.splice(mid, 1);
    }
    return arr;
  })();

  // الطبقة (اللوحة + الطبقات الملوّنة) تُحقن في <body> كطبقة fixed تملأ الشاشة.
  const overlay = (
    <div
      className={"staggered-menu-overlay" + (className ? " " + className : "")}
      style={accentStyle}
      data-position={position}
      data-open={open || undefined}
    >
      <div className="sm-prelayers" aria-hidden="true">
        {layerColors.map((c, i) => (
          <div key={i} className="sm-prelayer" style={{ background: c }} />
        ))}
      </div>

      <aside id="staggered-menu-panel" ref={panelRef} className="staggered-menu-panel" aria-hidden={!open}>
        <div className="sm-panel-inner">
          <ul className="sm-panel-list" role="list" data-numbering={displayItemNumbering || undefined}>
            {items && items.length ? (
              items.map((it, idx) =>
                it.action ? (
                  <li className="sm-panel-itemWrap" key={it.label + idx}>
                    <form action={it.action}>
                      <button type="submit" className="sm-panel-item" onClick={close}>
                        <span className="sm-panel-itemLabel" style={{ ["--sm-i" as string]: idx } as CSSProperties}>
                          {it.label}
                        </span>
                      </button>
                    </form>
                  </li>
                ) : (
                  <li className="sm-panel-itemWrap" key={it.label + idx}>
                    <Link className="sm-panel-item" href={it.link || "#"} aria-label={it.ariaLabel} onClick={close}>
                      <span className="sm-panel-itemLabel" style={{ ["--sm-i" as string]: idx } as CSSProperties}>
                        {it.label}
                      </span>
                    </Link>
                  </li>
                ),
              )
            ) : (
              <li className="sm-panel-itemWrap" aria-hidden="true">
                <span className="sm-panel-item">
                  <span className="sm-panel-itemLabel">لا توجد عناصر</span>
                </span>
              </li>
            )}
          </ul>

          {displaySocials && socialItems && socialItems.length > 0 && (
            <div className="sm-socials" aria-label="روابط التواصل">
              <h3 className="sm-socials-title">تابعنا</h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((s, i) => (
                  <li key={s.label + i} className="sm-socials-item">
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="sm-socials-link">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {footer && <div className="sm-panel-footer">{footer}</div>}
        </div>
      </aside>
    </div>
  );

  return (
    <div
      className={(className ? className + " " : "") + "staggered-menu-wrapper"}
      style={accentStyle}
      data-position={position}
      data-open={open || undefined}
    >
      <header className="staggered-menu-header" aria-label="التنقّل الرئيسي">
        <div className="sm-logo" aria-label="الشعار">
          {logoNode ? (
            logoNode
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="الشعار" className="sm-logo-img" draggable={false} width={110} height={24} />
          )}
        </div>
        <button
          ref={toggleBtnRef}
          className="sm-toggle"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={open}
          aria-controls="staggered-menu-panel"
          onClick={() => setOpenState(!open)}
          type="button"
        >
          <span className="sm-toggle-label">{open ? closeLabel : menuLabel}</span>
          <span className="sm-icon" aria-hidden="true">
            <span className="sm-icon-line" />
            <span className="sm-icon-line sm-icon-line-v" />
          </span>
        </button>
      </header>

      {mounted && createPortal(overlay, document.body)}
    </div>
  );
};

export default StaggeredMenu;
