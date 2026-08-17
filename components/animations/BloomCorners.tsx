import type { JSX } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: any;
    }
  }
}

export default function BloomCorners(): JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 motion-reduce:hidden"
    >
      {/* Top Left Bloom */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-500/5 blur-[120px] animate-pulse-slow" />
      {/* Bottom Right Bloom */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-500/5 blur-[120px] animate-pulse-slow" />
    </div>
  );
}