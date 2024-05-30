"use client";
import React, { useEffect, useRef, useState } from "react";
import chars from "../../characters.json";
import Image from "next/image";
import { Character, Option, VALIDATION } from "../types";

type Props = {};

export default function About({}: Props) {
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const allPictures: Array<Character> = shuffle(chars);
  const chosenCharacter = useRef<Character>(allPictures[0]);
  const [options, setOptions] = useState<Array<Option>>([]);
  const [gameStatus, setGameStatus] = useState("waiting");

  //shuffle the list passed in
  function shuffle(list: any) {
    return list.sort((_a: any, _b: any) => 0.5 - Math.random());
  }

  useEffect(() => {
    const initialPrep = () => {
      let opts: Array<Option> = [];
      //set the correct answer option
      opts.push({
        name: chosenCharacter.current.name,
        validation: VALIDATION.CORRECT,
      });
      //generate a list of other options
      let nextCharacter;
      while (opts.length !== 4) {
        nextCharacter = chars[Math.floor(Math.random() * chars.length)].name;
        if (nextCharacter !== chosenCharacter.current.name) {
          opts.push({ name: nextCharacter, validation: VALIDATION.INCORRECT });
        }
      }
      opts = shuffle(opts);
      setOptions(opts);
    };
    initialPrep();
    setLoading(false);
  }, []);

  //prepare the next set of options
  function prepOptions() {
    let opts: Array<Option> = [];
    //set the correct answer option
    opts.push({
      name: chosenCharacter.current.name,
      validation: VALIDATION.CORRECT,
    });
    //generate a list of other options
    let nextCharacter;
    while (opts.length !== 4) {
      if (allPictures.length <= 4) {
        nextCharacter = chars[Math.floor(Math.random() * chars.length)].name;
      } else {
        nextCharacter =
          allPictures[Math.floor(Math.random() * allPictures.length)].name;
      }
      if (nextCharacter !== chosenCharacter.current.name) {
        opts.push({ name: nextCharacter, validation: VALIDATION.INCORRECT });
      }
    }
    opts = shuffle(opts);
    setOptions(opts);
  }

  //when the user selects an option
  function selectOption(op: Option) {
    setGameStatus('checking')
    //if correct
    if (op.validation) {
      setScore(score + 1);
    } else {
      //TODO If incorrect
    }
  }

  if (loading) {
    return <div>loading</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="text-white font-bold text-5xl">Cartoon Guessing Game</div>

      <div className="flex space-y-14 flex-col items-center">
        <div className="text-white font-semibold text-2xl">Timer: 8</div>
        <div className="text-white font-semibold text-2xl">
          Current Score: {score}
        </div>
      </div>

      <div className="min-h-24 rounded-2xl px-5 py-2 my-10">
        <p className="text-white font-bold text-xl border-b mb-4 text-center">
          Who is this?
        </p>
        <div>
          {chosenCharacter.current && (
            <div className="w-[300px] h-[300px] relative">
              <Image
                className="object-contain blur-lg"
                priority
                fill
                alt="characterImage"
                src={chosenCharacter.current.path}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-5">
        {options.map(op => (
          <button
            onClick={() => selectOption(op)}
            type="button"
            key={op.name}
            className={`optionBtn ${
              gameStatus === "waiting"
                ? "bg-blue-800/30"
                : op.validation
                ? "bg-green-800"
                : "bg-red-800"
            }`}
          >
            {op.name}
          </button>
        ))}
      </div>

      <div className="absolute bg-white/90 w-1/2 h-5/6 rounded-lg px-8 py-6 flex flex-col hidden">
        <div className="font-bold text-4xl text-center border-b-2 border-b-slate-800 mb-8">
          GAME OVER
        </div>
        <div className="flex-1">
          <div className="text-xl">Final Score: 18/27</div>
        </div>

        <div className="flex w-full mt-12">
          <button
            type="button"
            className="flex-1 bg-white-800/30 text-slate-400 px-8 py-5 rounded-3xl border-slate-400 border-4 font-bold text-3xl"
          >
            Go Home
          </button>
          <button
            type="button"
            className="flex-1 bg-blue-800/30 text-slate-100 px-8 py-5 rounded-3xl border-slate-100 border-4 font-bold text-3xl"
          >
            Play Again
          </button>
        </div>
      </div>
    </main>
  );
}
