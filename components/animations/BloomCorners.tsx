export default function BloomCorners() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden motion-reduce:hidden"
    >
      {/* Top Left Bloom */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-500/5 blur-[120px] animate-pulse-slow" />
      {/* Bottom Right Bloom */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-500/5 blur-[120px] animate-pulse-slow" />
    </div>
  );
}