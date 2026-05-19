import TopNav from "@/components/TopNav";
import DashboardWorkspace from "@/components/DashboardWorkspace";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <TopNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <DashboardWorkspace />
      </main>
    </div>
  );
}
