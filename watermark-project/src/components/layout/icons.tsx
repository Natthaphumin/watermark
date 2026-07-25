import type { SVGProps } from "react";

const defaultProps: SVGProps<SVGSVGElement> = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function EditorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaultProps} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaultProps} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-3.7 4.4-5.5 7.5-5.5s6.1 1.8 7.5 5.5" />
    </svg>
  );
}

export function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M9 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h3" />
      <path d="M14.5 16 19 12l-4.5-4" />
      <path d="M19 12H9" />
    </svg>
  );
}
