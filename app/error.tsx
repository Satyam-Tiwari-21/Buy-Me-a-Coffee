"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="page-loader">
      <p>Something drifted off course.</p>
      <button className="button button-primary" onClick={reset}>Try again</button>
    </main>
  );
}
