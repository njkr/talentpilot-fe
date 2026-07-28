import { Spinner } from "./spinner";

// Extracted after the second use (auth bootstrap, admin guard) — same "block everything until we
// know the real state" loading treatment both need.
export function FullPageSpinner() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg">
      <Spinner className="h-6 w-6 text-primary" />
    </div>
  );
}
