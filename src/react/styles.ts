import type { CSSProperties } from "react";
import type { KnotreeAppearance } from "./types.js";

export const STYLE_ID = "knotree-account-ui";

export const accountStyles = `
.kt-root{--kt-accent:#635bff;--kt-bg:#fff;--kt-text:#171717;--kt-muted:#6b7280;--kt-border:#e7e7eb;--kt-danger:#dc2626;--kt-radius:18px;font-family:var(--kt-font,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);color:var(--kt-text);box-sizing:border-box}
.kt-root *{box-sizing:border-box}.kt-user-button{appearance:none;border:1px solid var(--kt-border);background:var(--kt-bg);color:var(--kt-text);display:inline-flex;align-items:center;gap:10px;border-radius:999px;padding:5px 11px 5px 5px;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.04),0 4px 14px rgba(0,0,0,.04);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
.kt-user-button:hover{transform:translateY(-1px);border-color:color-mix(in srgb,var(--kt-accent) 35%,var(--kt-border));box-shadow:0 7px 24px rgba(0,0,0,.09)}.kt-user-button:focus-visible,.kt-button:focus-visible,.kt-input:focus-visible,.kt-nav-button:focus-visible,.kt-icon-button:focus-visible{outline:3px solid color-mix(in srgb,var(--kt-accent) 28%,transparent);outline-offset:2px}
.kt-avatar{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;font-size:13px;font-weight:750;color:#fff;background:linear-gradient(145deg,var(--kt-accent),color-mix(in srgb,var(--kt-accent) 55%,#111));box-shadow:inset 0 0 0 1px rgba(255,255,255,.28)}.kt-user-label{font-size:14px;font-weight:650;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kt-chevron{width:15px;height:15px;color:var(--kt-muted)}
.kt-backdrop{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:24px;background:rgba(10,12,18,.48);backdrop-filter:blur(8px);animation:kt-fade .18s ease}.kt-dialog{position:relative;display:grid;grid-template-columns:218px minmax(0,1fr);width:min(880px,100%);height:min(650px,calc(100dvh - 48px));overflow:hidden;border:1px solid color-mix(in srgb,var(--kt-border) 80%,transparent);border-radius:var(--kt-radius);background:var(--kt-bg);box-shadow:0 28px 80px rgba(0,0,0,.28);animation:kt-rise .24s cubic-bezier(.2,.8,.2,1)}
.kt-sidebar{display:flex;flex-direction:column;padding:24px 14px 16px;background:color-mix(in srgb,var(--kt-bg) 94%,var(--kt-text));border-right:1px solid var(--kt-border)}.kt-brand{padding:0 10px 22px;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--kt-muted)}.kt-account-mini{display:flex;gap:10px;align-items:center;padding:0 8px 20px}.kt-account-mini .kt-avatar{flex:none}.kt-account-copy{min-width:0}.kt-account-name{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kt-account-email{margin-top:2px;font-size:12px;color:var(--kt-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kt-nav{display:grid;gap:4px}.kt-nav-button{appearance:none;width:100%;display:flex;align-items:center;gap:10px;border:0;border-radius:11px;padding:10px 11px;background:transparent;color:var(--kt-muted);font:inherit;font-size:14px;font-weight:620;text-align:left;cursor:pointer;transition:background .15s,color .15s}.kt-nav-button svg{width:17px;height:17px}.kt-nav-button:hover{background:color-mix(in srgb,var(--kt-accent) 7%,transparent);color:var(--kt-text)}.kt-nav-button[data-active=true]{background:color-mix(in srgb,var(--kt-accent) 11%,transparent);color:var(--kt-accent)}.kt-sidebar-bottom{margin-top:auto}.kt-signout{color:var(--kt-danger)}
.kt-content{min-width:0;overflow:auto;padding:34px 38px 46px}.kt-mobile-head{display:none}.kt-close{position:absolute;right:18px;top:18px;z-index:2}.kt-icon-button{appearance:none;width:34px;height:34px;display:grid;place-items:center;border:1px solid var(--kt-border);border-radius:50%;background:color-mix(in srgb,var(--kt-bg) 90%,transparent);color:var(--kt-muted);cursor:pointer;transition:color .15s,background .15s}.kt-icon-button:hover{color:var(--kt-text);background:color-mix(in srgb,var(--kt-bg) 92%,var(--kt-text))}
.kt-title{margin:0;font-size:25px;letter-spacing:-.025em;line-height:1.2}.kt-subtitle{margin:7px 0 28px;color:var(--kt-muted);font-size:14px;line-height:1.55}.kt-section{border:1px solid var(--kt-border);border-radius:14px;background:var(--kt-bg);overflow:hidden}.kt-section+.kt-section{margin-top:16px}.kt-section-head{padding:18px 20px 14px}.kt-section-title{margin:0;font-size:15px}.kt-section-copy{margin:5px 0 0;color:var(--kt-muted);font-size:13px;line-height:1.5}.kt-section-body{padding:0 20px 20px}.kt-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.kt-field{display:grid;gap:7px}.kt-field label{font-size:12px;font-weight:700;color:color-mix(in srgb,var(--kt-text) 76%,var(--kt-muted))}.kt-input{width:100%;height:42px;border:1px solid var(--kt-border);border-radius:10px;padding:0 12px;background:var(--kt-bg);color:var(--kt-text);font:inherit;font-size:14px;transition:border-color .15s,box-shadow .15s}.kt-input:hover{border-color:color-mix(in srgb,var(--kt-text) 25%,var(--kt-border))}.kt-actions{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:18px}
.kt-button{appearance:none;min-height:39px;border:1px solid transparent;border-radius:10px;padding:0 15px;font:inherit;font-size:13px;font-weight:720;cursor:pointer;transition:transform .15s,opacity .15s,background .15s}.kt-button:hover:not(:disabled){transform:translateY(-1px)}.kt-button:disabled{opacity:.55;cursor:not-allowed}.kt-primary{background:var(--kt-accent);color:#fff;box-shadow:0 5px 15px color-mix(in srgb,var(--kt-accent) 25%,transparent)}.kt-secondary{border-color:var(--kt-border);background:var(--kt-bg);color:var(--kt-text)}.kt-danger-button{border-color:color-mix(in srgb,var(--kt-danger) 24%,var(--kt-border));background:color-mix(in srgb,var(--kt-danger) 7%,var(--kt-bg));color:var(--kt-danger)}
.kt-notice{margin-bottom:16px;border-radius:11px;padding:11px 13px;font-size:13px;line-height:1.45}.kt-error{color:color-mix(in srgb,var(--kt-danger) 84%,var(--kt-text));background:color-mix(in srgb,var(--kt-danger) 8%,var(--kt-bg));border:1px solid color-mix(in srgb,var(--kt-danger) 20%,var(--kt-border))}.kt-success{color:#08734b;background:#ecfdf5;border:1px solid #a7f3d0}.kt-session{display:flex;align-items:flex-start;gap:13px;padding:16px 0;border-top:1px solid var(--kt-border)}.kt-session:first-child{border-top:0}.kt-device-icon{width:38px;height:38px;display:grid;place-items:center;flex:none;border-radius:11px;background:color-mix(in srgb,var(--kt-accent) 9%,var(--kt-bg));color:var(--kt-accent)}.kt-device-icon svg{width:19px}.kt-session-main{min-width:0;flex:1}.kt-session-name{font-size:14px;font-weight:700}.kt-current{display:inline-flex;margin-left:7px;border-radius:999px;padding:2px 7px;background:color-mix(in srgb,var(--kt-accent) 10%,var(--kt-bg));color:var(--kt-accent);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em}.kt-session-meta{margin-top:4px;color:var(--kt-muted);font-size:12px;line-height:1.5}.kt-link-button{appearance:none;border:0;background:none;color:var(--kt-danger);font:inherit;font-size:12px;font-weight:700;cursor:pointer;padding:5px}.kt-empty{padding:34px 20px;text-align:center;color:var(--kt-muted);font-size:13px}.kt-skeleton{height:62px;border-radius:10px;background:linear-gradient(90deg,color-mix(in srgb,var(--kt-text) 5%,var(--kt-bg)) 25%,color-mix(in srgb,var(--kt-text) 9%,var(--kt-bg)) 50%,color-mix(in srgb,var(--kt-text) 5%,var(--kt-bg)) 75%);background-size:200% 100%;animation:kt-shimmer 1.3s infinite}.kt-skeleton+.kt-skeleton{margin-top:10px}
.kt-confirm{padding:18px 20px;border-top:1px solid var(--kt-border);background:color-mix(in srgb,var(--kt-danger) 4%,var(--kt-bg))}.kt-confirm strong{display:block;font-size:13px}.kt-confirm p{margin:5px 0 14px;color:var(--kt-muted);font-size:12px}.kt-confirm-actions{display:flex;gap:8px;justify-content:flex-end}
@keyframes kt-fade{from{opacity:0}to{opacity:1}}@keyframes kt-rise{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}@keyframes kt-shimmer{to{background-position:-200% 0}}
@media(max-width:680px){.kt-backdrop{place-items:end center;padding:0;background:rgba(10,12,18,.52)}.kt-dialog{display:block;width:100%;height:min(92dvh,760px);border-radius:22px 22px 0 0;border-bottom:0;animation:kt-sheet .28s cubic-bezier(.2,.8,.2,1)}.kt-sidebar{display:none}.kt-content{height:100%;padding:22px 18px 34px}.kt-mobile-head{display:flex;gap:5px;overflow-x:auto;padding:0 42px 18px 0;scrollbar-width:none}.kt-mobile-head::-webkit-scrollbar{display:none}.kt-mobile-head .kt-nav-button{width:auto;white-space:nowrap;padding:8px 10px}.kt-title{font-size:22px}.kt-subtitle{margin-bottom:20px}.kt-grid{grid-template-columns:1fr}.kt-close{top:13px;right:13px}.kt-user-label{display:none}.kt-user-button{padding-right:5px}.kt-section-head{padding:16px 16px 12px}.kt-section-body{padding:0 16px 16px}.kt-session{gap:10px}.kt-actions{align-items:stretch;flex-direction:column-reverse}.kt-actions .kt-button{width:100%}}@keyframes kt-sheet{from{transform:translateY(100%)}to{transform:none}}
@media(prefers-reduced-motion:reduce){.kt-root *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
/* Auth v2 popup (US-119 / US-120) */
.kt-auth-dialog{display:block;width:min(420px,100%);height:auto;max-height:min(92dvh,720px);grid-template-columns:none;overflow:auto}
.kt-auth-body{padding:40px 32px 36px}
.kt-auth-form{display:grid;gap:14px}
.kt-auth-actions{margin-top:6px}
.kt-auth-actions .kt-button{width:100%}
.kt-auth-links{display:flex;justify-content:flex-end;margin-top:-4px}
.kt-auth-switch{margin:4px 0 0;text-align:center;font-size:13px;color:var(--kt-muted)}
.kt-text-link{appearance:none;border:0;background:none;color:var(--kt-accent);font:inherit;font-size:13px;font-weight:700;cursor:pointer;padding:0}
.kt-text-link:disabled{opacity:.55;cursor:not-allowed}
.kt-google{width:100%;margin-top:4px}
.kt-otp{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
.kt-otp-input{width:100%;height:48px;text-align:center;font-size:18px;font-weight:700;letter-spacing:.04em;border:1px solid var(--kt-border);border-radius:10px;background:var(--kt-bg);color:var(--kt-text);font-family:inherit}
.kt-otp-input:focus{outline:3px solid color-mix(in srgb,var(--kt-accent) 28%,transparent);outline-offset:2px;border-color:color-mix(in srgb,var(--kt-accent) 40%,var(--kt-border))}
.kt-user-skeleton{pointer-events:none;opacity:.7}
.kt-avatar-skeleton{background:color-mix(in srgb,var(--kt-text) 10%,var(--kt-bg))!important;box-shadow:none}
.kt-skel-bar{display:inline-block;width:72px;height:12px;border-radius:999px;background:color-mix(in srgb,var(--kt-text) 10%,var(--kt-bg))}
@media(max-width:680px){.kt-auth-dialog{width:100%;border-radius:22px 22px 0 0}.kt-auth-body{padding:28px 18px 30px}.kt-otp{gap:6px}.kt-otp-input{height:44px;font-size:16px}}
`;

export function appearanceStyle(
  appearance?: KnotreeAppearance,
): CSSProperties {
  if (!appearance) return {};
  return {
    "--kt-accent": appearance.accentColor,
    "--kt-bg": appearance.backgroundColor,
    "--kt-text": appearance.textColor,
    "--kt-muted": appearance.mutedColor,
    "--kt-border": appearance.borderColor,
    "--kt-danger": appearance.dangerColor,
    "--kt-radius":
      appearance.borderRadius === undefined
        ? undefined
        : `${appearance.borderRadius}px`,
    "--kt-font": appearance.fontFamily,
  } as CSSProperties;
}
