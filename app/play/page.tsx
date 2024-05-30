import React from 'react'

type Props = {}




export default function About({ }: Props) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="text-white font-bold text-5xl">
        Cartoon Guessing Game
      </div>

      <div className="flex space-y-14 flex-col items-center">
        <div className="text-white font-semibold text-2xl">Timer: 8</div>
        <div className="text-white font-semibold text-2xl">Current Score: 4</div>
      </div>

      <div className="min-h-24 rounded-2xl px-5 py-2">
        <p className="text-white font-bold text-xl border-b mb-4">Who is this?</p>
        <div>
          <img src="/images/bambi-game.jpg" className="w-96 blur-xl"></img>
        </div>
      </div>

      <div className="flex space-x-5">

        <button type="button" className="bg-blue-800/30 text-white px-8 py-5 rounded-3xl border-white border-4 font-bold text-3xl">
          Answer 1
        </button>

        <button type="button" className="bg-blue-800/30 text-white px-8 py-5 rounded-3xl border-white border-4 font-bold text-3xl">
          Answer 2
        </button>

        <button type="button" className="bg-blue-800/30 text-white px-8 py-5 rounded-3xl border-white border-4 font-bold text-3xl">
          Answer 3
        </button>

        <button type="button" className="bg-blue-800/30 text-white px-8 py-5 rounded-3xl border-white border-4 font-bold text-3xl">
          Answer 4
        </button>

      </div>



      <div className="absolute bg-white/90 w-1/2 h-5/6 rounded-lg px-8 py-6 flex flex-col hidden">
        <div className="font-bold text-4xl text-center border-b-2 border-b-slate-800 mb-8">GAME OVER</div>
        <div className="flex-1">
        <div className="text-xl">
          Final Score: 18/27
        </div>
        </div>

        <div className="flex w-full mt-12">
        <button type="button" className="flex-1 bg-white-800/30 text-slate-400 px-8 py-5 rounded-3xl border-slate-400 border-4 font-bold text-3xl">
          Go Home
        </button>
        <button type="button" className="flex-1 bg-blue-800/30 text-slate-100 px-8 py-5 rounded-3xl border-slate-100 border-4 font-bold text-3xl">
          Play Again
        </button>
        </div>

      </div>



    </main>
  );
}
