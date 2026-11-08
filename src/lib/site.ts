export const EMAIL = "skrijeljfatih3@gmail.com";
export const PHONE = "+387 62 504 287";
export const PHONE_HREF = "tel:+38762504287";

type SocialLink = {
  id: "instagram" | "linkedin" | "whatsapp";
  label: string;
  /** Empty shows the icon without a link ("coming soon"). */
  href: string;
};

/**
 * Social profiles shown as icons in the footer. Fill in a URL to make an icon
 * clickable; an empty href shows the icon without a link ("coming soon").
 */
export const SOCIAL: readonly SocialLink[] = [
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/archfatih" },
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/fatih-%C5%A1krijelj-2641943a6" },
  { id: "whatsapp", label: "WhatsApp", href: "https://wa.me/38762504287" },
];
