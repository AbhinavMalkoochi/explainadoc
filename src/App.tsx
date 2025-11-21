export default function App() {
  return (
    <div>
      {/* Background div */}
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-white bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]"></div>

      {/* Your existing content */}
      <div>Hello World</div>

      {/* Add the rest of your application components here */}
    </div>
  );
}
