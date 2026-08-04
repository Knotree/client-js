import type { CSSProperties } from "react";
import type { KnotreeAppearance } from "./types.js";

export const STYLE_ID = "knotree-account-ui";

/**
 * Account UI — single cohesive system aligned with DESIGN_SPEC.md
 *
 * Dark graphite shell (nav rail + workspace) is the product default.
 * Light mode is a first-class inverse using the same structure and tokens.
 * `data-mode` on `.kt-root` forces a side; default (`auto`) follows the OS.
 * Public tokens (`--kt-*`) remain overridable through `appearance`.
 */
export const accountStyles = String.raw`
/* ============ Tokens — dark (default / DESIGN_SPEC) ============ */
.kt-root{
  --kt-page-bg:#0b0c0c;
  --kt-shell-bg:#20211f;
  --kt-sidebar-bg:#171817;
  --kt-surface-1:#2a2b29;
  --kt-surface-2:#181918;
  --kt-surface-hover:#323330;
  --kt-border:#42433f;
  --kt-border-soft:#363733;
  --kt-text:#b9b9b3;
  --kt-text-strong:#f4f4f1;
  --kt-muted:#b9b9b3;
  --kt-muted-2:#858680;
  --kt-accent:#58a9f8;
  --kt-accent-2:#58a9f8;
  --kt-accent-soft:#07396d;
  --kt-accent-foreground:#f4f4f1;
  --kt-accent-bg:#07396d;
  --kt-danger:#ff716c;
  --kt-danger-soft:color-mix(in srgb,var(--kt-danger) 14%,transparent);
  --kt-success:#4ade80;
  --kt-success-soft:color-mix(in srgb,var(--kt-success) 14%,transparent);
  --kt-warning:#fbbf24;
  --kt-warning-soft:color-mix(in srgb,var(--kt-warning) 14%,transparent);
  --kt-focus:#8cc7ff;
  --kt-bg:var(--kt-shell-bg);
  --kt-bg-elev:var(--kt-surface-1);
  --kt-bg-soft:var(--kt-surface-2);
  --kt-bg-strong:var(--kt-surface-hover);
  --kt-sidebar:var(--kt-sidebar-bg);
  --kt-sidebar-elev:var(--kt-surface-2);
  --kt-sidebar-text:var(--kt-text-strong);
  --kt-sidebar-muted:var(--kt-muted);
  --kt-sidebar-border:var(--kt-border-soft);
  --kt-sidebar-active:#2d2e2b;
  --kt-sidebar-active-border:#43443f;
  --kt-switch-off:#555752;
  --kt-switch-knob:#2c2d2b;
  --kt-signout-border:#575853;
  --kt-row-hover:rgba(255,255,255,.025);
  --kt-radius:14px;
  --kt-radius-sm:10px;
  --kt-radius-lg:19px;
  --kt-radius-control:10px;
  --kt-shadow-sm:0 1px 2px rgba(0,0,0,.35);
  --kt-shadow-md:0 8px 24px rgba(0,0,0,.4);
  --kt-shadow-lg:0 28px 70px rgba(0,0,0,.45);
  --kt-shadow-glow:0 0 0 3px color-mix(in srgb,var(--kt-focus) 40%,transparent);
  --kt-font:Inter,"SF Pro Text","Segoe UI",Arial,sans-serif;
  --kt-display:var(--kt-font);
  --kt-mono:ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;
  font-family:var(--kt-font);
  color:var(--kt-text);
  box-sizing:border-box;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}
.kt-root *,.kt-root *::before,.kt-root *::after{box-sizing:border-box}

/* Light mode — OS preference when mode is auto */
@media(prefers-color-scheme:light){
  .kt-root:not([data-mode="dark"]){
    --kt-page-bg:#e8e9e6;
    --kt-shell-bg:#f7f7f4;
    --kt-sidebar-bg:#efefeb;
    --kt-surface-1:#ffffff;
    --kt-surface-2:#f0f0ec;
    --kt-surface-hover:#e4e5e0;
    --kt-border:#c9cac4;
    --kt-border-soft:#d8d9d3;
    --kt-text:#4a4b46;
    --kt-text-strong:#1a1b18;
    --kt-muted:#5c5d57;
    --kt-muted-2:#858680;
    --kt-accent:#2563eb;
    --kt-accent-2:#2563eb;
    --kt-accent-soft:#dbeafe;
    --kt-accent-foreground:#ffffff;
    --kt-accent-bg:#dbeafe;
    --kt-danger:#dc4a45;
    --kt-danger-soft:color-mix(in srgb,var(--kt-danger) 12%,transparent);
    --kt-success:#15803d;
    --kt-success-soft:color-mix(in srgb,var(--kt-success) 12%,transparent);
    --kt-warning:#b45309;
    --kt-warning-soft:color-mix(in srgb,var(--kt-warning) 12%,transparent);
    --kt-focus:#2563eb;
    --kt-bg:var(--kt-shell-bg);
    --kt-bg-elev:var(--kt-surface-1);
    --kt-bg-soft:var(--kt-surface-2);
    --kt-bg-strong:var(--kt-surface-hover);
    --kt-sidebar:var(--kt-sidebar-bg);
    --kt-sidebar-elev:var(--kt-surface-1);
    --kt-sidebar-text:var(--kt-text-strong);
    --kt-sidebar-muted:var(--kt-muted);
    --kt-sidebar-border:var(--kt-border-soft);
    --kt-sidebar-active:#e4e5e0;
    --kt-sidebar-active-border:#c9cac4;
    --kt-switch-off:#a8a9a3;
    --kt-switch-knob:#ffffff;
    --kt-signout-border:#a8a9a3;
    --kt-row-hover:rgba(0,0,0,.03);
    --kt-shadow-sm:0 1px 2px rgba(26,27,24,.06);
    --kt-shadow-md:0 8px 24px rgba(26,27,24,.1);
    --kt-shadow-lg:0 28px 70px rgba(26,27,24,.18);
    --kt-shadow-glow:0 0 0 3px color-mix(in srgb,var(--kt-focus) 28%,transparent);
  }
}

/* Forced light */
.kt-root[data-mode="light"]{
  --kt-page-bg:#e8e9e6;
  --kt-shell-bg:#f7f7f4;
  --kt-sidebar-bg:#efefeb;
  --kt-surface-1:#ffffff;
  --kt-surface-2:#f0f0ec;
  --kt-surface-hover:#e4e5e0;
  --kt-border:#c9cac4;
  --kt-border-soft:#d8d9d3;
  --kt-text:#4a4b46;
  --kt-text-strong:#1a1b18;
  --kt-muted:#5c5d57;
  --kt-muted-2:#858680;
  --kt-accent:#2563eb;
  --kt-accent-2:#2563eb;
  --kt-accent-soft:#dbeafe;
  --kt-accent-foreground:#ffffff;
  --kt-accent-bg:#dbeafe;
  --kt-danger:#dc4a45;
  --kt-danger-soft:color-mix(in srgb,var(--kt-danger) 12%,transparent);
  --kt-success:#15803d;
  --kt-success-soft:color-mix(in srgb,var(--kt-success) 12%,transparent);
  --kt-warning:#b45309;
  --kt-warning-soft:color-mix(in srgb,var(--kt-warning) 12%,transparent);
  --kt-focus:#2563eb;
  --kt-bg:var(--kt-shell-bg);
  --kt-bg-elev:var(--kt-surface-1);
  --kt-bg-soft:var(--kt-surface-2);
  --kt-bg-strong:var(--kt-surface-hover);
  --kt-sidebar:var(--kt-sidebar-bg);
  --kt-sidebar-elev:var(--kt-surface-1);
  --kt-sidebar-text:var(--kt-text-strong);
  --kt-sidebar-muted:var(--kt-muted);
  --kt-sidebar-border:var(--kt-border-soft);
  --kt-sidebar-active:#e4e5e0;
  --kt-sidebar-active-border:#c9cac4;
  --kt-switch-off:#a8a9a3;
  --kt-switch-knob:#ffffff;
  --kt-signout-border:#a8a9a3;
  --kt-row-hover:rgba(0,0,0,.03);
  --kt-shadow-sm:0 1px 2px rgba(26,27,24,.06);
  --kt-shadow-md:0 8px 24px rgba(26,27,24,.1);
  --kt-shadow-lg:0 28px 70px rgba(26,27,24,.18);
  --kt-shadow-glow:0 0 0 3px color-mix(in srgb,var(--kt-focus) 28%,transparent);
}

/* Forced dark re-asserts DESIGN_SPEC tokens when OS is light */
.kt-root[data-mode="dark"]{
  --kt-page-bg:#0b0c0c;
  --kt-shell-bg:#20211f;
  --kt-sidebar-bg:#171817;
  --kt-surface-1:#2a2b29;
  --kt-surface-2:#181918;
  --kt-surface-hover:#323330;
  --kt-border:#42433f;
  --kt-border-soft:#363733;
  --kt-text:#b9b9b3;
  --kt-text-strong:#f4f4f1;
  --kt-muted:#b9b9b3;
  --kt-muted-2:#858680;
  --kt-accent:#58a9f8;
  --kt-accent-2:#58a9f8;
  --kt-accent-soft:#07396d;
  --kt-accent-foreground:#f4f4f1;
  --kt-accent-bg:#07396d;
  --kt-danger:#ff716c;
  --kt-danger-soft:color-mix(in srgb,var(--kt-danger) 14%,transparent);
  --kt-success:#4ade80;
  --kt-success-soft:color-mix(in srgb,var(--kt-success) 14%,transparent);
  --kt-warning:#fbbf24;
  --kt-warning-soft:color-mix(in srgb,var(--kt-warning) 14%,transparent);
  --kt-focus:#8cc7ff;
  --kt-bg:var(--kt-shell-bg);
  --kt-bg-elev:var(--kt-surface-1);
  --kt-bg-soft:var(--kt-surface-2);
  --kt-bg-strong:var(--kt-surface-hover);
  --kt-sidebar:var(--kt-sidebar-bg);
  --kt-sidebar-elev:var(--kt-surface-2);
  --kt-sidebar-text:var(--kt-text-strong);
  --kt-sidebar-muted:var(--kt-muted);
  --kt-sidebar-border:var(--kt-border-soft);
  --kt-sidebar-active:#2d2e2b;
  --kt-sidebar-active-border:#43443f;
  --kt-switch-off:#555752;
  --kt-switch-knob:#2c2d2b;
  --kt-signout-border:#575853;
  --kt-row-hover:rgba(255,255,255,.025);
  --kt-shadow-sm:0 1px 2px rgba(0,0,0,.35);
  --kt-shadow-md:0 8px 24px rgba(0,0,0,.4);
  --kt-shadow-lg:0 28px 70px rgba(0,0,0,.45);
  --kt-shadow-glow:0 0 0 3px color-mix(in srgb,var(--kt-focus) 40%,transparent);
}

/* Focus treatment — visible on every interactive control */
.kt-root :focus-visible{
  outline:2px solid var(--kt-focus);
  outline-offset:2px;
  border-radius:8px;
}

/* ============ User button ============ */
.kt-user-button{
  appearance:none;border:1px solid var(--kt-border);
  background:var(--kt-bg-elev);color:var(--kt-text-strong);
  display:inline-flex;align-items:center;gap:8px;
  border-radius:999px;padding:4px 12px 4px 4px;
  cursor:pointer;font:inherit;font-size:14px;font-weight:600;
  box-shadow:var(--kt-shadow-sm);
  transition:border-color .16s ease,box-shadow .16s ease,background .16s ease,transform .16s ease;
}
.kt-user-button:hover{border-color:color-mix(in srgb,var(--kt-accent) 40%,var(--kt-border));box-shadow:var(--kt-shadow-md)}
.kt-user-button:active{transform:translateY(1px);box-shadow:var(--kt-shadow-sm)}
.kt-user-button-signed-out{color:var(--kt-accent)}
.kt-user-button-signed-out .kt-avatar{
  background:var(--kt-accent-bg);color:var(--kt-accent);
}
.kt-avatar{
  width:34px;height:34px;display:grid;place-items:center;
  border-radius:50%;font-size:12px;font-weight:600;letter-spacing:.02em;
  color:var(--kt-accent);background:var(--kt-accent-bg);
  flex:none;overflow:hidden;position:relative;
}
.kt-avatar img{width:100%;height:100%;object-fit:cover;display:block}
.kt-avatar-lg{width:44px;height:44px;font-size:15px;font-weight:600}
.kt-avatar-xl{width:64px;height:64px;font-size:20px}
.kt-user-button .kt-avatar{width:30px;height:30px;font-size:11px}
.kt-user-label{
  font-size:14px;font-weight:600;max-width:160px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--kt-text-strong);
}
.kt-chevron{width:15px;height:15px;color:var(--kt-muted-2);transition:transform .2s ease}
.kt-user-button[aria-expanded="true"] .kt-chevron{transform:rotate(180deg)}

/* ============ Backdrop & Dialog shell ============ */
.kt-backdrop{
  position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;
  padding:12px;background:rgba(11,12,12,.82);
  animation:kt-fade .22s ease;
}
.kt-root[data-mode="light"] .kt-backdrop{background:rgba(11,12,12,.48)}
@media(prefers-color-scheme:light){
  .kt-root:not([data-mode="dark"]) .kt-backdrop{background:rgba(11,12,12,.48)}
}
.kt-dialog{
  position:relative;display:grid;grid-template-columns:234px minmax(0,1fr);
  width:min(742px,100%);height:min(692px,calc(100dvh - 24px));
  overflow:hidden;border:1px solid var(--kt-border);border-radius:var(--kt-radius-lg);
  background:var(--kt-shell-bg);box-shadow:var(--kt-shadow-lg);
  animation:kt-dialog-in .22s ease;
}

/* ============ Sidebar ============ */
.kt-sidebar{
  display:flex;flex-direction:column;padding:24px 14px 14px;
  background:var(--kt-sidebar-bg);border-right:1px solid var(--kt-border-soft);
  position:relative;overflow:hidden;z-index:1;color:var(--kt-sidebar-text);
}
.kt-brand{
  display:flex;align-items:center;gap:9px;padding:0 10px 24px;
  font-size:14px;font-weight:600;color:var(--kt-sidebar-muted);
}
.kt-brand-mark{
  width:24px;height:24px;border-radius:6px;display:grid;place-items:center;
  background:var(--kt-surface-2);border:1px solid var(--kt-border);
  color:var(--kt-text-strong);font-weight:700;font-size:12px;
}
.kt-account-mini{
  display:flex;gap:10px;align-items:center;padding:10px 8px;
  margin:0 2px 24px;background:transparent;border:0;
}
.kt-account-mini .kt-avatar{
  width:42px;height:42px;border-radius:50%;
  background:var(--kt-accent-bg);color:var(--kt-accent);font-size:15px;font-weight:600;
}
.kt-account-copy{min-width:0;flex:1}
.kt-account-name{
  font-size:15px;font-weight:650;color:var(--kt-sidebar-text);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.kt-account-email{
  margin-top:2px;font-size:13px;color:var(--kt-muted-2);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.kt-nav{display:grid;gap:4px}
.kt-nav-button{
  appearance:none;width:100%;min-height:36px;display:flex;align-items:center;gap:10px;
  border:1px solid transparent;border-radius:var(--kt-radius-control);padding:8px 11px;
  background:transparent;color:var(--kt-sidebar-muted);
  font:inherit;font-size:15px;font-weight:600;text-align:left;cursor:pointer;
  transition:background .15s,color .15s,border-color .15s;
}
.kt-nav-button svg{width:18px;height:18px;flex:none}
.kt-nav-button:hover{background:var(--kt-surface-hover);color:var(--kt-sidebar-text)}
.kt-nav-button[data-active="true"]{
  background:var(--kt-sidebar-active);border-color:var(--kt-sidebar-active-border);
  color:var(--kt-sidebar-text);font-weight:600;
}
.kt-nav-badge{
  margin-left:auto;display:inline-flex;align-items:center;justify-content:center;
  min-width:20px;height:20px;padding:0 6px;
  background:var(--kt-accent-bg);color:var(--kt-accent);
  border-radius:999px;font-size:11px;font-weight:700;
}
.kt-sidebar-bottom{
  margin-top:auto;display:grid;gap:6px;padding-top:12px;
  border-top:1px solid var(--kt-sidebar-border);
}
.kt-nav-button.kt-signout{color:var(--kt-danger);font-weight:600}
.kt-nav-button.kt-signout:hover{background:transparent;color:var(--kt-danger)}

/* ============ Content / Header ============ */
.kt-content{
  min-width:0;overflow:auto;padding:0 0 24px;
  display:flex;flex-direction:column;position:relative;z-index:1;
  background:var(--kt-shell-bg);
}
.kt-content::-webkit-scrollbar{width:10px;height:10px}
.kt-content::-webkit-scrollbar-thumb{background:var(--kt-border);border-radius:5px;border:3px solid var(--kt-shell-bg)}
.kt-content::-webkit-scrollbar-track{background:transparent}
.kt-header{
  position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:14px;
  padding:27px 29px 0;background:var(--kt-shell-bg);border:0;
}
.kt-header-copy{min-width:0;flex:1;padding-right:30px}
.kt-eyebrow{font-size:14px;font-weight:500;color:var(--kt-muted-2);margin:0 0 7px}
.kt-title{
  font-size:24px;font-weight:700;letter-spacing:0;color:var(--kt-text-strong);
  margin:0 0 6px;line-height:1.15;
}
.kt-subtitle{margin:0;font-size:15px;color:var(--kt-muted);line-height:1.35}
.kt-mobile-head{
  display:none;gap:6px;overflow-x:auto;padding:14px 22px 4px;
  scrollbar-width:none;border-bottom:1px solid var(--kt-border);background:var(--kt-shell-bg);
}
.kt-mobile-head::-webkit-scrollbar{display:none}
.kt-mobile-head .kt-nav-button{width:auto;white-space:nowrap;padding:8px 12px;font-size:13px;min-height:40px}
.kt-mobile-head .kt-nav-button[data-active="true"]{
  background:var(--kt-accent-soft);color:var(--kt-accent);border-color:transparent;
}
.kt-close{position:absolute;right:16px;top:16px;z-index:8}
.kt-icon-button{
  appearance:none;width:34px;height:34px;display:grid;place-items:center;
  border:1px solid var(--kt-border);border-radius:var(--kt-radius-control);
  background:transparent;color:var(--kt-muted);cursor:pointer;
  transition:background .15s,color .15s,border-color .15s;
}
.kt-icon-button:hover{background:var(--kt-surface-hover);color:var(--kt-text-strong);border-color:var(--kt-border)}
.kt-icon-button svg{width:16px;height:16px}

/* ============ View content ============ */
.kt-view{padding:18px 29px 8px;animation:kt-view-in .22s ease}
.kt-view-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:16px}
.kt-view-head h2{font-size:18px;font-weight:700;margin:0;color:var(--kt-text-strong)}
.kt-view-head p{margin:4px 0 0;font-size:13px;color:var(--kt-muted)}

/* ============ Form fields ============ */
.kt-field{display:grid;gap:6px}
.kt-field label{font-size:12px;font-weight:600;color:var(--kt-text-strong);letter-spacing:.02em}
.kt-field-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.kt-input{
  width:100%;font:inherit;font-size:14px;color:var(--kt-text-strong);
  background:var(--kt-bg-elev);border:1px solid var(--kt-border);
  border-radius:var(--kt-radius-sm);padding:12px 14px;
  transition:border-color .15s,box-shadow .15s,background .15s;
}
.kt-input::placeholder{color:var(--kt-muted-2)}
.kt-input:hover{border-color:color-mix(in srgb,var(--kt-border) 70%,var(--kt-text))}
.kt-input:focus{outline:none;border-color:var(--kt-accent);box-shadow:var(--kt-shadow-glow);background:var(--kt-bg-elev)}
.kt-input[aria-invalid="true"]{border-color:var(--kt-danger);box-shadow:0 0 0 3px var(--kt-danger-soft)}
.kt-input:disabled{opacity:.55;cursor:not-allowed}
.kt-input-wrap{position:relative}
.kt-input-wrap .kt-input{padding-right:42px}
.kt-input-action{
  position:absolute;right:6px;top:50%;transform:translateY(-50%);
  background:none;border:0;cursor:pointer;color:var(--kt-muted-2);
  padding:6px;border-radius:8px;display:grid;place-items:center;
  transition:color .15s,background .15s;
}
.kt-input-action:hover{color:var(--kt-text-strong);background:var(--kt-bg-strong)}
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
.kt-button{
  appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;
  font:inherit;font-size:14px;font-weight:600;padding:11px 18px;
  border-radius:var(--kt-radius-sm);border:1px solid transparent;
  background:var(--kt-bg-strong);color:var(--kt-text-strong);cursor:pointer;
  transition:background .15s,color .15s,border-color .15s,box-shadow .15s,opacity .15s,transform .12s;
  white-space:nowrap;
}
.kt-button:hover{border-color:var(--kt-border)}
.kt-button:active{transform:translateY(1px)}
.kt-button:disabled{opacity:.5;cursor:not-allowed;transform:none}
.kt-button svg{width:16px;height:16px;flex:none}
.kt-primary{background:var(--kt-accent);color:var(--kt-accent-foreground);border-color:transparent}
.kt-primary:hover{filter:brightness(1.06);border-color:transparent}
.kt-primary:active{filter:brightness(.96)}
.kt-secondary{background:transparent;color:var(--kt-text-strong);border-color:var(--kt-border)}
.kt-secondary:hover{background:var(--kt-surface-hover);border-color:var(--kt-border)}
.kt-danger-button{background:var(--kt-danger);color:#fff;border-color:transparent}
.kt-danger-button:hover{filter:brightness(1.05);border-color:transparent}
.kt-ghost-button{background:transparent;color:var(--kt-muted);border-color:transparent}
.kt-ghost-button:hover{color:var(--kt-text-strong);background:var(--kt-surface-hover)}
.kt-link-button{
  appearance:none;background:none;border:0;padding:4px 8px;color:var(--kt-accent);
  font:inherit;font-size:13px;font-weight:600;cursor:pointer;border-radius:8px;
  transition:background .15s,color .15s;
}
.kt-link-button:hover{background:var(--kt-accent-soft)}
.kt-link-button:disabled{opacity:.5;cursor:not-allowed}
.kt-text-link{
  appearance:none;border:0;background:none;color:var(--kt-accent);
  font:inherit;font-size:13px;font-weight:600;cursor:pointer;padding:0;
  text-decoration:none;transition:color .15s;
}
.kt-text-link:hover{text-decoration:underline;text-underline-offset:3px}
.kt-text-link:disabled{opacity:.5;cursor:not-allowed}
.kt-button-sm{padding:7px 12px;font-size:13px;border-radius:8px}

/* ============ Section / Cards ============ */
.kt-section{
  background:var(--kt-bg-elev);border:1px solid var(--kt-border);
  border-radius:var(--kt-radius);margin-bottom:16px;overflow:hidden;
}
.kt-section-head{
  padding:18px 20px 12px;display:flex;align-items:flex-start;justify-content:space-between;
  gap:14px;border-bottom:1px solid var(--kt-border-soft);
}
.kt-section-title{
  font-size:15px;font-weight:700;margin:0;color:var(--kt-text-strong);
  display:flex;align-items:center;gap:8px;
}
.kt-section-title svg{width:16px;height:16px;color:var(--kt-accent)}
.kt-section-copy{margin:4px 0 0;font-size:13px;color:var(--kt-muted);line-height:1.45}
.kt-section-body{padding:18px 20px 20px}
.kt-section-actions{display:flex;gap:8px;align-items:center}

/* ============ Notice ============ */
.kt-notice{
  display:flex;align-items:flex-start;gap:10px;margin:16px 29px 0;padding:12px 14px;
  border-radius:12px;font-size:13px;border:1px solid transparent;animation:kt-fade-up .2s ease;
}
.kt-notice svg{width:16px;height:16px;flex:none;margin-top:1px}
.kt-notice strong{font-weight:700}
.kt-notice p{margin:0;line-height:1.5}
.kt-notice-close{
  margin-left:auto;background:none;border:0;cursor:pointer;color:inherit;
  opacity:.55;padding:2px;display:grid;place-items:center;transition:opacity .15s;
}
.kt-notice-close:hover{opacity:1}
.kt-notice-close svg{width:14px;height:14px}
.kt-error{background:var(--kt-danger-soft);color:var(--kt-danger);border-color:color-mix(in srgb,var(--kt-danger) 26%,transparent)}
.kt-success{background:var(--kt-success-soft);color:var(--kt-success);border-color:color-mix(in srgb,var(--kt-success) 26%,transparent)}
.kt-info{background:var(--kt-accent-soft);color:var(--kt-accent);border-color:color-mix(in srgb,var(--kt-accent) 22%,transparent)}

/* ============ Sessions ============ */
.kt-session-list{display:grid;gap:10px}
.kt-session{
  display:flex;align-items:flex-start;gap:14px;padding:14px 16px;
  background:var(--kt-bg-elev);border:1px solid var(--kt-border);border-radius:var(--kt-radius);
  transition:border-color .15s,background .15s;
}
.kt-session:hover{border-color:color-mix(in srgb,var(--kt-border) 60%,var(--kt-text))}
.kt-session[data-current="true"]{
  border-color:color-mix(in srgb,var(--kt-accent) 40%,var(--kt-border));
  background:color-mix(in srgb,var(--kt-accent) 6%,var(--kt-bg-elev));
  box-shadow:inset 3px 0 0 var(--kt-accent);
}
.kt-session-icon{
  width:42px;height:42px;border-radius:12px;background:var(--kt-bg-soft);
  color:var(--kt-muted);display:grid;place-items:center;flex:none;border:1px solid var(--kt-border);
}
.kt-session[data-current="true"] .kt-session-icon{
  background:var(--kt-accent-soft);color:var(--kt-accent);
  border-color:color-mix(in srgb,var(--kt-accent) 22%,transparent);
}
.kt-session-icon svg{width:19px;height:19px}
.kt-session-main{flex:1;min-width:0}
.kt-session-name{
  font-size:14px;font-weight:700;color:var(--kt-text-strong);
  display:flex;align-items:center;gap:8px;flex-wrap:wrap;
}
.kt-session-meta{
  margin-top:4px;font-size:12.5px;color:var(--kt-muted);
  display:flex;flex-wrap:wrap;gap:10px;align-items:center;
}
.kt-session-meta-item{display:inline-flex;align-items:center;gap:4px}
.kt-session-meta-item svg{width:12px;height:12px;color:var(--kt-muted-2)}
.kt-current{
  display:inline-flex;align-items:center;gap:5px;padding:3px 9px;
  background:var(--kt-success-soft);color:var(--kt-success);
  border-radius:999px;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;
}
.kt-current::before{
  content:"";width:5px;height:5px;border-radius:50%;background:currentColor;
  box-shadow:0 0 0 2px color-mix(in srgb,currentColor 28%,transparent);
  animation:kt-pulse 2.4s ease-in-out infinite;
}
.kt-session-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
.kt-sessions-toolbar{
  display:flex;gap:10px;align-items:center;justify-content:space-between;
  margin-bottom:14px;flex-wrap:wrap;
}
.kt-sessions-count{font-size:12px;color:var(--kt-muted);font-weight:600;letter-spacing:.04em;text-transform:uppercase}
.kt-sessions-search{position:relative;flex:1;min-width:160px;max-width:280px}
.kt-sessions-search .kt-input{padding-left:36px}
.kt-sessions-search .kt-icon-search{
  position:absolute;left:11px;top:50%;transform:translateY(-50%);
  color:var(--kt-muted-2);pointer-events:none;
}
.kt-sessions-search .kt-icon-search svg{width:15px;height:15px}

/* ============ Skeleton ============ */
.kt-skeleton{
  height:62px;border-radius:var(--kt-radius);
  background:linear-gradient(90deg,var(--kt-bg-soft) 0%,var(--kt-bg-strong) 50%,var(--kt-bg-soft) 100%);
  background-size:200% 100%;animation:kt-shimmer 1.5s linear infinite;
}
.kt-skeleton-sm{height:14px;border-radius:6px;width:60%}
.kt-skeleton-line{display:grid;gap:6px;padding:6px 0}
.kt-skel-bar{
  display:inline-block;width:72px;height:12px;border-radius:999px;
  background:var(--kt-bg-strong);animation:kt-shimmer 1.5s linear infinite;background-size:200% 100%;
}
.kt-avatar-skeleton{background:var(--kt-bg-strong)!important;color:transparent!important}
.kt-user-skeleton{pointer-events:none;opacity:.8}

/* ============ Empty state ============ */
.kt-empty{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:32px 18px;text-align:center;gap:8px;color:var(--kt-muted);
  border:1px dashed var(--kt-border);border-radius:var(--kt-radius);background:var(--kt-bg-soft);
}
.kt-empty svg{width:30px;height:30px;color:var(--kt-muted-2);margin-bottom:4px}
.kt-empty p{margin:0;font-size:13px}
.kt-empty strong{color:var(--kt-text-strong);font-size:14px}

/* ============ Confirm dialog ============ */
.kt-confirm{
  margin:14px 29px 0;padding:16px 18px;
  border:1px solid color-mix(in srgb,var(--kt-danger) 24%,transparent);
  border-radius:var(--kt-radius);
  background:color-mix(in srgb,var(--kt-danger) 5%,var(--kt-bg-elev));
  animation:kt-fade-up .2s ease;
}
.kt-view .kt-confirm,.kt-section-body .kt-confirm{margin:14px 0 0}
.kt-hub-confirm{margin:14px 29px 0}
.kt-confirm-head{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}
.kt-confirm-head .kt-confirm-icon{
  width:34px;height:34px;border-radius:10px;background:var(--kt-danger-soft);
  color:var(--kt-danger);display:grid;place-items:center;flex:none;
}
.kt-confirm-head .kt-confirm-icon svg{width:16px;height:16px}
.kt-confirm-head h4{margin:0;font-size:14px;font-weight:700;color:var(--kt-text-strong)}
.kt-confirm-head p{margin:2px 0 0;font-size:12.5px;color:var(--kt-muted)}
.kt-confirm-actions{display:flex;gap:8px;justify-content:flex-end}

/* ============ Account hub (DESIGN_SPEC shell content) ============ */
.kt-account-home{display:grid;gap:20px}
.kt-summary{
  padding:18px 20px;background:var(--kt-surface-2);border-radius:var(--kt-radius);
}
.kt-summary-identity{display:flex;align-items:center;gap:12px}
.kt-summary .kt-avatar-lg{
  width:44px;height:44px;border-radius:50%;
  background:var(--kt-accent-bg);color:var(--kt-accent);font-size:15px;font-weight:600;
}
.kt-summary-copy{min-width:0}
.kt-summary-name{
  display:flex;align-items:center;gap:8px;color:var(--kt-text-strong);
  font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.kt-summary-email{
  margin-top:3px;color:var(--kt-muted);font-size:14px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.kt-badge{
  display:inline-flex;align-items:center;padding:2px 8px;
  background:var(--kt-accent-bg);border-radius:999px;
  color:var(--kt-accent);font-size:11px;font-weight:600;flex:none;
}
.kt-summary-divider{height:1px;margin:16px 0 14px;background:var(--kt-border-soft)}
.kt-summary-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.kt-summary-meta div{display:grid;gap:4px}
.kt-summary-meta span{font-size:12px;color:var(--kt-muted-2)}
.kt-summary-meta strong{font-size:15px;color:var(--kt-text-strong);font-weight:700}

/* Action list */
.kt-action-list{
  border:1px solid var(--kt-border);border-radius:var(--kt-radius);overflow:hidden;
}
.kt-action-row{
  width:100%;min-height:82px;display:flex;align-items:center;gap:14px;
  padding:14px 18px;background:transparent;border:0;
  border-bottom:1px solid var(--kt-border);color:var(--kt-text-strong);
  text-align:left;font:inherit;cursor:pointer;transition:background .15s;
}
.kt-action-row:last-child{border-bottom:0}
.kt-action-row:hover{background:var(--kt-row-hover)}
.kt-action-row:focus-visible,
.kt-nav-button:focus-visible,
.kt-signout-button:focus-visible{
  outline:2px solid var(--kt-focus);outline-offset:-2px;
}
.kt-action-icon{width:20px;display:grid;place-items:center;color:var(--kt-muted);flex:none}
.kt-action-icon svg{width:18px;height:18px}
.kt-action-copy{display:grid;gap:4px;min-width:0;flex:1}
.kt-action-copy strong{font-size:15px;font-weight:700}
.kt-action-copy span{
  font-size:14px;color:var(--kt-muted);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px;
}
.kt-action-status,.kt-action-chevron{color:var(--kt-muted-2);font-size:13px;flex:none}
.kt-action-chevron{width:18px;height:18px;transform:rotate(-90deg)}

/* Toggle switch (DESIGN_SPEC §9) */
.kt-switch{
  width:38px;height:22px;flex:none;padding:2px;border:0;border-radius:999px;
  background:var(--kt-switch-off);transition:background .16s ease;cursor:pointer;
  appearance:none;display:inline-flex;align-items:center;
}
.kt-switch span{
  display:block;width:18px;height:18px;border-radius:50%;
  background:var(--kt-switch-knob);transition:transform .16s ease;
}
.kt-switch[data-checked="true"]{background:var(--kt-accent)}
.kt-switch[data-checked="true"] span{transform:translateX(16px);background:var(--kt-text-strong)}

/* Bottom sign-out section (DESIGN_SPEC §10) */
.kt-signout-section{
  display:flex;align-items:center;justify-content:space-between;gap:16px;
  margin-top:0;padding-top:18px;border-top:1px solid var(--kt-border);color:var(--kt-text-strong);
}
.kt-signout-section div{display:grid;gap:4px}
.kt-signout-section strong{font-size:15px}
.kt-signout-section span{font-size:14px;color:var(--kt-muted)}
.kt-signout-button{
  height:37px;padding:0 16px;border:1px solid var(--kt-signout-border);
  border-radius:9px;background:transparent;color:var(--kt-text-strong);
  font:inherit;font-size:14px;font-weight:650;cursor:pointer;
  transition:background .15s,border-color .15s;
}
.kt-signout-button:hover{background:var(--kt-surface-hover)}
.kt-signout-button:disabled{opacity:.5;cursor:not-allowed}

/* ============ Auth modal ============ */
.kt-auth-dialog{
  display:block;width:min(440px,100%);height:auto;max-height:none;
  grid-template-columns:none;overflow:visible;
}
.kt-auth-shell{
  position:relative;display:flex;flex-direction:column;height:auto;
  max-height:min(94dvh,760px);border-radius:var(--kt-radius-lg);
  background:var(--kt-shell-bg);border:1px solid var(--kt-border);
  box-shadow:var(--kt-shadow-lg);overflow:hidden;z-index:1;
}
.kt-auth-banner{
  position:relative;height:auto;flex:none;padding:22px 28px 18px;
  background:var(--kt-sidebar-bg);border-bottom:1px solid var(--kt-border-soft);
}
.kt-auth-banner-mark{
  position:relative;display:flex;align-items:center;gap:10px;
  color:var(--kt-text-strong);font-size:14px;font-weight:600;
}
.kt-auth-banner-mark .kt-brand-mark{
  background:var(--kt-surface-2);border:1px solid var(--kt-border);color:var(--kt-text-strong);
}
.kt-auth-body{padding:26px 28px 30px;overflow:auto;flex:1;position:relative}
.kt-auth-body::-webkit-scrollbar{width:10px}
.kt-auth-body::-webkit-scrollbar-thumb{background:var(--kt-border);border-radius:5px;border:3px solid var(--kt-shell-bg)}
.kt-auth-title{
  font-size:24px;font-weight:700;letter-spacing:0;color:var(--kt-text-strong);
  margin:0 0 6px;line-height:1.15;
}
.kt-auth-subtitle{margin:0 0 20px;font-size:15px;color:var(--kt-muted);line-height:1.35}
.kt-auth-form{display:grid;gap:14px}
.kt-auth-actions{margin-top:6px}
.kt-auth-actions .kt-button{width:100%;padding:12px 18px;font-size:14.5px;font-weight:650}
.kt-auth-links{display:flex;justify-content:flex-end;margin-top:-4px}
.kt-auth-switch{margin:6px 0 0;text-align:center;font-size:13px;color:var(--kt-muted)}
.kt-auth-switch .kt-text-link{font-weight:600}
.kt-google{
  width:100%;margin-top:4px;display:flex!important;align-items:center!important;
  justify-content:center!important;gap:10px;
  border:1px solid var(--kt-border)!important;background:var(--kt-bg-elev)!important;
  color:var(--kt-text-strong)!important;font-weight:600!important;box-shadow:none!important;
}
.kt-google:hover{border-color:color-mix(in srgb,var(--kt-border) 60%,var(--kt-text))!important;background:var(--kt-surface-hover)!important}
.kt-google svg{width:18px;height:18px}
.kt-divider{
  display:flex;align-items:center;gap:10px;margin:8px 0;color:var(--kt-muted-2);
  font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
}
.kt-divider::before,.kt-divider::after{content:"";flex:1;height:1px;background:var(--kt-border)}
.kt-otp{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
.kt-otp-input{
  width:100%;height:52px;text-align:center;font-family:var(--kt-mono);
  font-size:20px;font-weight:600;letter-spacing:.02em;
  border:1px solid var(--kt-border);border-radius:var(--kt-radius-sm);
  background:var(--kt-bg-elev);color:var(--kt-text-strong);
  font-variant-numeric:tabular-nums;
  transition:border-color .15s,box-shadow .15s,background .15s;
}
.kt-otp-input:hover{border-color:color-mix(in srgb,var(--kt-border) 60%,var(--kt-text))}
.kt-otp-input:focus{outline:none;border-color:var(--kt-accent);box-shadow:var(--kt-shadow-glow)}
.kt-otp-input[data-filled="true"]{
  border-color:color-mix(in srgb,var(--kt-accent) 42%,var(--kt-border));
  background:color-mix(in srgb,var(--kt-accent) 7%,var(--kt-bg-elev));
}

/* Password strength meter */
.kt-strength{margin-top:8px;display:grid;gap:6px}
.kt-strength-bars{display:flex;gap:4px}
.kt-strength-bar{flex:1;height:4px;border-radius:2px;background:var(--kt-bg-strong);transition:background .2s}
.kt-strength-bar[data-level="1"]{background:var(--kt-danger)}
.kt-strength-bar[data-level="2"]{background:var(--kt-warning)}
.kt-strength-bar[data-level="3"]{background:color-mix(in srgb,var(--kt-warning) 45%,var(--kt-success))}
.kt-strength-bar[data-level="4"]{background:var(--kt-success)}
.kt-strength-label{
  font-size:11px;color:var(--kt-muted);font-weight:600;
  display:flex;justify-content:space-between;align-items:center;
}
.kt-strength-label strong{font-weight:700;color:var(--kt-text-strong)}
.kt-auth-hint{
  margin-top:6px;font-size:12.5px;color:var(--kt-muted);
  display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;
}
.kt-auth-hint code{
  font-family:var(--kt-mono);background:var(--kt-bg-strong);padding:2px 7px;
  border-radius:6px;font-size:11.5px;font-weight:600;color:var(--kt-text-strong);
}

/* ============ Toast ============ */
.kt-toast-viewport{
  position:fixed;z-index:2147483647;top:18px;right:18px;left:auto;
  display:flex;flex-direction:column;gap:10px;
  max-width:min(380px,calc(100vw - 36px));pointer-events:none;
}
.kt-toast{
  position:relative;display:flex;align-items:flex-start;gap:10px;padding:12px 14px;
  background:var(--kt-bg-elev);border:1px solid var(--kt-border);border-radius:var(--kt-radius);
  box-shadow:var(--kt-shadow-md);font-size:13px;color:var(--kt-text-strong);
  pointer-events:auto;overflow:hidden;animation:kt-toast-in .28s ease;
}
.kt-toast-icon{
  flex:none;width:28px;height:28px;border-radius:9px;display:grid;place-items:center;
  background:var(--kt-bg-strong);color:var(--kt-muted);
}
.kt-toast-icon svg{width:16px;height:16px}
.kt-toast-message{flex:1;line-height:1.4;font-weight:500}
.kt-toast-close{
  background:none;border:0;cursor:pointer;color:var(--kt-muted);padding:3px;
  border-radius:6px;display:grid;place-items:center;flex:none;
  transition:background .15s,color .15s;
}
.kt-toast-close:hover{background:var(--kt-bg-strong);color:var(--kt-text-strong)}
.kt-toast-progress{
  position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--kt-accent);
  transform-origin:left center;animation:kt-toast-progress linear forwards;
}
.kt-toast-success{border-color:color-mix(in srgb,var(--kt-success) 28%,var(--kt-border))}
.kt-toast-success .kt-toast-icon{background:var(--kt-success-soft);color:var(--kt-success)}
.kt-toast-success .kt-toast-progress{background:var(--kt-success)}
.kt-toast-error{border-color:color-mix(in srgb,var(--kt-danger) 28%,var(--kt-border))}
.kt-toast-error .kt-toast-icon{background:var(--kt-danger-soft);color:var(--kt-danger)}
.kt-toast-error .kt-toast-progress{background:var(--kt-danger)}
.kt-toast-info .kt-toast-icon{background:var(--kt-accent-soft);color:var(--kt-accent)}

/* ============ Animations ============ */
@keyframes kt-fade{from{opacity:0}to{opacity:1}}
@keyframes kt-fade-up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes kt-dialog-in{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:none}}
@keyframes kt-view-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes kt-sheet{from{transform:translateY(100%)}to{transform:none}}
@keyframes kt-shimmer{to{background-position:-200% 0}}
@keyframes kt-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(1.25)}}
@keyframes kt-toast-in{from{opacity:0;transform:translateX(16px) scale(.97)}to{opacity:1;transform:none}}
@keyframes kt-toast-progress{from{transform:scaleX(1)}to{transform:scaleX(0)}}
@keyframes kt-spin{to{transform:rotate(360deg)}}
.kt-spin{animation:kt-spin 1s linear infinite}

@media(prefers-reduced-motion:reduce){
  .kt-root *,.kt-root *::before,.kt-root *::after{
    animation-duration:.01ms!important;
    animation-iteration-count:1!important;
    transition-duration:.01ms!important;
  }
}

/* ============ Responsive ============ */
@media(max-width:780px){
  .kt-backdrop{place-items:end center;padding:0;background:rgba(11,12,12,.72)}
  .kt-dialog{
    display:flex;flex-direction:column;width:100%;
    height:min(94dvh,820px);border-radius:14px 14px 0 0;border-bottom:0;
    animation:kt-sheet .28s ease;max-width:none;
  }
  .kt-sidebar{display:none}
  .kt-content{height:100%;padding:0}
  .kt-header{padding:22px 22px 0;flex-direction:column;align-items:flex-start;gap:6px}
  .kt-header-copy{padding-right:34px}
  .kt-mobile-head{display:flex;padding:10px 22px 0}
  .kt-title{font-size:22px}
  .kt-subtitle{font-size:14px}
  .kt-view{padding:18px 22px 8px}
  .kt-notice{margin:14px 22px 0}
  .kt-confirm,.kt-hub-confirm{margin:14px 22px 0}
  .kt-section-head{padding:14px 16px 10px;flex-direction:column;align-items:flex-start;gap:6px}
  .kt-section-body{padding:14px 16px 16px}
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
  .kt-action-row{padding:14px 16px;min-height:72px}
  .kt-action-status{font-size:12px}
  .kt-signout-section{align-items:flex-start;flex-direction:column}
  .kt-signout-button{width:auto}
  .kt-auth-dialog{width:100%;border-radius:14px 14px 0 0;max-height:96dvh}
  .kt-auth-shell{border-radius:14px 14px 0 0}
  .kt-auth-banner{padding:16px 22px}
  .kt-auth-body{padding:22px 22px 26px}
  .kt-auth-title{font-size:22px}
  .kt-otp{gap:6px}
  .kt-otp-input{height:48px;font-size:18px}
}
@media(max-width:420px){
  .kt-dialog{border-radius:0}
  .kt-header{padding-left:16px;padding-right:16px}
  .kt-view{padding-left:16px;padding-right:16px}
  .kt-notice,.kt-confirm,.kt-hub-confirm{margin-left:16px;margin-right:16px}
  .kt-summary-meta{grid-template-columns:repeat(2,minmax(0,1fr))}
  .kt-action-row{gap:10px;padding:14px 12px}
  .kt-action-copy span{white-space:normal;max-width:none}
  .kt-action-status{display:none}
  .kt-signout-button{width:100%}
  .kt-otp{gap:4px}
  .kt-otp-input{height:44px;font-size:17px;border-radius:10px}
  .kt-auth-body{padding:18px 16px 22px}
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
    "--kt-shell-bg": appearance.backgroundColor,
    "--kt-bg-elev": appearance.elevatedColor,
    "--kt-surface-1": appearance.elevatedColor,
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
