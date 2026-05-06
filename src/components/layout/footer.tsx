import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-12 border-t bg-card/50">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Sebastian Kappler</span>
        <nav className="flex items-center gap-4">
          <Link href="/impressum" className="hover:text-foreground transition-colors">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-foreground transition-colors">
            Datenschutz
          </Link>
        </nav>
      </div>
    </footer>
  );
}
