import type { CSSProperties } from "react";
import type { KnotreeAppearance } from "./types.js";

export const STYLE_ID = "knotree-account-ui";

/**
 * Account UI styles. A calm, hairline-driven visual language grounded in the
 * host's identity (warm paper canvas, solid indigo accent, DM Sans). Light and
 * dark are both first-class; `data-mode` on `.kt-root` forces a side while the
 * default (`auto`) follows the OS via `prefers-color-scheme`. Every public
 * token (`--kt-*`) can be overridden through `appearance` without breaking the
 * layout — derived sub-tokens fall back to the public ones via `color-mix`.
 */
export const accountStyles = String.raw`
/* ============ Tokens — light (default) ============ */
.kt-root{
  --kt-accent:#635bff;
  --kt-accent-2:#7a5cf0;
  --kt-accent-soft:color-mix(in srgb,var(--kt-accent) 12%,transparent);
  --kt-accent-foreground:#ffffff;
  --kt-bg:#faf9f6;
  --kt-bg-elev:#ffffff;
  --kt-bg-soft:color-mix(in srgb,var(--kt-bg-elev) 94%,var(--kt-text) 3%);
  --kt-bg-strong:color-mix(in srgb,var(--kt-bg-elev) 88%,var(--kt-text) 6%);
  --kt-text:#19191d;
  --kt-text-strong:#0c0c0f;
  --kt-muted:#6f6f75;
  --kt-muted-2:#a3a3a8;
  --kt-border:color-mix(in srgb,#19191d 10%,transparent);
  --kt-border-strong:color-mix(in srgb,#19191d 18%,transparent);
  --kt-danger:#d83a3a;
  --kt-danger-soft:color-mix(in srgb,var(--kt-danger) 9%,transparent);
  --kt-success:#1f9d6a;
  --kt-success-soft:color-mix(in srgb,var(--kt-success) 11%,transparent);
  --kt-warning:#c2771a;
  --kt-warning-soft:color-mix(in srgb,var(--kt-warning) 12%,transparent);
  --kt-radius:14px;
  --kt-radius-sm:9px;
  --kt-radius-lg:20px;
  --kt-shadow-sm:0 1px 2px rgba(25,25,29,.05);
  --kt-shadow-md:0 2px 10px rgba(25,25,29,.06),0 1px 2px rgba(25,25,29,.04);
  --kt-shadow-lg:0 14px 44px rgba(25,25,29,.12),0 2px 10px rgba(25,25,29,.06);
  --kt-shadow-glow:0 0 0 3px color-mix(in srgb,var(--kt-accent) 18%,transparent);
  --kt-font:"DM Sans",Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  --kt-mono:ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;
  font-family:var(--kt-font);
  color:var(--kt-text);
  box-sizing:border-box;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  font-variant-ligatures:none;
}
.kt-root *,.kt-root *::before,.kt-root *::after{box-sizing:border-box}

/* ============ Tokens — dark (auto via OS) ============ */
@media(prefers-color-scheme:dark){
  .kt-root:not([data-mode="light"]){
    --kt-accent:#8b8bff;
    --kt-accent-2:#a78bfa;
    --kt-accent-soft:color-mix(in srgb,var(--kt-accent) 16%,transparent);
    --kt-accent-foreground:#0e0e10;
    --kt-bg:#0e0e10;
    --kt-bg-elev:#16161a;
    --kt-bg-soft:color-mix(in srgb,var(--kt-bg-elev) 92%,#000 8%);
    --kt-bg-strong:color-mix(in srgb,var(--kt-bg-elev) 84%,#000 16%);
    --kt-text:#f4f3ef;
    --kt-text-strong:#ffffff;
    --kt-muted:#a3a3a8;
    --kt-muted-2:#6f6f75;
    --kt-border:color-mix(in srgb,#ffffff 12%,transparent);
    --kt-border-strong:color-mix(in srgb,#ffffff 22%,transparent);
    --kt-danger:#ff6b6b;
    --kt-danger-soft:color-mix(in srgb,var(--kt-danger) 13%,transparent);
    --kt-success:#4ed09a;
    --kt-success-soft:color-mix(in srgb,var(--kt-success) 14%,transparent);
    --kt-warning:#e0a64a;
    --kt-warning-soft:color-mix(in srgb,var(--kt-warning) 15%,transparent);
    --kt-shadow-sm:0 1px 2px rgba(0,0,0,.4);
    --kt-shadow-md:0 2px 10px rgba(0,0,0,.4),0 1px 2px rgba(0,0,0,.3);
    --kt-shadow-lg:0 18px 52px rgba(0,0,0,.55),0 2px 10px rgba(0,0,0,.4);
    --kt-shadow-glow:0 0 0 3px color-mix(in srgb,var(--kt-accent) 26%,transparent);
  }
}
/* ============ Tokens — dark (forced) ============ */
.kt-root[data-mode="dark"]{
  --kt-accent:#8b8bff;
  --kt-accent-2:#a78bfa;
  --kt-accent-soft:color-mix(in srgb,var(--kt-accent) 16%,transparent);
  --kt-accent-foreground:#0e0e10;
  --kt-bg:#0e0e10;
  --kt-bg-elev:#16161a;
  --kt-bg-soft:color-mix(in srgb,var(--kt-bg-elev) 92%,#000 8%);
  --kt-bg-strong:color-mix(in srgb,var(--kt-bg-elev) 84%,#000 16%);
  --kt-text:#f4f3ef;
  --kt-text-strong:#ffffff;
  --kt-muted:#a3a3a8;
  --kt-muted-2:#6f6f75;
  --kt-border:color-mix(in srgb,#ffffff 12%,transparent);
  --kt-border-strong:color-mix(in srgb,#ffffff 22%,transparent);
  --kt-danger:#ff6b6b;
  --kt-danger-soft:color-mix(in srgb,var(--kt-danger) 13%,transparent);
  --kt-success:#4ed09a;
  --kt-success-soft:color-mix(in srgb,var(--kt-success) 14%,transparent);
  --kt-warning:#e0a64a;
  --kt-warning-soft:color-mix(in srgb,var(--kt-warning) 15%,transparent);
  --kt-shadow-sm:0 1px 2px rgba(0,0,0,.4);
  --kt-shadow-md:0 2px 10px rgba(0,0,0,.4),0 1px 2px rgba(0,0,0,.3);
  --kt-shadow-lg:0 18px 52px rgba(0,0,0,.55),0 2px 10px rgba(0,0,0,.4);
  --kt-shadow-glow:0 0 0 3px color-mix(in srgb,var(--kt-accent) 26%,transparent);
}

/* ============ User button ============ */
.kt-user-button{
  appearance:none;border:1px solid var(--kt-border);
  background:var(--kt-bg-elev);color:var(--kt-text);
  display:inline-flex;align-items:center;gap:10px;
  border-radius:999px;padding:5px 14px 5px 5px;
  cursor:pointer;font:inherit;font-size:14px;font-weight:600;
  box-shadow:var(--kt-shadow-sm);
  transition:border-color .18s ease,box-shadow .18s ease,color .18s ease;
}
.kt-user-button:hover{border-color:var(--kt-border-strong);box-shadow:var(--kt-shadow-md)}
.kt-user-button:active{box-shadow:var(--kt-shadow-sm)}
.kt-user-button-signed-out{color:var(--kt-accent)}
.kt-user-button-signed-out .kt-avatar{background:var(--kt-accent)}
.kt-root :focus-visible{outline:2px solid color-mix(in srgb,var(--kt-accent) 55%,transparent);outline-offset:2px;border-radius:8px}
.kt-avatar{
  width:34px;height:34px;display:grid;place-items:center;
  border-radius:50%;font-size:13px;font-weight:700;letter-spacing:.01em;
  color:var(--kt-accent-foreground);
  background:var(--kt-accent);
  box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--kt-accent) 70%,#000 30%);
  flex:none;overflow:hidden;position:relative;
}
.kt-avatar img{width:100%;height:100%;object-fit:cover;display:block}
.kt-avatar-lg{width:60px;height:60px;font-size:21px;box-shadow:inset 0 0 0 2px var(--kt-bg-elev),0 0 0 1px color-mix(in srgb,var(--kt-accent) 70%,#000 30%)}
.kt-avatar-xl{width:80px;height:80px;font-size:28px;box-shadow:inset 0 0 0 2px var(--kt-bg-elev),0 0 0 1px color-mix(in srgb,var(--kt-accent) 70%,#000 30%)}
.kt-user-label{font-size:14px;font-weight:600;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--kt-text)}
.kt-chevron{width:15px;height:15px;color:var(--kt-muted-2);transition:transform .18s ease}
.kt-user-button[aria-expanded="true"] .kt-chevron{transform:rotate(180deg)}

/* ============ Backdrop & Dialog ============ */
.kt-backdrop{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:24px;background:color-mix(in srgb,#0a0a0c 42%,transparent);backdrop-filter:blur(8px) saturate(110%);-webkit-backdrop-filter:blur(8px) saturate(110%);animation:kt-fade .22s ease}
.kt-root[data-mode="dark"] .kt-backdrop,.kt-root:not([data-mode="light"]) .kt-backdrop{background:color-mix(in srgb,#000 58%,transparent)}
.kt-dialog{position:relative;display:grid;grid-template-columns:240px minmax(0,1fr);width:min(900px,100%);height:min(680px,calc(100dvh - 48px));overflow:hidden;border:1px solid var(--kt-border);border-radius:var(--kt-radius-lg);background:var(--kt-bg-elev);box-shadow:var(--kt-shadow-lg);animation:kt-rise .28s cubic-bezier(.2,.8,.2,1)}

/* ============ Sidebar ============ */
.kt-sidebar{display:flex;flex-direction:column;padding:20px 12px 16px;background:var(--kt-bg-soft);border-right:1px solid var(--kt-border);position:relative;overflow:hidden}
.kt-brand{display:flex;align-items:center;gap:9px;padding:0 10px 18px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--kt-muted)}
.kt-brand-mark{width:22px;height:22px;border-radius:6px;display:grid;place-items:center;background:var(--kt-accent);color:var(--kt-accent-foreground);font-weight:700;font-size:12px;letter-spacing:0}
.kt-account-mini{display:flex;gap:12px;align-items:center;padding:10px;border-radius:12px;background:var(--kt-bg-elev);border:1px solid var(--kt-border);margin:0 4px 14px}
.kt-account-mini .kt-avatar{flex:none}
.kt-account-copy{min-width:0;flex:1}
.kt-account-name{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--kt-text-strong)}
.kt-account-email{margin-top:2px;font-size:12px;color:var(--kt-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kt-nav{display:grid;gap:2px}
.kt-nav-button{appearance:none;width:100%;display:flex;align-items:center;gap:10px;border:0;border-radius:9px;padding:9px 12px;background:transparent;color:var(--kt-muted);font:inherit;font-size:14px;font-weight:600;text-align:left;cursor:pointer;position:relative;transition:background .15s,color .15s}
.kt-nav-button svg{width:17px;height:17px;flex:none}
.kt-nav-button:hover{background:color-mix(in srgb,var(--kt-text) 5%,transparent);color:var(--kt-text)}
.kt-nav-button[data-active=true]{background:transparent;color:var(--kt-text-strong);font-weight:700}
.kt-nav-button[data-active=true]::before{content:"";position:absolute;left:-2px;top:50%;transform:translateY(-50%);width:2px;height:20px;border-radius:2px;background:var(--kt-accent)}
.kt-nav-badge{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;background:var(--kt-accent-soft);color:var(--kt-accent);border-radius:999px;font-size:11px;font-weight:700}
.kt-sidebar-bottom{margin-top:auto;display:grid;gap:6px;padding-top:14px;border-top:1px solid var(--kt-border)}
.kt-nav-button.kt-signout{color:var(--kt-danger);font-weight:600}
.kt-nav-button.kt-signout:hover{background:var(--kt-danger-soft)}

/* ============ Content / Header ============ */
.kt-content{min-width:0;overflow:auto;padding:0 0 30px;display:flex;flex-direction:column;position:relative}
.kt-content::-webkit-scrollbar{width:10px;height:10px}
.kt-content::-webkit-scrollbar-thumb{background:var(--kt-border-strong);border-radius:5px;border:3px solid var(--kt-bg-elev)}
.kt-content::-webkit-scrollbar-track{background:transparent}
.kt-header{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:14px;padding:24px 32px 18px;background:var(--kt-bg-elev);border-bottom:1px solid var(--kt-border)}
.kt-header-copy{min-width:0;flex:1}
.kt-eyebrow{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--kt-muted-2);margin-bottom:6px}
.kt-title{font-size:24px;font-weight:700;letter-spacing:-.02em;color:var(--kt-text-strong);margin:0 0 4px}
.kt-subtitle{margin:0;font-size:14px;color:var(--kt-muted);line-height:1.5}
.kt-mobile-head{display:none;gap:6px;overflow-x:auto;padding:14px 32px 4px;scrollbar-width:none;border-bottom:1px solid var(--kt-border)}
.kt-mobile-head::-webkit-scrollbar{display:none}
.kt-mobile-head .kt-nav-button{width:auto;white-space:nowrap;padding:8px 12px;font-size:13px}
.kt-mobile-head .kt-nav-button[data-active=true]::before{display:none}
.kt-mobile-head .kt-nav-button[data-active=true]{background:var(--kt-accent-soft);color:var(--kt-accent)}
.kt-close{position:absolute;right:18px;top:18px;z-index:4}
.kt-icon-button{appearance:none;width:34px;height:34px;display:grid;place-items:center;border:1px solid var(--kt-border);border-radius:50%;background:var(--kt-bg-elev);color:var(--kt-muted);cursor:pointer;transition:background .15s,color .15s,border-color .15s}
.kt-icon-button:hover{background:var(--kt-bg-strong);color:var(--kt-text);border-color:var(--kt-border-strong)}
.kt-icon-button svg{width:16px;height:16px}

/* ============ View content ============ */
.kt-view{padding:24px 32px 8px;animation:kt-fade-up .3s cubic-bezier(.2,.8,.2,1)}
.kt-view-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:16px}
.kt-view-head h2{font-size:18px;font-weight:700;margin:0;color:var(--kt-text-strong)}
.kt-view-head p{margin:4px 0 0;font-size:13px;color:var(--kt-muted)}
.kt-view-head .kt-view-actions{display:flex;gap:8px;align-items:center}

/* ============ Form fields ============ */
.kt-field{display:grid;gap:6px}
.kt-field label{font-size:12px;font-weight:600;color:var(--kt-text-strong);letter-spacing:.01em}
.kt-field-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.kt-input{width:100%;font:inherit;font-size:14px;color:var(--kt-text);background:var(--kt-bg-elev);border:1px solid var(--kt-border);border-radius:var(--kt-radius-sm);padding:11px 13px;transition:border-color .15s,box-shadow .15s,background .15s}
.kt-input::placeholder{color:var(--kt-muted-2)}
.kt-input:hover{border-color:var(--kt-border-strong)}
.kt-input:focus{outline:none;border-color:var(--kt-accent);box-shadow:0 0 0 3px var(--kt-accent-soft)}
.kt-input[aria-invalid="true"]{border-color:var(--kt-danger);box-shadow:0 0 0 3px var(--kt-danger-soft)}
.kt-input:disabled{opacity:.55;cursor:not-allowed}
.kt-input-wrap{position:relative}
.kt-input-wrap .kt-input{padding-right:42px}
.kt-input-action{position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:0;cursor:pointer;color:var(--kt-muted-2);padding:6px;border-radius:6px;display:grid;place-items:center;transition:color .15s,background .15s}
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
.kt-button{appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;font:inherit;font-size:14px;font-weight:600;padding:11px 18px;border-radius:var(--kt-radius-sm);border:1px solid transparent;background:var(--kt-bg-strong);color:var(--kt-text);cursor:pointer;transition:background .15s,color .15s,border-color .15s,box-shadow .15s,opacity .15s;white-space:nowrap}
.kt-button:hover{border-color:var(--kt-border-strong)}
.kt-button:active{box-shadow:var(--kt-shadow-sm)}
.kt-button:disabled{opacity:.5;cursor:not-allowed}
.kt-button svg{width:16px;height:16px;flex:none}
.kt-primary{background:var(--kt-accent);color:var(--kt-accent-foreground);border-color:transparent}
.kt-primary:hover{background:color-mix(in srgb,var(--kt-accent) 86%,#000);border-color:transparent}
.kt-primary:active{background:color-mix(in srgb,var(--kt-accent) 78%,#000)}
.kt-secondary{background:var(--kt-bg-elev);color:var(--kt-text);border-color:var(--kt-border)}
.kt-secondary:hover{background:var(--kt-bg-strong);border-color:var(--kt-border-strong)}
.kt-danger-button{background:var(--kt-danger);color:#fff;border-color:transparent}
.kt-danger-button:hover{background:color-mix(in srgb,var(--kt-danger) 86%,#000);border-color:transparent}
.kt-danger-button:active{background:color-mix(in srgb,var(--kt-danger) 78%,#000)}
.kt-ghost-button{background:transparent;color:var(--kt-muted);border-color:transparent}
.kt-ghost-button:hover{color:var(--kt-text);background:var(--kt-bg-strong);border-color:var(--kt-border)}
.kt-link-button{appearance:none;background:none;border:0;padding:4px 8px;color:var(--kt-accent);font:inherit;font-size:13px;font-weight:600;cursor:pointer;border-radius:6px;transition:background .15s,color .15s}
.kt-link-button:hover{background:var(--kt-accent-soft)}
.kt-link-button:disabled{opacity:.5;cursor:not-allowed}
.kt-text-link{appearance:none;border:0;background:none;color:var(--kt-accent);font:inherit;font-size:13px;font-weight:600;cursor:pointer;padding:0;text-decoration:none;transition:color .15s}
.kt-text-link:hover{text-decoration:underline}
.kt-text-link:disabled{opacity:.5;cursor:not-allowed}
.kt-button-sm{padding:7px 12px;font-size:13px;border-radius:8px}

/* ============ Section / Cards ============ */
.kt-section{background:var(--kt-bg-elev);border:1px solid var(--kt-border);border-radius:14px;margin-bottom:16px;overflow:hidden;transition:border-color .18s}
.kt-section:hover{border-color:var(--kt-border-strong)}
.kt-section-head{padding:18px 22px 12px;display:flex;align-items:flex-start;justify-content:space-between;gap:14px;border-bottom:1px solid var(--kt-border);background:var(--kt-bg-soft)}
.kt-section-title{font-size:15px;font-weight:700;margin:0;color:var(--kt-text-strong);display:flex;align-items:center;gap:8px}
.kt-section-title svg{width:16px;height:16px;color:var(--kt-muted)}
.kt-section-copy{margin:4px 0 0;font-size:12.5px;color:var(--kt-muted);line-height:1.5}
.kt-section-body{padding:18px 22px 20px}
.kt-section-actions{display:flex;gap:8px;align-items:center}

/* ============ Notice ============ */
.kt-notice{display:flex;align-items:flex-start;gap:10px;margin:0 0 16px;padding:11px 14px;border-radius:11px;font-size:13px;border:1px solid transparent;animation:kt-fade-up .25s ease}
.kt-notice svg{width:16px;height:16px;flex:none;margin-top:1px}
.kt-notice strong{font-weight:700}
.kt-notice p{margin:0;line-height:1.5}
.kt-notice-close{margin-left:auto;background:none;border:0;cursor:pointer;color:inherit;opacity:.55;padding:2px;display:grid;place-items:center;transition:opacity .15s}
.kt-notice-close:hover{opacity:1}
.kt-notice-close svg{width:14px;height:14px}
.kt-error{background:var(--kt-danger-soft);color:color-mix(in srgb,var(--kt-danger) 82%,var(--kt-text));border-color:color-mix(in srgb,var(--kt-danger) 26%,transparent)}
.kt-success{background:var(--kt-success-soft);color:color-mix(in srgb,var(--kt-success) 80%,var(--kt-text));border-color:color-mix(in srgb,var(--kt-success) 26%,transparent)}
.kt-info{background:var(--kt-accent-soft);color:color-mix(in srgb,var(--kt-accent) 85%,var(--kt-text));border-color:color-mix(in srgb,var(--kt-accent) 22%,transparent)}
/* ============ Sessions ============ */
.kt-session-list{display:grid;gap:10px}
.kt-session{display:flex;align-items:flex-start;gap:14px;padding:14px 16px;background:var(--kt-bg-elev);border:1px solid var(--kt-border);border-radius:12px;transition:border-color .15s,background .15s}
.kt-session:hover{border-color:var(--kt-border-strong)}
.kt-session[data-current="true"]{border-color:color-mix(in srgb,var(--kt-accent) 36%,var(--kt-border));background:color-mix(in srgb,var(--kt-accent) 5%,var(--kt-bg-elev))}
.kt-session-icon{width:40px;height:40px;border-radius:10px;background:var(--kt-bg-strong);color:var(--kt-muted);display:grid;place-items:center;flex:none}
.kt-session[data-current="true"] .kt-session-icon{background:var(--kt-accent-soft);color:var(--kt-accent)}
.kt-session-icon svg{width:19px;height:19px}
.kt-session-main{flex:1;min-width:0}
.kt-session-name{font-size:14px;font-weight:700;color:var(--kt-text-strong);display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.kt-session-meta{margin-top:4px;font-size:12.5px;color:var(--kt-muted);display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.kt-session-meta-item{display:inline-flex;align-items:center;gap:4px}
.kt-session-meta-item svg{width:12px;height:12px;color:var(--kt-muted-2)}
.kt-current{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;background:var(--kt-success-soft);color:color-mix(in srgb,var(--kt-success) 82%,var(--kt-text));border-radius:999px;font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
.kt-current::before{content:"";width:5px;height:5px;border-radius:50%;background:currentColor;box-shadow:0 0 0 2px color-mix(in srgb,currentColor 28%,transparent);animation:kt-pulse 2.4s ease-in-out infinite}
.kt-session-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
.kt-sessions-toolbar{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap}
.kt-sessions-count{font-size:12px;color:var(--kt-muted);font-weight:600}
.kt-sessions-search{position:relative;flex:1;min-width:160px;max-width:280px}
.kt-sessions-search .kt-input{padding-left:36px}
.kt-sessions-search .kt-icon-search{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--kt-muted-2);pointer-events:none}
.kt-sessions-search .kt-icon-search svg{width:15px;height:15px}

/* ============ Skeleton ============ */
.kt-skeleton{height:62px;border-radius:12px;background:linear-gradient(90deg,var(--kt-bg-soft) 0%,var(--kt-bg-strong) 50%,var(--kt-bg-soft) 100%);background-size:200% 100%;animation:kt-shimmer 1.5s linear infinite}
.kt-skeleton-sm{height:14px;border-radius:6px;width:60%}
.kt-skeleton-line{display:grid;gap:6px;padding:6px 0}
.kt-skel-bar{display:inline-block;width:72px;height:12px;border-radius:999px;background:var(--kt-bg-strong);animation:kt-shimmer 1.5s linear infinite;background-size:200% 100%}
.kt-avatar-skeleton{background:var(--kt-bg-strong)!important;box-shadow:none;color:transparent!important}
.kt-user-skeleton{pointer-events:none;opacity:.8}

/* ============ Empty state ============ */
.kt-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 18px;text-align:center;gap:8px;color:var(--kt-muted);border:1px dashed var(--kt-border);border-radius:12px;background:var(--kt-bg-soft)}
.kt-empty svg{width:30px;height:30px;color:var(--kt-muted-2);margin-bottom:4px}
.kt-empty p{margin:0;font-size:13px}
.kt-empty strong{color:var(--kt-text);font-size:14px}

/* ============ Confirm dialog ============ */
.kt-confirm{margin-top:14px;padding:16px 18px;border:1px solid color-mix(in srgb,var(--kt-danger) 24%,transparent);border-radius:12px;background:color-mix(in srgb,var(--kt-danger) 4%,var(--kt-bg-elev));animation:kt-fade-up .25s ease}
.kt-confirm-head{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}
.kt-confirm-head .kt-confirm-icon{width:32px;height:32px;border-radius:9px;background:var(--kt-danger-soft);color:var(--kt-danger);display:grid;place-items:center;flex:none}
.kt-confirm-head .kt-confirm-icon svg{width:16px;height:16px}
.kt-confirm-head h4{margin:0;font-size:14px;font-weight:700;color:var(--kt-text-strong)}
.kt-confirm-head p{margin:2px 0 0;font-size:12.5px;color:var(--kt-muted)}
.kt-confirm-actions{display:flex;gap:8px;justify-content:flex-end}
/* ============ Hub (Account home) ============ */
.kt-hub{display:grid;gap:16px}
.kt-hub-hero{display:flex;align-items:center;gap:18px;padding:22px;border-radius:18px;background:var(--kt-bg-soft);border:1px solid var(--kt-border);position:relative;overflow:hidden}
.kt-hub-hero .kt-avatar-lg{flex:none}
.kt-hub-hero-copy{flex:1;min-width:0}
.kt-hub-hero-name{font-size:21px;font-weight:700;letter-spacing:-.02em;margin:0;color:var(--kt-text-strong);display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.kt-hub-hero-name .kt-badge{display:inline-flex;align-items:center;gap:4px;background:var(--kt-success-soft);color:color-mix(in srgb,var(--kt-success) 82%,var(--kt-text));padding:3px 9px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
.kt-hub-hero-name .kt-badge svg{width:11px;height:11px}
.kt-hub-hero-email{font-size:13px;color:var(--kt-muted);margin:5px 0 0}
.kt-hub-hero-stats{display:flex;gap:0;margin-top:14px;flex-wrap:wrap}
.kt-hub-stat{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--kt-muted-2);padding:0 18px;border-left:1px solid var(--kt-border)}
.kt-hub-stat:first-child{padding-left:0;border-left:0}
.kt-hub-stat strong{display:block;font-size:19px;font-weight:700;letter-spacing:-.01em;margin-top:3px;color:var(--kt-text-strong);text-transform:none}
.kt-hub-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.kt-hub-card{display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:18px;background:var(--kt-bg-elev);border:1px solid var(--kt-border);border-radius:14px;text-align:left;cursor:pointer;font:inherit;color:var(--kt-text);transition:border-color .15s,box-shadow .15s;position:relative;overflow:hidden}
.kt-hub-card:hover{border-color:var(--kt-border-strong);box-shadow:var(--kt-shadow-sm)}
.kt-hub-card-icon{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;background:var(--kt-bg-soft);color:var(--kt-muted);transition:color .2s,background .2s}
.kt-hub-card:hover .kt-hub-card-icon{color:var(--kt-accent);background:var(--kt-accent-soft)}
.kt-hub-card-icon svg{width:18px;height:18px}
.kt-hub-card h3{margin:0;font-size:14px;font-weight:700;color:var(--kt-text-strong)}
.kt-hub-card p{margin:0;font-size:12.5px;color:var(--kt-muted);line-height:1.45}
.kt-hub-card-arrow{position:absolute;top:18px;right:18px;color:var(--kt-muted-2);transition:transform .2s,color .2s}
.kt-hub-card:hover .kt-hub-card-arrow{transform:translateX(3px);color:var(--kt-accent)}
.kt-hub-card-arrow svg{width:16px;height:16px}
.kt-hub-card-meta{margin-top:auto;font-size:11px;color:var(--kt-muted-2);font-weight:600;letter-spacing:.04em;text-transform:uppercase}
.kt-hub-list{display:grid;gap:2px;background:var(--kt-bg-elev);border:1px solid var(--kt-border);border-radius:14px;padding:6px}
.kt-hub-list-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;text-align:left;background:transparent;border:0;cursor:pointer;font:inherit;color:var(--kt-text);transition:background .15s;width:100%}
.kt-hub-list-item:hover{background:var(--kt-bg-soft)}
.kt-hub-list-icon{width:32px;height:32px;border-radius:8px;display:grid;place-items:center;background:var(--kt-bg-soft);color:var(--kt-accent);flex:none}
.kt-hub-list-icon svg{width:15px;height:15px}
.kt-hub-list-item-main{flex:1;min-width:0}
.kt-hub-list-item-title{font-size:13.5px;font-weight:600;color:var(--kt-text-strong)}
.kt-hub-list-item-copy{font-size:12px;color:var(--kt-muted);margin-top:1px}
.kt-hub-list-item svg.kt-hub-list-chevron{width:14px;height:14px;color:var(--kt-muted-2);flex:none}
/* ============ Auth (v2) popup ============ */
.kt-auth-dialog{display:block;width:min(440px,100%);height:auto;max-height:none;grid-template-columns:none;overflow:visible}
.kt-auth-shell{position:relative;display:flex;flex-direction:column;height:auto;max-height:min(94dvh,760px);border-radius:var(--kt-radius-lg);background:var(--kt-bg-elev);border:1px solid var(--kt-border);box-shadow:var(--kt-shadow-lg);overflow:hidden}
.kt-auth-banner{position:relative;height:auto;flex:none;padding:22px 30px;background:var(--kt-bg-soft);border-bottom:1px solid var(--kt-border)}
.kt-auth-banner-mark{display:flex;align-items:center;gap:10px;color:var(--kt-text-strong);font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}
.kt-auth-banner-mark .kt-brand-mark{background:var(--kt-accent);color:var(--kt-accent-foreground)}
.kt-auth-body{padding:28px 30px 32px;overflow:auto;flex:1}
.kt-auth-body::-webkit-scrollbar{width:10px}
.kt-auth-body::-webkit-scrollbar-thumb{background:var(--kt-border-strong);border-radius:5px;border:3px solid var(--kt-bg-elev)}
.kt-auth-title{font-size:24px;font-weight:700;letter-spacing:-.02em;color:var(--kt-text-strong);margin:0 0 6px}
.kt-auth-subtitle{margin:0 0 18px;font-size:13.5px;color:var(--kt-muted);line-height:1.5}
.kt-auth-form{display:grid;gap:14px}
.kt-auth-actions{margin-top:6px}
.kt-auth-actions .kt-button{width:100%;padding:12px 18px;font-size:14.5px;font-weight:700}
.kt-auth-links{display:flex;justify-content:flex-end;margin-top:-4px}
.kt-auth-switch{margin:6px 0 0;text-align:center;font-size:13px;color:var(--kt-muted)}
.kt-auth-switch .kt-text-link{font-weight:600}
.kt-google{width:100%;margin-top:4px;display:flex!important;align-items:center!important;justify-content:center!important;gap:10px;border:1px solid var(--kt-border)!important;background:var(--kt-bg-elev)!important;color:var(--kt-text-strong)!important;font-weight:600!important}
.kt-google:hover{border-color:var(--kt-border-strong)!important;background:var(--kt-bg-strong)!important}
.kt-google svg{width:18px;height:18px}
.kt-divider{display:flex;align-items:center;gap:10px;margin:8px 0;color:var(--kt-muted-2);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}
.kt-divider::before,.kt-divider::after{content:"";flex:1;height:1px;background:var(--kt-border)}
.kt-otp{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
.kt-otp-input{width:100%;height:52px;text-align:center;font-family:var(--kt-mono);font-size:22px;font-weight:600;letter-spacing:.02em;border:1px solid var(--kt-border);border-radius:10px;background:var(--kt-bg-elev);color:var(--kt-text-strong);font-variant-numeric:tabular-nums;transition:border-color .15s,box-shadow .15s,background .15s}
.kt-otp-input:hover{border-color:var(--kt-border-strong)}
.kt-otp-input:focus{outline:none;border-color:var(--kt-accent);box-shadow:0 0 0 3px var(--kt-accent-soft)}
.kt-otp-input[data-filled="true"]{border-color:color-mix(in srgb,var(--kt-accent) 38%,var(--kt-border));background:color-mix(in srgb,var(--kt-accent) 6%,var(--kt-bg-elev))}

/* Password strength meter */
.kt-strength{margin-top:8px;display:grid;gap:6px}
.kt-strength-bars{display:flex;gap:4px}
.kt-strength-bar{flex:1;height:4px;border-radius:2px;background:var(--kt-bg-strong);transition:background .2s}
.kt-strength-bar[data-level="1"]{background:var(--kt-danger)}
.kt-strength-bar[data-level="2"]{background:var(--kt-warning)}
.kt-strength-bar[data-level="3"]{background:color-mix(in srgb,var(--kt-warning) 45%,var(--kt-success))}
.kt-strength-bar[data-level="4"]{background:var(--kt-success)}
.kt-strength-label{font-size:11px;color:var(--kt-muted);font-weight:600;display:flex;justify-content:space-between;align-items:center}
.kt-strength-label strong{font-weight:700;color:var(--kt-text)}
.kt-auth-hint{margin-top:6px;font-size:12.5px;color:var(--kt-muted);display:flex;align-items:center;justify-content:space-between;gap:8px}
.kt-auth-hint code{font-family:var(--kt-mono);background:var(--kt-bg-strong);padding:2px 7px;border-radius:5px;font-size:11.5px;font-weight:600;color:var(--kt-text)}
/* ============ Toast ============ */
.kt-toast-viewport{position:fixed;z-index:2147483647;top:18px;right:18px;left:auto;display:flex;flex-direction:column;gap:10px;max-width:min(380px,calc(100vw - 36px));pointer-events:none}
.kt-toast{position:relative;display:flex;align-items:flex-start;gap:10px;padding:12px 14px;background:var(--kt-bg-elev);border:1px solid var(--kt-border);border-radius:12px;box-shadow:var(--kt-shadow-md);font-size:13px;color:var(--kt-text);pointer-events:auto;overflow:hidden;animation:kt-toast-in .32s cubic-bezier(.2,.8,.2,1)}
.kt-toast-icon{flex:none;width:28px;height:28px;border-radius:8px;display:grid;place-items:center;background:var(--kt-bg-strong);color:var(--kt-muted)}
.kt-toast-icon svg{width:16px;height:16px}
.kt-toast-message{flex:1;line-height:1.4;font-weight:500}
.kt-toast-close{background:none;border:0;cursor:pointer;color:var(--kt-muted);padding:3px;border-radius:5px;display:grid;place-items:center;flex:none;transition:background .15s,color .15s}
.kt-toast-close:hover{background:var(--kt-bg-strong);color:var(--kt-text)}
.kt-toast-progress{position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--kt-accent);transform-origin:left center;animation:kt-toast-progress linear forwards}
.kt-toast-success{border-color:color-mix(in srgb,var(--kt-success) 28%,var(--kt-border))}
.kt-toast-success .kt-toast-icon{background:var(--kt-success-soft);color:color-mix(in srgb,var(--kt-success) 82%,var(--kt-text))}
.kt-toast-success .kt-toast-progress{background:var(--kt-success)}
.kt-toast-error{border-color:color-mix(in srgb,var(--kt-danger) 28%,var(--kt-border))}
.kt-toast-error .kt-toast-icon{background:var(--kt-danger-soft);color:color-mix(in srgb,var(--kt-danger) 82%,var(--kt-text))}
.kt-toast-error .kt-toast-progress{background:var(--kt-danger)}
.kt-toast-info .kt-toast-icon{background:var(--kt-accent-soft);color:var(--kt-accent)}

/* ============ Animations ============ */
@keyframes kt-fade{from{opacity:0}to{opacity:1}}
@keyframes kt-fade-up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes kt-rise{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:none}}
@keyframes kt-sheet{from{transform:translateY(100%)}to{transform:none}}
@keyframes kt-shimmer{to{background-position:-200% 0}}
@keyframes kt-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(1.25)}}
@keyframes kt-toast-in{from{opacity:0;transform:translateX(20px) scale(.96)}to{opacity:1;transform:none}}
@keyframes kt-toast-progress{from{transform:scaleX(1)}to{transform:scaleX(0)}}
@keyframes kt-spin{to{transform:rotate(360deg)}}
.kt-spin{animation:kt-spin 1s linear infinite}

@media(prefers-reduced-motion:reduce){.kt-root *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}

/* ============ Responsive ============ */
@media(max-width:780px){
  .kt-backdrop{place-items:end center;padding:0;background:color-mix(in srgb,#0a0a0c 50%,transparent)}
  .kt-root[data-mode="dark"] .kt-backdrop,.kt-root:not([data-mode="light"]) .kt-backdrop{background:color-mix(in srgb,#000 66%,transparent)}
  .kt-dialog{display:flex;flex-direction:column;width:100%;height:min(94dvh,820px);border-radius:22px 22px 0 0;border-bottom:0;animation:kt-sheet .32s cubic-bezier(.2,.8,.2,1);max-width:none}
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
  .kt-hub-hero{flex-direction:column;text-align:left;align-items:flex-start;padding:18px;gap:14px}
  .kt-hub-hero-stats{gap:0}
  .kt-hub-stat{padding:0 14px}
  .kt-hub-hero .kt-avatar-lg{width:56px;height:56px;font-size:20px}
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
  .kt-auth-dialog{width:100%;border-radius:22px 22px 0 0;max-height:96dvh}
  .kt-auth-banner{padding:18px 22px}
  .kt-auth-body{padding:24px 22px 28px}
  .kt-auth-title{font-size:21px}
  .kt-otp{gap:6px}
  .kt-otp-input{height:48px;font-size:19px}
  .kt-hub-list{padding:4px}
}
@media(max-width:400px){
  .kt-hub-stat{padding:0 10px}
  .kt-otp{gap:4px}
  .kt-otp-input{height:44px;font-size:18px;border-radius:8px}
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
