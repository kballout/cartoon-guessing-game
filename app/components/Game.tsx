"use client";

import React, { useState, useEffect } from "react";
import characterData from "../../characters.json";
import Character from "./Character";
import Image from "next/image";
import { ANSWERFEEDBACKIMAGE, CharacterType, GAMESTATUS } from "../types";
import Link from "next/link";

export default function Game() {
    // initialization data
  const gameOptions = {
    scoreStart: 0, //score for the start of a game
    roundTimer: 10, // time in seconds allowed for each round
    timerPenalty: 0, // starting time penalty in seconds
    timeBetweenRounds: 3, // amount of time in seconds for between round
    round: 1, // Keep track of what round we are on
    gameOver: false, //is the game over?
    totalRounds: 50, // total allowed rounds per game
    winScore: 25 // how many points you need to win the game
  };

  const [gameStatus, setGameStatus] = useState<GAMESTATUS>(GAMESTATUS.LOADING); // current status of the game
  const [score, setScore] = useState(gameOptions.scoreStart); // current score
  const [round, setRound] = useState(gameOptions.round); // current round
  const [roundTimer, setRoundTimer] = useState(gameOptions.roundTimer); // current timer of the round in seconds
  const [timerPenalty, setTimerPenalty] = useState(gameOptions.timerPenalty); // What the current timer penalty is
  const [gameOver, setGameOver] = useState(false); // is the game over?
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterType | null>(null); // what character is being displayed for the round
  const [selectedChoices, setSelectedChoices] = useState<CharacterType[]>([]); // what are the choices of incorrect characters to display in the round
  const [usedCharacters, setUsedCharacters] = useState<number[]>([]); // what characters have been used for the rounds so we don't duplicate
  const [answerFeedbackImage, setAnswerFeedbackImage] =
    useState<ANSWERFEEDBACKIMAGE | null>(); // the image to show after selection is made determining if it is correct, incorrect, or time up
  const [won, setWon] = useState(false); // Did the current player win?

  //starting the game
  useEffect(() => {
    const startGame = () => {
      setAnswerFeedbackImage(null);
      setScore(gameOptions.scoreStart);
      setRound(gameOptions.round);
      setRoundTimer(gameOptions.roundTimer);
      setTimerPenalty(gameOptions.timerPenalty);
      setGameOver(gameOptions.gameOver);
      setGameStatus(GAMESTATUS.WAITINGINPUT);
    };
    startGame();
  }, [
    gameOptions.gameOver,
    gameOptions.round,
    gameOptions.roundTimer,
    gameOptions.scoreStart,
    gameOptions.timerPenalty,
  ]);

  //initialize the selected character and choices
  useEffect(() => {
    if (round > 0 && round <= gameOptions.totalRounds) {
      selectCharacterAndChoices();
    }
  }, [round]);

  //handle the round timer
  useEffect(() => {
    let roundTimerId: NodeJS.Timeout;

    if (roundTimer > 0 && !gameOver) {
      roundTimerId = setTimeout(() => {
        setRoundTimer(roundTimer - 1);
      }, 1000); // Decrease by 1 every 1000 milliseconds (1 second)
    } else if (
      roundTimer === 0 &&
      !gameOver &&
      gameStatus === GAMESTATUS.WAITINGINPUT
    ) {
      handleRoundAnswer(null); // Incorrect answer if time runs out
    } else if (gameStatus === GAMESTATUS.LOADING && roundTimer > 0) {
      //wait for next round
      roundTimerId = setInterval(() => {
        setRoundTimer(roundTimer - 1);
      }, 1000);
    } else if (roundTimer === 0 && gameStatus === GAMESTATUS.LOADINGNEXTROUND) {
      //go to next round
      handleNextRound();
    }

    return () => clearTimeout(roundTimerId); // Cleanup on unmount/round change
  }, [roundTimer, gameOver, gameStatus]);

  //handle time penalities when an incorrect answer is given
  useEffect(() => {
    if (timerPenalty >= 10) {
      endGame(false);
    }
  }, [timerPenalty]);

  //handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: { key: any }) => {
      const key = e.key;
      if (!gameOver) {
        if (
          (key === "1" || key === "2" || key === "3" || key === "4") &&
          selectedChoices.length !== 0 &&
          gameStatus === GAMESTATUS.WAITINGINPUT
        ) {
          let opt = selectedChoices[parseInt(key) - 1];
          handleRoundAnswer(opt.name === selectedCharacter?.name);
        } else if (key === "Enter") {
          setGameOver(true);
        }
      } else if (gameOver && key === "Enter") {
        window.location.reload();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOver, gameStatus, selectedCharacter?.name, selectedChoices]);

  // select the current character for the round and other incorrect answers
  const selectCharacterAndChoices = () => {
    const availableCharacters = characterData.filter(
      (_, index) => !usedCharacters.includes(index)
    );

    if (availableCharacters.length === 0) {
      endGame(true);
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableCharacters.length);
    const selectedCharacter = availableCharacters[randomIndex];
    const selectedCharacterWithCorrect: CharacterType = {
      ...selectedCharacter,
      correct: true, // Add the 'correct' property
    };
    setSelectedCharacter(selectedCharacterWithCorrect);
    setUsedCharacters(prevUsedCharacters => [
      ...prevUsedCharacters,
      characterData.indexOf(selectedCharacter),
    ]);

    const incorrectChoices: CharacterType[] = [];
    const usedNames = new Set([selectedCharacterWithCorrect.name]);
    while (incorrectChoices.length < 3) {
      const randomIndex = Math.floor(Math.random() * characterData.length);
      const choice = characterData[randomIndex];
      if (
        !usedNames.has(choice.name) &&
        choice !== selectedCharacterWithCorrect
      ) {
        const choiceWithCorrect: CharacterType = {
          ...choice,
          correct: false,
        };
        incorrectChoices.push(choiceWithCorrect);
        usedNames.add(choice.name);
      }
    }

    const allChoices = [...incorrectChoices, selectedCharacterWithCorrect];
    shuffleArray(allChoices);
    setSelectedChoices(allChoices);
  };

  // called when the user selects their answer
  const handleRoundAnswer = (isCorrect: boolean | null) => {
    setGameStatus(GAMESTATUS.LOADINGNEXTROUND);
    if (isCorrect) {
      setScore(score + 1);
      setAnswerFeedbackImage(ANSWERFEEDBACKIMAGE.CORRECT);
    } else {
      setTimerPenalty(timerPenalty + 1);
      if (isCorrect == null) {
        setAnswerFeedbackImage(ANSWERFEEDBACKIMAGE.TIMEUP);
      } else {
        setAnswerFeedbackImage(ANSWERFEEDBACKIMAGE.INCORRECT);
      }
    }

    //check if player won
    if(isCorrect && (score + 1) === gameOptions.winScore){
      endGame(true)
    } else {
      if (
        round < gameOptions.totalRounds &&
        timerPenalty <= gameOptions.roundTimer
      ) {
        setRoundTimer(gameOptions.timeBetweenRounds);
      } else {
        endGame(timerPenalty <= gameOptions.roundTimer && score > 0); // End game after 25 rounds
      }
    }
  };

  // prepare for the next round
  const handleNextRound = () => {
    setAnswerFeedbackImage(null);
    setRound(round + 1);
    setRoundTimer(gameOptions.roundTimer - timerPenalty);
    setGameStatus(GAMESTATUS.WAITINGINPUT);
  };

  // handle the end of game state
  const endGame = (didWin: boolean) => {
    setRoundTimer(0);
    setGameStatus(GAMESTATUS.GAMEOVER);
    setGameOver(true);
    setWon(didWin);
  };

  function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  return (
    <div className="flex flex-col items-center justify-between flex-1">
      {!gameOver ? (
        <>
          <div className="flex space-y-14 flex-col items-center">
            <div className="text-white font-semibold text-2xl text-center">
              <div>
                <p>
                  {gameStatus === GAMESTATUS.WAITINGINPUT
                    ? `Timer: ${roundTimer}s`
                    : `Next Round in ${roundTimer}s`}{" "}
                </p>
                <p>Timer Penalty: {timerPenalty}s</p>
              </div>
            </div>
            <div className="text-white font-semibold text-2xl text-center">
              <p>Current Score: {score}</p>
              <p>
                Round: {round}
              </p>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl px-5 py-2 my-10">
            <p className="text-white font-bold text-xl border-b mb-4 text-center">
              Who is this?
            </p>

            {selectedCharacter && (
              <Character
                character={selectedCharacter}
                isBlurred={gameStatus === GAMESTATUS.WAITINGINPUT}
              />
            )}

            <div
              className={`absolute flex items-center justify-center ${
                gameStatus !== GAMESTATUS.LOADINGNEXTROUND && "hidden"
              }`}
            >
              {answerFeedbackImage && (
                <Image
                  src={answerFeedbackImage}
                  className="w-auto h-[256px]"
                  alt=""
                  width={100}
                  height={100}
                />
              )}
            </div>
          </div>

          <div className="flex space-x-5 flex-end sm:flex-col">
            {selectedChoices.map((choice, index) => (
              <button
                key={index}
                disabled={gameStatus !== GAMESTATUS.WAITINGINPUT}
                className={`optionBtn ${
                  gameStatus === GAMESTATUS.WAITINGINPUT
                    ? "bg-blue-800/30"
                    : choice.correct
                    ? "bg-green-800"
                    : "bg-red-800"
                }`}
                onClick={() =>
                  handleRoundAnswer(choice.name === selectedCharacter?.name)
                }
              >
                {choice.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setGameOver(true)}
            className="bg-blue-800/30 text-white px-8 py-5 rounded-3xl border-white border-4 font-bold text-3xl hover:brightness-125 mt-14"
          >
            End Game
          </button>
        </>
      ) : (
        <div
          className={`absolute bg-white/90 w-1/2 rounded-lg px-8 py-6 flex flex-col ${
            !gameOver && "hidden"
          }`}
        >
          <div className="font-bold text-4xl text-center border-b-2 border-b-slate-800 mb-8">
            GAME OVER
          </div>
          <div className="flex-1">
            <div className="text-xl text-center">
              <p>
                You {won ? "won" : "lost"} with a score of {score}.
              </p>
            </div>
          </div>

          <div className="flex w-full mt-12">
            <Link
              href="/"
              className="text-center flex-1 bg-white-800/30 text-slate-400 px-8 py-5 rounded-3xl border-slate-400 border-4 font-bold text-3xl"
            >
              Go Home
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-800/30 text-slate-100 px-8 py-5 rounded-3xl border-slate-100 border-4 font-bold text-3xl"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
