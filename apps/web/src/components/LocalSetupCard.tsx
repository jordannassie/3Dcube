export default function LocalSetupCard() {
  return (
    <section id="local-setup" className="scroll-mt-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Run Locally to Enable File Uploads</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              TOWER stores .cs files on your local SSD. The Netlify preview is UI-only.
            </p>
          </div>
        </div>

        <ol className="space-y-4">
          <Step n={1} label="Clone or open the repo">
            <code className="block text-xs font-mono bg-gray-50 border border-gray-200 rounded px-3 py-2 mt-1.5 text-gray-700">
              git clone https://github.com/jordannassie/3Dcube.git
            </code>
          </Step>

          <Step n={2} label="Create the local env file">
            <code className="block text-xs font-mono bg-gray-50 border border-gray-200 rounded px-3 py-2 mt-1.5 text-gray-700">
              apps/web/.env.local
            </code>
          </Step>

          <Step n={3} label="Add the upload directory variable">
            <code className="block text-xs font-mono bg-gray-50 border border-gray-200 rounded px-3 py-2 mt-1.5 text-gray-700">
              TOWER_UPLOADED_INDICATORS_DIR=/absolute/path/to/your/uploads
            </code>
            <p className="text-xs text-gray-400 mt-1">
              Point to any local directory — TOWER will save .cs files there for backtesting.
            </p>
          </Step>

          <Step n={4} label="Start the dev server">
            <code className="block text-xs font-mono bg-gray-50 border border-gray-200 rounded px-3 py-2 mt-1.5 text-gray-700">
              cd apps/web &amp;&amp; npm run dev
            </code>
          </Step>

          <Step n={5} label="Open localhost and upload">
            <code className="block text-xs font-mono bg-gray-50 border border-gray-200 rounded px-3 py-2 mt-1.5 text-gray-700">
              http://localhost:3000
            </code>
            <p className="text-xs text-gray-400 mt-1">
              Drag and drop your NinjaTrader 8 .cs indicator or strategy file to begin analysis.
            </p>
          </Step>
        </ol>

        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p className="text-xs text-gray-400">
            File storage is intentionally local-only. No files are ever sent to Netlify or any cloud.
          </p>
        </div>
      </div>
    </section>
  );
}

function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700">{label}</p>
        {children}
      </div>
    </li>
  );
}
