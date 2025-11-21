export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col items-center pt-20 px-4">
        <h1 className="text-3xl text-black mb-8">Contact Us</h1>
        <div className="w-full max-w-4xl bg-white shadow-sm rounded-lg p-8 border border-zinc-200">
          <p className="text-gray-700">
            This is the contact page. Provide ways for users to get in touch. Nemo enim ipsam
            voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni
            dolores eos qui ratione voluptatem sequi nesciunt.
          </p>
        </div>
      </main>
    </div>
  );
}
