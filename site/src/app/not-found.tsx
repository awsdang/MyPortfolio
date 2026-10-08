import Link from "next/link";
import { FolderIcon } from "@/components/ui/Icons";

export default function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center px-4">
      <div className="glass glass-thick w-full max-w-[460px] rounded-[30px] p-8 text-center">
        <div className="mx-auto grid w-fit place-items-center">
          <FolderIcon tint="slate" glyph="folder" size={84} />
        </div>
        <h1 className="mt-5 font-display text-[26px] font-bold tracking-tight">The item can't be found.</h1>
        <p className="mt-1.5 text-[14px] text-[var(--ink-2)]">Error code −404. It may have been moved, or never existed.</p>
        <Link href="/" className="glass-tint press mt-6 inline-flex rounded-full px-6 py-3 text-[14px] font-semibold">
          Back to the desktop →
        </Link>
      </div>
    </main>
  );
}
