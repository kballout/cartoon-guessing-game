"use client";

import Game from "../components/Game";

export default function Play() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="text-white font-bold text-5xl mb-24">
        Cartoon Guessing Game
      </div>
      <Game />
    </main>
  );
}
