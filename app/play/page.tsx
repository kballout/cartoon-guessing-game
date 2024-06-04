"use client";
import React, { useEffect, useRef, useState } from "react";
import chars from "../../characters.json";
import Image from "next/image";
import { Character, Option, VALIDATION, ANSWERFEEDBACKIMAGE } from "../types";

type Props = {};

export default function About({}: Props) {
  const WINSCORE = 25;
  const INITALTIME = 10;
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [incorrect, setIncorrect] = useState(0);
  const [allPictures, setAllPictures] = useState<Array<Character>>(
    shuffle(chars)
  );
  const chosenCharacter = useRef<Character>(allPictures[0]);
  const [options, setOptions] = useState<Array<Option>>([]);
  const [gameStatus, setGameStatus] = useState("waiting");
  const [timer, setTimer] = useState<number>(INITALTIME);
  const [gameOver, setGameOver] = useState(false);
  const [answerFeedbackImage, setAnswerFeedbackImage] =
    useState<ANSWERFEEDBACKIMAGE>();

  //shuffle the list passed in
  function shuffle(list: any) {
    return list.sort((_a: any, _b: any) => 0.5 - Math.random());
  }

  //detect key presses
  useEffect(() => {
    const handleKeyDown = (e: { key: any; }) => {
      const key = e.key;
      if(!gameOver && gameStatus === 'waiting'){
        if((key === '1' || key === '2' || key === '3' || key === '4') && options.length !== 0){
          let opt = options[parseInt(key) - 1]
          selectOption(opt)
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown,);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOver, gameStatus, options]);

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
        if (nextCharacter !== opts[0].name) {
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

  useEffect(() => {
    let countdown: string | number | NodeJS.Timeout | undefined;
    if (gameStatus === "waiting" && timer > 0) {
      countdown = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (gameStatus === "waiting" && timer === 0) {
      selectOption({ name: "", validation: VALIDATION.INCORRECT }, true);
    } else if (gameStatus === "loading" && timer > 0) {
      countdown = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (gameStatus === "loading" && timer === 0) {
    }
    return () => clearInterval(countdown);
  }, [gameOver, gameStatus, timer]);

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
      if (nextCharacter !== opts[0].name) {
        opts.push({ name: nextCharacter, validation: VALIDATION.INCORRECT });
      }
    }
    opts = shuffle(opts);
    setOptions(opts);
  }

  //update the characters list
  function updateList() {
    let newList = allPictures.filter(
      item => item.name !== chosenCharacter.current?.name
    );
    setAllPictures(newList);
  }

  //when the user selects an option
  function selectOption(op: Option, timeup: boolean = false) {
    //if correct
    if (op.validation) {
      setScore(score + 1);
      setAnswerFeedbackImage(ANSWERFEEDBACKIMAGE.CORRECT);
    } else {
      // setTimer(timer - 1);
      setIncorrect(incorrect + 1);
      if (timeup) {
        setAnswerFeedbackImage(ANSWERFEEDBACKIMAGE.TIMEUP);
      } else {
        setAnswerFeedbackImage(ANSWERFEEDBACKIMAGE.INCORRECT);
      }
    }

    if (gameStatus === "waiting") {
      setGameStatus("loading");
      //check if player reached end score
      if (score + 1 !== WINSCORE && INITALTIME - incorrect !== 1) {
        setTimer(3);
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

  //when the next image is ready
  function loadedImage() {
    //check if player ran out of time
    if (INITALTIME - incorrect === 0) {
      setGameOver(true);
    } else {
      setGameStatus("waiting");
      prepOptions();
      setTimer(INITALTIME - incorrect);
    }
  }

  if (loading) {
    return <div>loading</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="text-white font-bold text-5xl">Cartoon Guessing Game</div>
      {!gameOver ? (
        <div className="flex flex-col items-center">
          <div className="flex space-y-14 flex-col items-center">
            {gameStatus === "loading" ? (
              <div className="text-white font-semibold text-2xl">
                <h1>
                  Next Round in <span>{timer}s</span>
                </h1>
              </div>
            ) : (
              <div className="text-white font-semibold text-2xl">
                Timer: {timer}s
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
                    onLoad={() => loadedImage()}
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
            {options.map((op, index) => (
              <button
                onClick={() => selectOption(op)}
                type="button"
                key={index}
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
        </div>
      ) : (
        <div
          className={`absolute bg-white/90 w-1/2 h-5/6 rounded-lg px-8 py-6 flex flex-col`}
        >
          <div className="font-bold text-4xl text-center border-b-2 border-b-slate-800 mb-8">
            GAME OVER
          </div>
          <div className="flex flex-col flex-1 justify-center items-center text-2xl">
            <div>{score === WINSCORE ? "You Win!" : "You Lose!"}</div>
            <div>Final Score: {score}/25</div>
          </div>

          <div className="flex w-full mt-12">
            <button
              onClick={() => (window.location.href = "/")}
              type="button"
              className="flex-1 bg-white-800/30 text-slate-400 px-8 py-5 rounded-3xl border-slate-400 border-4 font-bold text-3xl"
            >
              Go Home
            </button>
            <button
              onClick={() => window.location.reload()}
              type="button"
              className="flex-1 bg-blue-800/30 text-slate-100 px-8 py-5 rounded-3xl border-slate-100 border-4 font-bold text-3xl"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
