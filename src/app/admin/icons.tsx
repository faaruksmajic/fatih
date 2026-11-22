/** Line icons for the backoffice: one stroke weight, 24px grid, currentColor. */

type IconProps = { className?: string };

function Svg({ children, className }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  );
}

export const IconProjects = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.8" />
  </Svg>
);

export const IconTag = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 12.6V4.8c0-.7.6-1.3 1.3-1.3h7.8l8 8a1.3 1.3 0 0 1 0 1.8l-7 7a1.3 1.3 0 0 1-1.8 0z" />
    <circle cx="8" cy="8" r="1.4" />
  </Svg>
);

export const IconDoc = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 3.5H7.3c-.7 0-1.3.6-1.3 1.3v14.4c0 .7.6 1.3 1.3 1.3h9.4c.7 0 1.3-.6 1.3-1.3V7.5z" />
    <path d="M14 3.5v4h4M9 12.5h6M9 16h4" />
  </Svg>
);

export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconPencil = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
    <path d="m13.5 6.5 4 4" />
  </Svg>
);

export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 7h15M9.5 7V4.8c0-.7.6-1.3 1.3-1.3h2.4c.7 0 1.3.6 1.3 1.3V7M6.5 7l.8 12.1c.1.8.7 1.4 1.5 1.4h6.4c.8 0 1.4-.6 1.5-1.4L17.5 7" />
  </Svg>
);

export const IconUp = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 15 6-6 6 6" />
  </Svg>
);

export const IconDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const IconBack = (p: IconProps) => (
  <Svg {...p}>
    <path d="m15 5-7 7 7 7" />
  </Svg>
);

export const IconExternal = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 4.5h5.5V10M19.5 4.5 11 13" />
    <path d="M18 14v4.7c0 .7-.6 1.3-1.3 1.3H5.3c-.7 0-1.3-.6-1.3-1.3V7.3C4 6.6 4.6 6 5.3 6H10" />
  </Svg>
);

export const IconLogout = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 4.5H5.8c-.7 0-1.3.6-1.3 1.3v12.4c0 .7.6 1.3 1.3 1.3H10M15 8l4 4-4 4M19 12H9.5" />
  </Svg>
);

export const IconUpload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 15.5V4.5M7.5 9 12 4.5 16.5 9" />
    <path d="M4.5 14.5v3.7c0 .7.6 1.3 1.3 1.3h12.4c.7 0 1.3-.6 1.3-1.3v-3.7" />
  </Svg>
);

export const IconPhoto = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m20.5 16-5-5-8.5 8.5" />
  </Svg>
);

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconAlert = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.8v4.7M12 16.2v.01" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m8.3 12.2 2.5 2.5 4.9-5" />
  </Svg>
);
