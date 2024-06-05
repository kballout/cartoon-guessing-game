"use client";

import React from 'react';
import Image from 'next/image';

interface CharacterProps {
    character: {
        name: string;
        path: string;
    } | null;
    isBlurred: boolean;
}

const Character: React.FC<CharacterProps> = ({ character, isBlurred }) => {
    if (!character) {
        return null;
    }

    return  (
        <div className="">
            <Image
            className={`h-[300px] object-contain ${
                isBlurred && "blur-md"
              } `}
                src={character.path}
                alt="Guess the character"
                width={300}
                height={300}
                priority
            />
        </div>
    )
};

export default Character;