import type { CSSProperties } from "react";
import type { KnotreeAppearance } from "./types.js";

export const STYLE_ID = "knotree-account-ui";

/**
 * Modern, animated account UI styles. The same token surface (`--kt-*`) is
 * used everywhere so the host application can override any color, radius, or
 * font through `appearance` without losing the new visual language.
 */
export const accountStyles = String.raw`
/* ============ Tokens ============ */
.kt-root{
  --kt-accent:#635bff;
  --kt-accent-2:#8b5cf6;
  --kt-accent-soft:color-mix(in srgb,var(--kt-accent) 14%,transparent);
  --kt-accent-foreground:#fff;
  --kt-bg:#ffffff;
  --kt-bg-elev:#ffffff;
  --kt-bg-soft:color-mix(in srgb,var(--kt-bg) 88%,var(--kt-text) 4%);
  --kt-bg-strong:color-mix(in srgb,var(--kt-bg) 82%,var(--kt-text) 8%);
  --kt-text:#0f172a;
  --kt-text-strong:#020617;
  --kt-muted:#64748b;
  --kt-muted-2:#94a3b8;
  --kt-border:color-mix(in srgb,#94a3b8 24%,transparent);
  --kt-border-strong:color-mix(in srgb,#94a3b8 40%,transparent);
  --kt-danger:#dc2626;
  --kt-danger-soft:color-mix(in srgb,var(--kt-danger) 10%,transparent);
  --kt-success:#10b981;
  --kt-success-soft:color-mix(in srgb,var(--kt-success) 12%,transparent);
  --kt-warning:#f59e0b;
  --kt-warning-soft:color-mix(in srgb,var(--kt-warning) 14%,transparent);
  --kt-radius:18px;
  --kt-radius-sm:10px;
  --kt-radius-lg:26px;
  --kt-shadow-sm:0 1px 2px rgba(15,23,42,.05),0 1px 3px rgba(15,23,42,.06);
  --kt-shadow-md:0 4px 12px rgba(15,23,42,.06),0 12px 32px rgba(15,23,42,.08);
  --kt-shadow-lg:0 24px 64px rgba(15,23,42,.18),0 8px 24px rgba(15,23,42,.08);
  --kt-shadow-glow:0 0 0 6px color-mix(in srgb,var(--kt-accent) 16%,transparent);
  --kt-font:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  font-family:var(--kt-font);
  color:var(--kt-text);
  box-sizing:border-box;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}
.kt-root *,.kt-root *::before,.kt-root *::after{box-sizing:border-box}

/* Dark mode */
@media(prefers-color-scheme:dark){
  .kt-root:not([data-mode="light"]){
    --kt-accent:#7c7bff;
    --kt-accent-2:#a78bfa;
    --kt-accent-soft:color-mix(in srgb,var(--kt-accent) 18%,transparent);
    --kt-bg:#0b1020;
    --kt-bg-elev:#121a33;
    --kt-bg-soft:color-mix(in srgb,var(--kt-bg-elev) 90%,#000 10%);
    --kt-bg-strong:color-mix(in srgb,var(--kt-bg-elev) 80%,#000 20%);
    --kt-text:#e6e8ee;
    --kt-text-strong:#f5f7fb;
    --kt-muted:#8a93a6;
    --kt-muted-2:#5d6478;
    --kt-border:color-mix(in srgb,#94a3b8 18%,transparent);
    --kt-border-strong:color-mix(in srgb,#94a3b8 28%,transparent);
    --kt-danger:#f87171;
    --kt-danger-soft:color-mix(in srgb,var(--kt-danger) 14%,transparent);
    --kt-success:#34d399;
    --kt-success-soft:color-mix(in srgb,var(--kt-success) 14%,transparent);
    --kt-warning:#fbbf24;
    --kt-warning-soft:color-mix(in srgb,var(--kt-warning) 16%,transparent);
    --kt-shadow-sm:0 1px 2px rgba(0,0,0,.4);
    --kt-shadow-md:0 8px 20px rgba(0,0,0,.45),0 2px 6px rgba(0,0,0,.3);
    --kt-shadow-lg:0 30px 80px rgba(0,0,0,.6),0 8px 24px rgba(0,0,0,.4);
    --kt-shadow-glow:0 0 0 6px color-mix(in srgb,var(--kt-accent) 28%,transparent);
  }
}
.kt-root[data-mode="dark"]{
  --kt-accent:#7c7bff;
  --kt-accent-2:#a78bfa;
  --kt-accent-soft:color-mix(in srgb,var(--kt-accent) 18%,transparent);
  --kt-bg:#0b1020;
  --kt-bg-elev:#121a33;
  --kt-bg-soft:color-mix(in srgb,var(--kt-bg-elev) 90%,#000 10%);
  --kt-bg-strong:color-mix(in srgb,var(--kt-bg-elev) 80%,#000 20%);
  --kt-text:#e6e8ee;
  --kt-text-strong:#f5f7fb;
  --kt-muted:#8a93a6;
  --kt-muted-2:#5d6478;
  --kt-border:color-mix(in srgb,#94a3b8 18%,transparent);
  --kt-border-strong:color-mix(in srgb,#94a3b8 28%,transparent);
  --kt-danger:#f87171;
  --kt-danger-soft:color-mix(in srgb,var(--kt-danger) 14%,transparent);
  --kt-success:#34d399;
  --kt-success-soft:color-mix(in srgb,var(--kt-success) 14%,transparent);
  --kt-warning:#fbbf24;
  --kt-warning-soft:color-mix(in srgb,var(--kt-warning) 16%,transparent);
  --kt-shadow-sm:0 1px 2px rgba(0,0,0,.4);
  --kt-shadow-md:0 8px 20px rgba(0,0,0,.45),0 2px 6px rgba(0,0,0,.3);
  --kt-shadow-lg:0 30px 80px rgba(0,0,0,.6),0 8px 24px rgba(0,0,0,.4);
  --kt-shadow-glow:0 0 0 6px color-mix(in srgb,var(--kt-accent) 28%,transparent);
}
/* ============ Buttons ============ */
.kt-user-button{
  appearance:none;border:1px solid var(--kt-border);
  background:var(--kt-bg-elev);color:var(--kt-text);
  display:inline-flex;align-items:center;gap:10px;
  border-radius:999px;padding:5px 14px 5px 5px;
  cursor:pointer;font:inherit;font-size:14px;font-weight:600;
  box-shadow:var(--kt-shadow-sm);
  transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,background .18s ease;
}
.kt-user-button:hover{transform:translateY(-1px);border-color:color-mix(in srgb,var(--kt-accent) 38%,var(--kt-border));box-shadow:var(--kt-shadow-md)}
.kt-user-button:active{transform:translateY(0)}
.kt-user-button-signed-out{color:var(--kt-accent)}
.kt-user-button-signed-out .kt-avatar{background:linear-gradient(135deg,var(--kt-accent),var(--kt-accent-2))}
.kt-root :focus-visible{outline:3px solid color-mix(in srgb,var(--kt-accent) 30%,transparent);outline-offset:2px;border-radius:6px}
.kt-avatar{
  width:34px;height:34px;display:grid;place-items:center;
  border-radius:50%;font-size:13px;font-weight:800;letter-spacing:.02em;
  color:var(--kt-accent-foreground);
  background:linear-gradient(135deg,var(--kt-accent),var(--kt-accent-2));
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.28);
  flex:none;overflow:hidden;position:relative;
}
.kt-avatar img{width:100%;height:100%;object-fit:cover;display:block}
.kt-avatar-lg{width:64px;height:64px;font-size:22px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.4),0 6px 18px color-mix(in srgb,var(--kt-accent) 35%,transparent)}
.kt-avatar-xl{width:84px;height:84px;font-size:30px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.4),0 10px 28px color-mix(in srgb,var(--kt-accent) 40%,transparent)}
.kt-user-label{font-size:14px;font-weight:600;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--kt-text)}
.kt-chevron{width:15px;height:15px;color:var(--kt-muted);transition:transform .18s ease}
.kt-user-button[aria-expanded="true"] .kt-chevron{transform:rotate(180deg)}

/* ============ Backdrop & Dialog ============ */
.kt-backdrop{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:24px;background:color-mix(in srgb,#000 50%,transparent);backdrop-filter:blur(10px) saturate(120%);-webkit-backdrop-filter:blur(10px) saturate(120%);animation:kt-fade .22s ease}
.kt-dialog{position:relative;display:grid;grid-template-columns:240px minmax(0,1fr);width:min(900px,100%);height:min(680px,calc(100dvh - 48px));overflow:hidden;border:1px solid var(--kt-border);border-radius:var(--kt-radius-lg);background:var(--kt-bg-elev);box-shadow:var(--kt-shadow-lg);animation:kt-rise .28s cubic-bezier(.2,.8,.2,1)}

/* ============ Sidebar ============ */
.kt-sidebar{display:flex;flex-direction:column;padding:22px 14px 16px;background:var(--kt-bg-soft);border-right:1px solid var(--kt-border);position:relative;overflow:hidden}
.kt-sidebar::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 0% 0%,color-mix(in srgb,var(--kt-accent) 18%,transparent) 0%,transparent 38%),radial-gradient(circle at 100% 100%,color-mix(in srgb,var(--kt-accent-2) 14%,transparent) 0%,transparent 42%);pointer-events:none;opacity:.9}
.kt-sidebar>*{position:relative}
.kt-brand{display:flex;align-items:center;gap:8px;padding:0 10px 18px;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--kt-muted)}
.kt-brand-mark{width:22px;height:22px;border-radius:7px;display:grid;place-items:center;background:linear-gradient(135deg,var(--kt-accent),var(--kt-accent-2));color:#fff;font-weight:900;font-size:12px;letter-spacing:0;box-shadow:0 4px 10px color-mix(in srgb,var(--kt-accent) 30%,transparent)}
.kt-account-mini{display:flex;gap:12px;align-items:center;padding:10px;border-radius:14px;background:color-mix(in srgb,var(--kt-bg-elev) 70%,transparent);border:1px solid var(--kt-border);margin:0 4px 14px}
.kt-account-mini .kt-avatar{flex:none}
.kt-account-copy{min-width:0;flex:1}
.kt-account-name{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--kt-text-strong)}
.kt-account-email{margin-top:2px;font-size:12px;color:var(--kt-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kt-nav{display:grid;gap:3px}
.kt-nav-button{appearance:none;width:100%;display:flex;align-items:center;gap:10px;border:0;border-radius:11px;padding:10px 12px;background:transparent;color:var(--kt-muted);font:inherit;font-size:14px;font-weight:600;text-align:left;cursor:pointer;position:relative;transition:background .15s,color .15s,transform .12s}
.kt-nav-button svg{width:18px;height:18px;flex:none;transition:transform .18s ease}
.kt-nav-button:hover{background:color-mix(in srgb,var(--kt-accent) 8%,transparent);color:var(--kt-text)}
.kt-nav-button:hover svg{transform:translateX(1px)}
.kt-nav-button[data-active=true]{background:color-mix(in srgb,var(--kt-accent) 12%,transparent);color:var(--kt-accent);font-weight:700}
.kt-nav-button[data-active=true]::before{content:"";position:absolute;left:-2px;top:50%;transform:translateY(-50%);width:3px;height:18px;border-radius:2px;background:var(--kt-accent);box-shadow:0 0 12px color-mix(in srgb,var(--kt-accent) 50%,transparent)}
.kt-nav-badge{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;background:var(--kt-accent-soft);color:var(--kt-accent);border-radius:999px;font-size:11px;font-weight:700}
.kt-sidebar-bottom{margin-top:auto;display:grid;gap:6px;padding-top:14px}
.kt-nav-button.kt-signout{color:var(--kt-danger);font-weight:600}
.kt-nav-button.kt-signout:hover{background:var(--kt-danger-soft)}
/* ============ Content / Header ============ */
.kt-content{min-width:0;overflow:auto;padding:0 0 30px;display:flex;flex-direction:column;position:relative}
.kt-content::-webkit-scrollbar{width:8px;height:8px}
.kt-content::-webkit-scrollbar-thumb{background:var(--kt-border-strong);border-radius:4px}
.kt-content::-webkit-scrollbar-track{background:transparent}
.kt-header{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:14px;padding:22px 32px 18px;background:linear-gradient(180deg,var(--kt-bg-elev) 60%,color-mix(in srgb,var(--kt-bg-elev) 60%,transparent) 100%);border-bottom:1px solid var(--kt-border)}
.kt-header-copy{min-width:0;flex:1}
.kt-eyebrow{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--kt-accent);margin-bottom:4px}
.kt-title{font-size:24px;font-weight:800;letter-spacing:-.01em;color:var(--kt-text-strong);margin:0 0 4px}
.kt-subtitle{margin:0;font-size:14px;color:var(--kt-muted);line-height:1.5}
.kt-mobile-head{display:none;gap:6px;overflow-x:auto;padding:14px 32px 4px;scrollbar-width:none}
.kt-mobile-head::-webkit-scrollbar{display:none}
.kt-mobile-head .kt-nav-button{width:auto;white-space:nowrap;padding:8px 12px;font-size:13px}
.kt-close{position:absolute;right:18px;top:18px;z-index:4}
.kt-icon-button{appearance:none;width:36px;height:36px;display:grid;place-items:center;border:1px solid var(--kt-border);border-radius:50%;background:color-mix(in srgb,var(--kt-bg-elev) 80%,transparent);color:var(--kt-muted);cursor:pointer;transition:background .15s,color .15s,transform .15s,border-color .15s;backdrop-filter:blur(6px)}
.kt-icon-button:hover{background:var(--kt-bg-strong);color:var(--kt-text);border-color:var(--kt-border-strong);transform:rotate(90deg)}
.kt-icon-button svg{width:16px;height:16px}

/* ============ View content ============ */
.kt-view{padding:24px 32px 8px;animation:kt-fade-up .3s cubic-bezier(.2,.8,.2,1)}
.kt-view-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:16px}
.kt-view-head h2{font-size:18px;font-weight:700;margin:0;color:var(--kt-text-strong)}
.kt-view-head p{margin:4px 0 0;font-size:13px;color:var(--kt-muted)}
.kt-view-head .kt-view-actions{display:flex;gap:8px;align-items:center}

/* ============ Form fields ============ */
.kt-field{display:grid;gap:6px}
.kt-field label{font-size:12px;font-weight:700;color:var(--kt-text-strong);letter-spacing:.02em}
.kt-field-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.kt-input{width:100%;font:inherit;font-size:14px;color:var(--kt-text);background:var(--kt-bg);border:1px solid var(--kt-border);border-radius:var(--kt-radius-sm);padding:11px 13px;transition:border-color .15s,box-shadow .15s,background .15s}
.kt-input::placeholder{color:var(--kt-muted-2)}
.kt-input:hover{border-color:var(--kt-border-strong)}
.kt-input:focus{outline:none;border-color:var(--kt-accent);box-shadow:0 0 0 4px var(--kt-accent-soft)}
.kt-input[aria-invalid="true"]{border-color:var(--kt-danger);box-shadow:0 0 0 4px var(--kt-danger-soft)}
.kt-input:disabled{opacity:.6;cursor:not-allowed}
.kt-input-wrap{position:relative}
.kt-input-wrap .kt-input{padding-right:42px}
.kt-input-action{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:0;cursor:pointer;color:var(--kt-muted);padding:6px;border-radius:6px;display:grid;place-items:center}
.kt-input-action:hover{color:var(--kt-text);background:var(--kt-bg-strong)}
.kt-input-action svg{width:16px;height:16px}
.kt-field-help{font-size:12px;color:var(--kt-muted);line-height:1.4}
.kt-field-error{font-size:12px;color:var(--kt-danger);font-weight:600;display:flex;gap:6px;align-items:center}
.kt-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.kt-actions{display:flex;gap:10px;align-items:center;justify-content:flex-end;margin-top:18px;flex-wrap:wrap}
.kt-actions-start{justify-content:flex-start}
.kt-actions-stretch{align-items:stretch}
.kt-actions-stretch .kt-button{flex:1}
.kt-actions-spread{justify-content:space-between}
.kt-form-row{display:grid;gap:14px}
.kt-form-actions{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:18px;flex-wrap:wrap}
/* ============ Buttons ============ */
.kt-button{appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;font:inherit;font-size:14px;font-weight:600;padding:11px 18px;border-radius:var(--kt-radius-sm);border:1px solid transparent;background:var(--kt-bg-strong);color:var(--kt-text);cursor:pointer;transition:background .15s,color .15s,transform .12s,border-color .15s,box-shadow .15s;white-space:nowrap}
.kt-button:hover{transform:translateY(-1px);box-shadow:var(--kt-shadow-sm)}
.kt-button:active{transform:translateY(0)}
.kt-button:disabled{opacity:.55;cursor:not-allowed;transform:none;box-shadow:none}
.kt-button svg{width:16px;height:16px;flex:none}
.kt-primary{background:var(--kt-accent);color:var(--kt-accent-foreground);box-shadow:0 6px 18px color-mix(in srgb,var(--kt-accent) 30%,transparent)}
.kt-primary:hover{background:color-mix(in srgb,var(--kt-accent) 88%,#000);box-shadow:0 8px 22px color-mix(in srgb,var(--kt-accent) 40%,transparent)}
.kt-secondary{background:var(--kt-bg-strong);color:var(--kt-text);border-color:var(--kt-border)}
.kt-secondary:hover{background:color-mix(in srgb,var(--kt-bg-strong) 92%,var(--kt-accent) 8%);border-color:var(--kt-border-strong)}
.kt-danger-button{background:var(--kt-danger);color:#fff;box-shadow:0 6px 18px color-mix(in srgb,var(--kt-danger) 30%,transparent)}
.kt-danger-button:hover{background:color-mix(in srgb,var(--kt-danger) 90%,#000);box-shadow:0 8px 22px color-mix(in srgb,var(--kt-danger) 40%,transparent)}
.kt-ghost-button{background:transparent;color:var(--kt-muted)}
.kt-ghost-button:hover{color:var(--kt-text);background:var(--kt-bg-strong)}
.kt-link-button{appearance:none;background:none;border:0;padding:4px 8px;color:var(--kt-accent);font:inherit;font-size:13px;font-weight:700;cursor:pointer;border-radius:6px;transition:background .15s,color .15s}
.kt-link-button:hover{background:var(--kt-accent-soft);text-decoration:underline}
.kt-link-button:disabled{opacity:.55;cursor:not-allowed}
.kt-text-link{appearance:none;border:0;background:none;color:var(--kt-accent);font:inherit;font-size:13px;font-weight:700;cursor:pointer;padding:0;text-decoration:none}
.kt-text-link:hover{text-decoration:underline}
.kt-text-link:disabled{opacity:.55;cursor:not-allowed}
.kt-button-sm{padding:7px 12px;font-size:13px;border-radius:8px}

/* ============ Section / Cards ============ */
.kt-section{background:var(--kt-bg);border:1px solid var(--kt-border);border-radius:14px;margin-bottom:16px;overflow:hidden;transition:border-color .18s,box-shadow .18s,transform .18s}
.kt-section:hover{border-color:var(--kt-border-strong)}
.kt-section-head{padding:18px 22px 12px;display:flex;align-items:flex-start;justify-content:space-between;gap:14px;border-bottom:1px solid var(--kt-border);background:color-mix(in srgb,var(--kt-bg) 92%,var(--kt-text) 2%)}
.kt-section-title{font-size:15px;font-weight:700;margin:0;color:var(--kt-text-strong);display:flex;align-items:center;gap:8px}
.kt-section-title svg{width:16px;height:16px;color:var(--kt-accent)}
.kt-section-copy{margin:4px 0 0;font-size:12.5px;color:var(--kt-muted);line-height:1.5}
.kt-section-body{padding:18px 22px 20px}
.kt-section-actions{display:flex;gap:8px;align-items:center}

/* ============ Notice ============ */
.kt-notice{display:flex;align-items:flex-start;gap:10px;margin:0 0 16px;padding:11px 14px;border-radius:11px;font-size:13px;border:1px solid transparent;animation:kt-fade-up .25s ease}
.kt-notice svg{width:16px;height:16px;flex:none;margin-top:1px}
.kt-notice strong{font-weight:700}
.kt-notice p{margin:0;line-height:1.5}
.kt-notice-close{margin-left:auto;background:none;border:0;cursor:pointer;color:inherit;opacity:.6;padding:2px;display:grid;place-items:center}
.kt-notice-close:hover{opacity:1}
.kt-notice-close svg{width:14px;height:14px}
.kt-error{background:var(--kt-danger-soft);color:color-mix(in srgb,var(--kt-danger) 90%,#000);border-color:color-mix(in srgb,var(--kt-danger) 30%,transparent)}
.kt-success{background:var(--kt-success-soft);color:color-mix(in srgb,var(--kt-success) 90%,#000);border-color:color-mix(in srgb,var(--kt-success) 30%,transparent)}
.kt-info{background:var(--kt-accent-soft);color:color-mix(in srgb,var(--kt-accent) 90%,#000);border-color:color-mix(in srgb,var(--kt-accent) 25%,transparent)}
/* ============ Sessions ============ */
.kt-session-list{display:grid;gap:10px}
.kt-session{display:flex;align-items:flex-start;gap:14px;padding:14px 16px;background:var(--kt-bg-elev);border:1px solid var(--kt-border);border-radius:13px;transition:border-color .15s,box-shadow .15s,background .15s}
.kt-session:hover{border-color:var(--kt-border-strong);box-shadow:var(--kt-shadow-sm)}
.kt-session[data-current="true"]{border-color:color-mix(in srgb,var(--kt-accent) 40%,transparent);background:color-mix(in srgb,var(--kt-accent) 4%,var(--kt-bg-elev))}
.kt-session-icon{width:42px;height:42px;border-radius:11px;background:color-mix(in srgb,var(--kt-accent) 12%,var(--kt-bg-strong));color:var(--kt-accent);display:grid;place-items:center;flex:none;font-size:18px}
.kt-session[data-current="true"] .kt-session-icon{background:color-mix(in srgb,var(--kt-accent) 20%,var(--kt-bg));color:var(--kt-accent)}
.kt-session-icon svg{width:20px;height:20px}
.kt-session-main{flex:1;min-width:0}
.kt-session-name{font-size:14px;font-weight:700;color:var(--kt-text-strong);display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.kt-session-meta{margin-top:4px;font-size:12.5px;color:var(--kt-muted);display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.kt-session-meta-item{display:inline-flex;align-items:center;gap:4px}
.kt-session-meta-item svg{width:12px;height:12px}
.kt-current{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;background:var(--kt-success-soft);color:color-mix(in srgb,var(--kt-success) 80%,#000);border-radius:999px;font-size:10.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
.kt-current::before{content:"";width:5px;height:5px;border-radius:50%;background:currentColor;box-shadow:0 0 0 2px color-mix(in srgb,currentColor 30%,transparent);animation:kt-pulse 2.4s ease-in-out infinite}
.kt-session-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
.kt-sessions-toolbar{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap}
.kt-sessions-count{font-size:12px;color:var(--kt-muted);font-weight:600}
.kt-sessions-search{position:relative;flex:1;min-width:160px;max-width:280px}
.kt-sessions-search .kt-input{padding-left:36px}
.kt-sessions-search .kt-icon-search{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--kt-muted);pointer-events:none}
.kt-sessions-search .kt-icon-search svg{width:15px;height:15px}

/* ============ Skeleton ============ */
.kt-skeleton{height:62px;border-radius:13px;background:linear-gradient(90deg,color-mix(in srgb,var(--kt-text) 6%,var(--kt-bg)) 0%,color-mix(in srgb,var(--kt-text) 12%,var(--kt-bg)) 50%,color-mix(in srgb,var(--kt-text) 6%,var(--kt-bg)) 100%);background-size:200% 100%;animation:kt-shimmer 1.4s linear infinite}
.kt-skeleton-sm{height:14px;border-radius:6px;width:60%}
.kt-skeleton-line{display:grid;gap:6px;padding:6px 0}
.kt-skel-bar{display:inline-block;width:72px;height:12px;border-radius:999px;background:color-mix(in srgb,var(--kt-text) 8%,var(--kt-bg));animation:kt-shimmer 1.4s linear infinite;background-size:200% 100%}
.kt-avatar-skeleton{background:color-mix(in srgb,var(--kt-text) 8%,var(--kt-bg))!important;box-shadow:none;color:transparent!important}
.kt-user-skeleton{pointer-events:none;opacity:.85}

/* ============ Empty state ============ */
.kt-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 18px;text-align:center;gap:8px;color:var(--kt-muted);border:1px dashed var(--kt-border);border-radius:12px;background:color-mix(in srgb,var(--kt-bg) 80%,var(--kt-text) 2%)}
.kt-empty svg{width:32px;height:32px;color:var(--kt-muted-2);margin-bottom:4px}
.kt-empty p{margin:0;font-size:13px}
.kt-empty strong{color:var(--kt-text);font-size:14px}

/* ============ Confirm dialog ============ */
.kt-confirm{margin-top:14px;padding:16px 18px;border:1px solid color-mix(in srgb,var(--kt-danger) 25%,transparent);border-radius:12px;background:color-mix(in srgb,var(--kt-danger) 5%,var(--kt-bg));animation:kt-fade-up .25s ease}
.kt-confirm-head{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}
.kt-confirm-head .kt-confirm-icon{width:32px;height:32px;border-radius:9px;background:var(--kt-danger-soft);color:var(--kt-danger);display:grid;place-items:center;flex:none}
.kt-confirm-head .kt-confirm-icon svg{width:16px;height:16px}
.kt-confirm-head h4{margin:0;font-size:14px;font-weight:700;color:var(--kt-text-strong)}
.kt-confirm-head p{margin:2px 0 0;font-size:12.5px;color:var(--kt-muted)}
.kt-confirm-actions{display:flex;gap:8px;justify-content:flex-end}
/* ============ Hub (Account home) ============ */
.kt-hub{display:grid;gap:16px}
.kt-hub-hero{display:flex;align-items:center;gap:18px;padding:22px;border-radius:18px;background:linear-gradient(135deg,color-mix(in srgb,var(--kt-accent) 92%,#000) 0%,color-mix(in srgb,var(--kt-accent-2) 88%,#000) 100%);color:var(--kt-accent-foreground);position:relative;overflow:hidden;box-shadow:0 18px 40px color-mix(in srgb,var(--kt-accent) 35%,transparent)}
.kt-hub-hero::before,.kt-hub-hero::after{content:"";position:absolute;border-radius:50%;background:rgba(255,255,255,.14);pointer-events:none}
.kt-hub-hero::before{width:160px;height:160px;top:-60px;right:-50px}
.kt-hub-hero::after{width:100px;height:100px;bottom:-40px;right:60px;background:rgba(255,255,255,.08)}
.kt-hub-hero .kt-avatar-lg{box-shadow:inset 0 0 0 3px rgba(255,255,255,.35),0 12px 28px rgba(0,0,0,.25);position:relative;z-index:1}
.kt-hub-hero-copy{flex:1;min-width:0;position:relative;z-index:1}
.kt-hub-hero-name{font-size:20px;font-weight:800;letter-spacing:-.01em;margin:0;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.kt-hub-hero-name .kt-badge{display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,.18);color:#fff;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;backdrop-filter:blur(6px)}
.kt-hub-hero-email{font-size:13px;opacity:.85;margin:4px 0 0}
.kt-hub-hero-stats{display:flex;gap:24px;margin-top:14px;flex-wrap:wrap}
.kt-hub-stat{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;opacity:.85}
.kt-hub-stat strong{display:block;font-size:20px;font-weight:800;letter-spacing:-.01em;margin-top:2px;color:#fff}
.kt-hub-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.kt-hub-card{display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:18px;background:var(--kt-bg-elev);border:1px solid var(--kt-border);border-radius:14px;text-align:left;cursor:pointer;font:inherit;color:var(--kt-text);transition:border-color .15s,box-shadow .15s,transform .15s,background .15s;position:relative;overflow:hidden}
.kt-hub-card:hover{border-color:color-mix(in srgb,var(--kt-accent) 30%,var(--kt-border));box-shadow:var(--kt-shadow-md);transform:translateY(-2px)}
.kt-hub-card-icon{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;background:color-mix(in srgb,var(--kt-accent) 12%,var(--kt-bg));color:var(--kt-accent);transition:transform .2s,background .2s}
.kt-hub-card:hover .kt-hub-card-icon{transform:scale(1.06) rotate(-3deg);background:color-mix(in srgb,var(--kt-accent) 20%,var(--kt-bg))}
.kt-hub-card-icon svg{width:18px;height:18px}
.kt-hub-card h3{margin:0;font-size:14px;font-weight:700;color:var(--kt-text-strong)}
.kt-hub-card p{margin:0;font-size:12.5px;color:var(--kt-muted);line-height:1.45}
.kt-hub-card-arrow{position:absolute;top:18px;right:18px;color:var(--kt-muted-2);transition:transform .2s,color .2s}
.kt-hub-card:hover .kt-hub-card-arrow{transform:translateX(3px);color:var(--kt-accent)}
.kt-hub-card-arrow svg{width:16px;height:16px}
.kt-hub-card-meta{margin-top:auto;font-size:11px;color:var(--kt-muted);font-weight:600;letter-spacing:.04em;text-transform:uppercase;display:flex;align-items:center;gap:4px}
.kt-hub-list{display:grid;gap:10px;background:var(--kt-bg-elev);border:1px solid var(--kt-border);border-radius:14px;padding:6px}
.kt-hub-list-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;text-align:left;background:transparent;border:0;cursor:pointer;font:inherit;color:var(--kt-text);transition:background .15s;width:100%}
.kt-hub-list-item:hover{background:var(--kt-bg-strong)}
.kt-hub-list-icon{width:32px;height:32px;border-radius:8px;display:grid;place-items:center;background:color-mix(in srgb,var(--kt-accent) 10%,var(--kt-bg));color:var(--kt-accent);flex:none}
.kt-hub-list-icon svg{width:15px;height:15px}
.kt-hub-list-item-main{flex:1;min-width:0}
.kt-hub-list-item-title{font-size:13.5px;font-weight:600;color:var(--kt-text-strong)}
.kt-hub-list-item-copy{font-size:12px;color:var(--kt-muted);margin-top:1px}
.kt-hub-list-item svg.kt-hub-list-chevron{width:14px;height:14px;color:var(--kt-muted-2);flex:none}
/* ============ Auth (v2) popup ============ */
.kt-auth-dialog{display:block;width:min(440px,100%);height:auto;max-height:none;grid-template-columns:none;overflow:visible}
.kt-auth-shell{position:relative;display:flex;flex-direction:column;height:auto;max-height:min(94dvh,760px);border-radius:var(--kt-radius-lg);background:var(--kt-bg-elev);border:1px solid var(--kt-border);box-shadow:var(--kt-shadow-lg);overflow:hidden}
.kt-auth-banner{position:relative;height:120px;flex:none;background:linear-gradient(135deg,var(--kt-accent) 0%,var(--kt-accent-2) 100%);overflow:hidden}
.kt-auth-banner::before,.kt-auth-banner::after{content:"";position:absolute;border-radius:50%;background:rgba(255,255,255,.14)}
.kt-auth-banner::before{width:180px;height:180px;top:-70px;right:-60px}
.kt-auth-banner::after{width:90px;height:90px;bottom:-30px;right:90px;background:rgba(255,255,255,.08)}
.kt-auth-banner-mark{position:absolute;left:24px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:10px;color:#fff;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
.kt-auth-banner-mark .kt-brand-mark{background:rgba(255,255,255,.22);color:#fff;backdrop-filter:blur(8px);box-shadow:none}
.kt-auth-body{padding:26px 30px 30px;overflow:auto;flex:1}
.kt-auth-title{font-size:22px;font-weight:800;letter-spacing:-.01em;color:var(--kt-text-strong);margin:0 0 6px}
.kt-auth-subtitle{margin:0 0 18px;font-size:13.5px;color:var(--kt-muted);line-height:1.5}
.kt-auth-form{display:grid;gap:14px}
.kt-auth-actions{margin-top:6px}
.kt-auth-actions .kt-button{width:100%;padding:12px 18px;font-size:14.5px;font-weight:700}
.kt-auth-links{display:flex;justify-content:flex-end;margin-top:-4px}
.kt-auth-switch{margin:6px 0 0;text-align:center;font-size:13px;color:var(--kt-muted)}
.kt-auth-switch .kt-text-link{font-weight:600}
.kt-google{width:100%;margin-top:4px;display:flex!important;align-items:center!important;justify-content:center!important;gap:10px;border:1px solid var(--kt-border-strong)!important;background:var(--kt-bg-elev)!important;color:var(--kt-text-strong)!important;font-weight:600!important}
.kt-google:hover{border-color:var(--kt-text-strong)!important}
.kt-google svg{width:18px;height:18px}
.kt-divider{display:flex;align-items:center;gap:10px;margin:8px 0;color:var(--kt-muted-2);font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
.kt-divider::before,.kt-divider::after{content:"";flex:1;height:1px;background:var(--kt-border)}
.kt-otp{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
.kt-otp-input{width:100%;height:52px;text-align:center;font-size:20px;font-weight:700;letter-spacing:.04em;border:1px solid var(--kt-border);border-radius:12px;background:var(--kt-bg);color:var(--kt-text-strong);font-family:inherit;transition:border-color .15s,box-shadow .15s,transform .12s}
.kt-otp-input:hover{border-color:var(--kt-border-strong)}
.kt-otp-input:focus{outline:none;border-color:var(--kt-accent);box-shadow:0 0 0 4px var(--kt-accent-soft);transform:translateY(-1px)}
.kt-otp-input[data-filled="true"]{border-color:color-mix(in srgb,var(--kt-accent) 40%,var(--kt-border));background:color-mix(in srgb,var(--kt-accent) 4%,var(--kt-bg))}

/* Password strength meter */
.kt-strength{margin-top:8px;display:grid;gap:6px}
.kt-strength-bars{display:flex;gap:4px}
.kt-strength-bar{flex:1;height:5px;border-radius:2px;background:var(--kt-bg-strong);transition:background .2s}
.kt-strength-bar[data-level="1"]{background:var(--kt-danger)}
.kt-strength-bar[data-level="2"]{background:var(--kt-warning)}
.kt-strength-bar[data-level="3"]{background:linear-gradient(90deg,var(--kt-warning),color-mix(in srgb,var(--kt-warning) 60%,var(--kt-success)))}
.kt-strength-bar[data-level="4"]{background:var(--kt-success)}
.kt-strength-label{font-size:11px;color:var(--kt-muted);font-weight:600;display:flex;justify-content:space-between;align-items:center}
.kt-strength-label strong{font-weight:700;color:var(--kt-text)}
.kt-auth-hint{margin-top:6px;font-size:12.5px;color:var(--kt-muted);display:flex;align-items:center;justify-content:space-between;gap:8px}
.kt-auth-hint code{background:var(--kt-bg-strong);padding:1px 6px;border-radius:5px;font-size:11.5px;font-weight:700;color:var(--kt-text)}
/* ============ Toast ============ */
.kt-toast-viewport{position:fixed;z-index:2147483647;top:18px;right:18px;left:auto;display:flex;flex-direction:column;gap:10px;max-width:min(380px,calc(100vw - 36px));pointer-events:none}
.kt-toast{position:relative;display:flex;align-items:flex-start;gap:10px;padding:12px 14px;background:var(--kt-bg-elev);border:1px solid var(--kt-border);border-radius:12px;box-shadow:var(--kt-shadow-md);font-size:13px;color:var(--kt-text);pointer-events:auto;overflow:hidden;animation:kt-toast-in .32s cubic-bezier(.2,.8,.2,1);backdrop-filter:blur(8px)}
.kt-toast-icon{flex:none;width:28px;height:28px;border-radius:8px;display:grid;place-items:center;background:var(--kt-bg-strong);color:var(--kt-muted)}
.kt-toast-icon svg{width:16px;height:16px}
.kt-toast-message{flex:1;line-height:1.4;font-weight:500}
.kt-toast-close{background:none;border:0;cursor:pointer;color:var(--kt-muted);padding:3px;border-radius:5px;display:grid;place-items:center;flex:none}
.kt-toast-close:hover{background:var(--kt-bg-strong);color:var(--kt-text)}
.kt-toast-progress{position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--kt-accent);transform-origin:left center;animation:kt-toast-progress linear forwards}
.kt-toast-success{border-color:color-mix(in srgb,var(--kt-success) 30%,var(--kt-border))}
.kt-toast-success .kt-toast-icon{background:var(--kt-success-soft);color:color-mix(in srgb,var(--kt-success) 80%,#000)}
.kt-toast-success .kt-toast-progress{background:var(--kt-success)}
.kt-toast-error{border-color:color-mix(in srgb,var(--kt-danger) 30%,var(--kt-border))}
.kt-toast-error .kt-toast-icon{background:var(--kt-danger-soft);color:color-mix(in srgb,var(--kt-danger) 80%,#000)}
.kt-toast-error .kt-toast-progress{background:var(--kt-danger)}
.kt-toast-info .kt-toast-icon{background:var(--kt-accent-soft);color:var(--kt-accent)}

/* ============ Animations ============ */
@keyframes kt-fade{from{opacity:0}to{opacity:1}}
@keyframes kt-fade-up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes kt-rise{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:none}}
@keyframes kt-sheet{from{transform:translateY(100%)}to{transform:none}}
@keyframes kt-shimmer{to{background-position:-200% 0}}
@keyframes kt-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.2)}}
@keyframes kt-toast-in{from{opacity:0;transform:translateX(20px) scale(.96)}to{opacity:1;transform:none}}
@keyframes kt-toast-progress{from{transform:scaleX(1)}to{transform:scaleX(0)}}
@keyframes kt-spin{to{transform:rotate(360deg)}}
.kt-spin{animation:kt-spin 1s linear infinite}

@media(prefers-reduced-motion:reduce){.kt-root *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}

/* ============ Responsive ============ */
@media(max-width:780px){
  .kt-backdrop{place-items:end center;padding:0;background:color-mix(in srgb,#000 55%,transparent)}
  .kt-dialog{display:flex;flex-direction:column;width:100%;height:min(94dvh,820px);border-radius:24px 24px 0 0;border-bottom:0;animation:kt-sheet .32s cubic-bezier(.2,.8,.2,1);max-width:none}
  .kt-sidebar{display:none}
  .kt-content{height:100%;padding:0}
  .kt-header{padding:18px 22px 14px;flex-direction:column;align-items:flex-start;gap:6px}
  .kt-mobile-head{display:flex;padding:10px 22px 0}
  .kt-title{font-size:20px}
  .kt-subtitle{font-size:13px}
  .kt-view{padding:20px 22px 8px}
  .kt-section-head{padding:14px 16px 10px;flex-direction:column;align-items:flex-start;gap:6px}
  .kt-section-body{padding:14px 16px 16px}
  .kt-hub-grid{grid-template-columns:1fr}
  .kt-hub-hero{flex-direction:column;text-align:left;align-items:flex-start;padding:18px}
  .kt-hub-hero-stats{gap:18px}
  .kt-hub-hero .kt-avatar-lg{width:64px;height:64px;font-size:22px}
  .kt-grid{grid-template-columns:1fr}
  .kt-close{top:14px;right:14px}
  .kt-user-label{display:none}
  .kt-user-button{padding-right:10px}
  .kt-session{padding:12px;gap:12px}
  .kt-session-icon{width:38px;height:38px}
  .kt-sessions-search{max-width:none}
  .kt-sessions-toolbar{flex-direction:column;align-items:stretch}
  .kt-actions{align-items:stretch;flex-direction:column-reverse}
  .kt-actions .kt-button{width:100%}
  .kt-form-actions{flex-direction:column-reverse;align-items:stretch}
  .kt-form-actions .kt-button{width:100%}
  .kt-toast-viewport{top:auto;bottom:18px;right:18px;left:18px;max-width:none}
  .kt-auth-dialog{width:100%;border-radius:24px 24px 0 0;max-height:96dvh}
  .kt-auth-banner{height:96px}
  .kt-auth-body{padding:22px 22px 26px}
  .kt-auth-title{font-size:20px}
  .kt-otp{gap:6px}
  .kt-otp-input{height:48px;font-size:18px}
  .kt-hub-list{padding:4px}
}
`;

export function appearanceStyle(
  appearance?: KnotreeAppearance,
): CSSProperties {
  if (!appearance) return {};
  return {
    "--kt-accent": appearance.accentColor,
    "--kt-accent-2": appearance.accentColor2,
    "--kt-bg": appearance.backgroundColor,
    "--kt-bg-elev": appearance.elevatedColor,
    "--kt-text": appearance.textColor,
    "--kt-text-strong": appearance.textColorStrong,
    "--kt-muted": appearance.mutedColor,
    "--kt-muted-2": appearance.mutedColor2,
    "--kt-border": appearance.borderColor,
    "--kt-border-strong": appearance.borderColorStrong,
    "--kt-danger": appearance.dangerColor,
    "--kt-success": appearance.successColor,
    "--kt-warning": appearance.warningColor,
    "--kt-radius":
      appearance.borderRadius === undefined
        ? undefined
        : `${appearance.borderRadius}px`,
    "--kt-radius-sm":
      appearance.borderRadiusSm === undefined
        ? undefined
        : `${appearance.borderRadiusSm}px`,
    "--kt-radius-lg":
      appearance.borderRadiusLg === undefined
        ? undefined
        : `${appearance.borderRadiusLg}px`,
    "--kt-font": appearance.fontFamily,
  } as CSSProperties;
}
