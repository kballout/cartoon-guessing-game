"use client";

import React, { useState, useEffect } from 'react';
import characterData from '../../characters.json';
import Character from './Character';
import Image from 'next/image';

import { ANSWERFEEDBACKIMAGE } from "../types";


export enum GAMESTATUS {
    'LOADING',
    'WAITINGINPUT',
    'LOADINGNEXTROUND',
    'GAMEOVER'
}

interface CharacterData {
    name: string;
    path: string;
    correct: boolean;
    // any other properties you might need for characters
}

const Game: React.FC = () => {
    const gameOptions = {
        'scoreStart': 0,
        'roundTimer': 10,
        'timerPenalty': 0,
        'timeBetweenRounds': 3,
        'round': 1,
        'gameOver': false,
        'totalRounds': 25,
    };
    const [gameStatus, setGameStatus] = useState<GAMESTATUS>(GAMESTATUS.LOADING);
    const [score, setScore] = useState(gameOptions.scoreStart);
    const [round, setRound] = useState(gameOptions.round);
    const [roundTimer, setRoundTimer] = useState(gameOptions.roundTimer);
    const [timerPenalty, setTimerPenalty] = useState(gameOptions.timerPenalty);
    const [nextRoundTimer, setNextRoundTimer] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState<CharacterData | null>(null);
    const [selectedChoices, setSelectedChoices] = useState<CharacterData[]>([]);
    const [usedCharacters, setUsedCharacters] = useState<number[]>([]);
    const [isCharacterBlurred, setIsCharacterBlurred] = useState(false);
    const [answerFeedbackImage, setAnswerFeedbackImage] = useState<ANSWERFEEDBACKIMAGE | null>();
    const [won, setWon] = useState(false);

    useEffect(() => {
        startGame();
    }, []);

    useEffect(() => {
        if (round > 0 && round <= gameOptions.totalRounds) {
            selectCharacterAndChoices();
            setIsCharacterBlurred(true);
        }
    }, [round]);

    useEffect(() => {
        let roundTimerId: NodeJS.Timeout;

        if (roundTimer > 0 && !gameOver) {
            roundTimerId = setTimeout(() => {
                setRoundTimer(roundTimer - 1);
                console.log('in round timer countdown');
            }, 1000); // Decrease by 1 every 1000 milliseconds (1 second)
        } else if (roundTimer === 0 && !gameOver && gameStatus === GAMESTATUS.WAITINGINPUT) {
            handleRoundAnswer(null); // Incorrect answer if time runs out
        }

        return () => clearTimeout(roundTimerId); // Cleanup on unmount/round change
    }, [roundTimer, gameOver, gameStatus]);


    useEffect(() => {
        let nextRoundTimerId: NodeJS.Timeout;

        if (nextRoundTimer > 0) {
            // Timer only starts if there's a selected character and nextRoundTimer is > 0
            nextRoundTimerId = setTimeout(() => {
                setNextRoundTimer(nextRoundTimer - 1);
            }, 1000);
        } else if (nextRoundTimer === 0 && gameStatus === GAMESTATUS.LOADINGNEXTROUND) {
            handleNextRound(); // Start the next round automatically
        }

        return () => clearTimeout(nextRoundTimerId);
    }, [nextRoundTimer, gameStatus]); // Dependencies for re-triggering the effect


    useEffect(() => {
        if (timerPenalty >= 10) {
            endGame(false);
        }
    }, [timerPenalty])



    const startGame = () => {
        setAnswerFeedbackImage(null);
        setScore(gameOptions.scoreStart);
        setRound(gameOptions.round);
        setRoundTimer(gameOptions.roundTimer);
        setTimerPenalty(gameOptions.timerPenalty);
        setGameOver(gameOptions.gameOver);
        setGameStatus(GAMESTATUS.WAITINGINPUT);
    }


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
        const selectedCharacterWithCorrect: CharacterData = {
            ...selectedCharacter,
            correct: true, // Add the 'correct' property
        };
        setSelectedCharacter(selectedCharacterWithCorrect);
        setUsedCharacters(prevUsedCharacters => [...prevUsedCharacters, characterData.indexOf(selectedCharacter)]);



        const incorrectChoices: CharacterData[] = [];
        const usedNames = new Set([selectedCharacterWithCorrect.name]);
        while (incorrectChoices.length < 3) {
            const randomIndex = Math.floor(Math.random() * characterData.length);
            const choice = characterData[randomIndex];
            if (!usedNames.has(choice.name) && choice !== selectedCharacterWithCorrect) {
                const choiceWithCorrect: CharacterData = {
                    ...choice,
                    correct: false
                }
                incorrectChoices.push(choiceWithCorrect);
                usedNames.add(choice.name);
            }
        }

        const allChoices = [...incorrectChoices, selectedCharacterWithCorrect];
        shuffleArray(allChoices);
        setSelectedChoices(allChoices);
    };

    const handleRoundAnswer = (isCorrect: boolean | null) => {
        setIsCharacterBlurred(false);
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

        if (round < gameOptions.totalRounds && timerPenalty <= gameOptions.roundTimer) {
            setNextRoundTimer(gameOptions.timeBetweenRounds);
        } else {
            endGame(timerPenalty <= gameOptions.roundTimer && score > 0); // End game after 25 rounds
        }
    };

    const handleNextRound = () => {
        setAnswerFeedbackImage(null);
        setRound(round + 1);
        setRoundTimer(gameOptions.roundTimer - timerPenalty);
        setGameStatus(GAMESTATUS.WAITINGINPUT);
    }

    const endRound = () => {
        setGameStatus(GAMESTATUS.LOADINGNEXTROUND);
        setIsCharacterBlurred(false);
        if (round < gameOptions.totalRounds) {
            setNextRoundTimer(gameOptions.timeBetweenRounds);
        } else {
            endGame(score >= 25); // End game after 25 rounds
        }
    }

    const endGame = (didWin: boolean) => {
        setRoundTimer(0);
        setGameStatus(GAMESTATUS.GAMEOVER)
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
            <div className="flex space-y-14 flex-col items-center">

                <div className="text-white font-semibold text-2xl">
                    {nextRoundTimer != 0 ? (
                        <div>
                            <p>Next Round In: {nextRoundTimer}s</p>
                            <p>&nbsp;</p>
                        </div>
                    ) : (
                        <div>
                            <p>Timer: {roundTimer}s</p>
                            <p>Timer Penalty: {timerPenalty}s</p>
                        </div>
                    )}
                </div>
                <div className="text-white font-semibold text-2xl">
                    <p>Current Score: {score}</p>
                    <p>Round: {round} / {gameOptions.totalRounds}</p>
                </div>
            </div>

            <div className="flex flex-col rounded-2xl px-5 py-2 my-10">
                <p className="text-white font-bold text-xl border-b mb-4 text-center">
                    Who is this?
                </p>

                {selectedCharacter && (
                    <Character character={selectedCharacter} isBlurred={isCharacterBlurred} />
                )}

                <div
                    className={`absolute flex items-center justify-center ${gameStatus !== GAMESTATUS.LOADINGNEXTROUND && "hidden"
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


            <div className="flex space-x-5 flex-end">
                {selectedChoices.map((choice, index) => (
                    <button
                        key={index}
                        className={`optionBtn ${gameStatus === GAMESTATUS.WAITINGINPUT
                            ? "bg-blue-800/30"
                            : choice.correct
                                ? "bg-green-800"
                                : "bg-red-800"
                            }`}
                        onClick={() => handleRoundAnswer(choice.name === selectedCharacter?.name)}>
                        {choice.name}
                    </button>
                ))}

            </div>





            {gameOver && (

                <div
                    className={`absolute bg-white/90 w-1/2 rounded-lg px-8 py-6 flex flex-col ${!gameOver && "hidden"
                        }`}
                >
                    <div className="font-bold text-4xl text-center border-b-2 border-b-slate-800 mb-8">
                        GAME OVER
                    </div>
                    <div className="flex-1">
                        <div className="text-xl text-center"><p>You {won ? "won" : "lost"} with a score of {score}.</p></div>
                    </div>

                    <div className="flex w-full mt-12">
                        <a
                            href="/"
                            className="text-center flex-1 bg-white-800/30 text-slate-400 px-8 py-5 rounded-3xl border-slate-400 border-4 font-bold text-3xl"
                        >
                            Go Home
                        </a>
                        <button
                            type="button"
                            onClick={(() => startGame())}
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

export default Game;