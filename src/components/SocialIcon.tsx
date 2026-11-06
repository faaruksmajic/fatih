/** Line icons for the footer's social links, drawn at 24 units with a 1.5 stroke like the rest of the site. */
export function SocialIcon({ id }: { id: "instagram" | "linkedin" | "whatsapp" }) {
  const common = {
    viewBox: "0 0 24 24",
    "aria-hidden": true,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (id === "instagram") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
      </svg>
    );
  }
  if (id === "linkedin") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7.5 10.5v6M7.5 7.5v.01M11 16.5v-6M11 13.5a3 3 0 0 1 6 0v3" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M3.5 20.5l1.3-4.1A8.5 8.5 0 1 1 8 19.4z" />
      <path d="M9.3 8.6c.3-.5.8-.5 1.1 0l.6 1.2c.2.4.1.8-.2 1.1l-.4.4c.5 1.1 1.3 1.9 2.4 2.4l.4-.4c.3-.3.7-.4 1.1-.2l1.2.6c.5.3.5.8 0 1.1-.8.7-1.9.9-2.9.4a8 8 0 0 1-3.7-3.7c-.5-1-.3-2.1.4-2.9z" />
    </svg>
  );
}
