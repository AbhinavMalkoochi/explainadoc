export default function ProjectsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col items-center pt-20 px-4">
        <h1 className="text-3xl text-black mb-8">Our Projects</h1>
        <div className="w-full max-w-4xl bg-white shadow-sm rounded-lg p-8 border border-zinc-200">
          <p className="text-gray-700">
            This is the projects page. Showcase your projects here. Ut enim ad minima veniam, quis
            nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
            consequatur?
          </p>
        </div>
      </main>
    </div>
  );
}
