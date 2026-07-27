import type { SVGProps } from "react";

type IconName =
  | "chevron"
  | "close"
  | "device"
  | "lock"
  | "logout"
  | "sessions"
  | "user";

const paths: Record<IconName, React.ReactNode> = {
  chevron: <path d="m7 10 5 5 5-5" />,
  close: <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>,
  device: <><rect width="16" height="12" x="4" y="3" rx="2" /><path d="M8 21h8m-4-6v6" /></>,
  lock: <><rect width="16" height="12" x="4" y="9" rx="2" /><path d="M8 9V7a4 4 0 0 1 8 0v2" /></>,
  logout: <><path d="M10 17l5-5-5-5m5 5H3" /><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /></>,
  sessions: <><rect width="18" height="14" x="3" y="5" rx="2" /><path d="M7 9h10M7 13h6" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
};

export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
