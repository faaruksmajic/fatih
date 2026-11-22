import Link from "next/link";
import { IconBack } from "./icons";

/** Large title for an admin page, with a way back to the list it belongs to. */
export function PageHead({
  title,
  sub,
  back,
}: {
  title: string;
  sub?: string;
  back?: { href: string; label: string };
}) {
  return (
    <header className="a-head">
      <div>
        {back && (
          <Link href={back.href} className="a-back">
            <IconBack />
            {back.label}
          </Link>
        )}
        <h1 className="a-title">{title}</h1>
        {sub && <p className="a-sub">{sub}</p>}
      </div>
    </header>
  );
}
