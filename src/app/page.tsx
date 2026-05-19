export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="text-center">
        <div className="cube-scene mb-12">
          <div className="cube">
            <div className="cube-face face-front" />
            <div className="cube-face face-back" />
            <div className="cube-face face-left" />
            <div className="cube-face face-right" />
            <div className="cube-face face-top" />
            <div className="cube-face face-bottom" />
          </div>
        </div>

        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          3D Cube
        </h1>
        <p className="text-lg text-slate-400 mb-8 max-w-md">
          Built with Next.js &amp; deployed on Netlify
        </p>
        <a
          href="https://netlify.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-teal-400 transition-colors"
        >
          Deployed on Netlify
        </a>
      </div>
    </main>
  );
}
