"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import chars from "../../characters.json";
import Image from "next/image";
import { Character, Option, VALIDATION, ANSWERFEEDBACKIMAGE } from "../types";

type Props = {};

export default function Play({}: Props) {
  const WINSCORE = 25;
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allPictures, setAllPictures] = useState<Array<Character>>(
    shuffle(chars)
  );
  const chosenCharacter = useRef<Character>(allPictures[0]);
  const [options, setOptions] = useState<Array<Option>>([]);
  const [gameStatus, setGameStatus] = useState("waiting");
  const [nextTimer, setNextTimer] = useState<number | null>();
  const [timer, setTimer] = useState<number>(10);
  const [roundTimer, setRoundTimer] = useState<number>(timer);
  const [gameOver, setGameOver] = useState(false);
  const [answerFeedbackImage, setAnswerFeedbackImage] =
    useState<ANSWERFEEDBACKIMAGE>();

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

  //when the list changes select a new character with new options
  useEffect(() => {
    if (!loading) {
      if (allPictures.length === 0) {
        setGameOver(true);
      } else {
        let curr: Character = {
          name: allPictures[0].name,
          path: allPictures[0].path,
        };
        chosenCharacter.current = curr;
      }
    }
  }, [allPictures, loading]);

  //wait for the next round
  useEffect(() => {
    let countdown: string | number | NodeJS.Timeout | undefined;
    if (nextTimer !== null && nextTimer! > 0) {
      countdown = setInterval(() => {
        setNextTimer(prev => prev! - 1);
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [nextTimer]);

  //go to the next character
  const updateList = useCallback(() => {
    let newList = allPictures.filter(
      item => item.name !== chosenCharacter.current?.name
    );
    setAllPictures(newList);
  }, [allPictures]);

  useEffect(() => {
    let countdown: string | number | NodeJS.Timeout | undefined;
    if (roundTimer !== null && roundTimer! >= 0) {
      countdown = setInterval(() => {
        setRoundTimer(prev => prev! - 1);
        console.log(timer);
        if (timer == 0) {
          setGameOver(true);
        }
        if (roundTimer == 1) {
          setGameStatus("loading");
          setAnswerFeedbackImage(ANSWERFEEDBACKIMAGE.TIMEUP);
          setTimer(timer - 1);
          setNextTimer(3);
          setTimeout(() => {
            if (!gameOver) {
              updateList();
            }
          }, 3000);
        }
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [roundTimer, timer, gameOver, updateList]);

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

  function endRound() {
    let opt: Option = { name: "", validation: VALIDATION.INCORRECT };
    selectOption(opt);
  }

  //when the user selects an option
  function selectOption(op: Option) {
    //if correct
    if (op.validation) {
      setScore(score + 1);
      setAnswerFeedbackImage(ANSWERFEEDBACKIMAGE.CORRECT);
    } else {
      setTimer(timer - 1);
      setAnswerFeedbackImage(ANSWERFEEDBACKIMAGE.INCORRECT);
    }

    if (gameStatus === "waiting") {
      setGameStatus("loading");
      if (score + 1 !== WINSCORE) {
        setNextTimer(3);
        setTimeout(() => {
          if (!gameOver) {
            updateList();
          }
        }, 3000);
      } else {
        setGameOver(true);
        setTimer(0);
      }
    }
  }

  function runTimer() {
    setRoundTimer(timer);
  }

  //when the next image is ready
  function loadedImage() {
    setGameStatus("waiting");
    prepOptions();
    setNextTimer(null);
    runTimer();
  }

  if (loading) {
    return <div>loading</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="text-white font-bold text-5xl">Cartoon Guessing Game</div>

          <div className="flex space-y-14 flex-col items-center">
            {nextTimer !== null ? (
              <div className="text-white font-semibold text-2xl">
                {!gameOver ? (
                  <h1>
                    Next Round in <span>{nextTimer}s</span>
                  </h1>
                ) : (
                  <h1>Game Over!</h1>
                )}
              </div>
            ) : (
              <div className="text-white font-semibold text-2xl">
                Timer: {roundTimer}s
              </div>
            )}
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
                    className={`object-contain ${
                      gameStatus === "waiting" && "blur-md"
                    } `}
                    onLoadingComplete={() => loadedImage()}
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
                disabled={gameStatus === "loading"}
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

          <div
            className={`absolute w-1/2 h-5/6 flex items-center justify-center ${
              gameStatus === "waiting" && "hidden"
            }`}
          >
            {answerFeedbackImage && (
              <Image
                src={answerFeedbackImage}
                className="w-auto h-[256px]"
                alt=""
                width="100"
                height="100"
              />
            )}
          </div>

        <div
          className={`absolute bg-white/90 w-1/2 h-5/6 rounded-lg px-8 py-6 flex flex-col ${
            !gameOver && "hidden"
          }`}
        >
          <div className="font-bold text-4xl text-center border-b-2 border-b-slate-800 mb-8">
            GAME OVER
          </div>
          <div className="flex-1">
            <div className="text-xl">Final Score: {score}/25</div>
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
