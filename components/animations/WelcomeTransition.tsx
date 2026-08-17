export default function WelcomeTransition() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-sm animate-fade-in"
    >
      <div className="text-4xl mb-3 animate-pulse">❤️</div>
      <h2 className="text-xl font-semibold text-white">Welcome Back</h2>
      <p className="text-xs text-gray-400 mt-1">Loading your memories...</p>
    </div>
  );
}