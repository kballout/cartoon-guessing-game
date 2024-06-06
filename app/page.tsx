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
          <li>There will be a total of 50 rounds in a game</li>
          <li>The initial timer will begin by giving you 10 seconds to answer</li>
          <li>An incorrect answer or no answer will result in a time penalty of 1 second</li>
          <li>Selecting the correct answer for each round will earn you 1 point</li>
          <li>You can use the keyboard to select an answer using the number keys 1-4</li>
          <li>You can use the enter key to end or restart the game</li>
        </ol>
        <p className="text-white font-bold text-xl border-b mb-4 mt-5">End Game Conditions</p>
          <ol className="text-white font-semibold text-lg list-decimal ml-4">
            <li>Answer 25 correct questions to win the game</li>
            <li>If you fail 10 questions the timer will be set to 0 and you will lose the game</li>
          </ol>        
      </div>

      <div>

        <a href="/play" className="bg-blue-800/30 text-white px-8 py-5 rounded-3xl border-white border-4 font-bold text-3xl hover:brightness-125">
          Start Game
        </a>

      </div>
    </main>
  );
}
