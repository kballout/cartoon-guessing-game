"use client"


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="text-white font-bold text-5xl">
        Cartoon Guessing Game
      </div>

      <div className="border-4 border-blue-800 min-h-24 rounded-2xl px-5 py-2">
        <p className="text-white font-bold text-xl border-b mb-4">Game Rules</p>
        <ol className="text-white font-semibold text-lg list-decimal ml-4">
          <li>One</li>
          <li>Two</li>
          <li>Three</li>
        </ol>
      </div>

      <div>

        <button type="button" className="bg-blue-800/30 text-white px-8 py-5 rounded-3xl border-white border-4 font-bold text-3xl">
          Start Game
        </button>

      </div>
    </main>
  );
}
