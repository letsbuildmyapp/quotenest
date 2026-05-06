export function Footer() {
  return (
    <footer className="border-t-2 border-ink-900/10 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="display text-2xl font-bold">QuoteNest</p>
            <p className="mt-2 max-w-xs text-sm text-ink-600">
              Friendly, instant quotes for residential solar — built by Lets Build My App.
            </p>
          </div>
          <div className="text-sm">
            <p className="font-semibold mb-3">Company</p>
            <ul className="space-y-2 text-ink-600">
              <li>About</li><li>How it works</li><li>FAQ</li><li>Privacy</li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="font-semibold mb-3">A demo by</p>
            <a href="https://letsbuildmyapp.com" target="_blank" rel="noreferrer" className="underline decoration-sun-400 decoration-4 underline-offset-4">
              letsbuildmyapp.com
            </a>
            <p className="mt-2 text-ink-600 text-xs">Showcase project — not a live solar provider.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
