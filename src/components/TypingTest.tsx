'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

// Custom hook for count-up animation
const useCountUp = (end: number, duration: number = 3000, start: number = 0) => {
    const [count, setCount] = useState(start);

    useEffect(() => {
        if (end === start) return;
        
        const startTime = Date.now();
        const range = end - start;

        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.round(start + range * easeOutQuart);
            
            setCount(current);

            if (progress === 1) {
                clearInterval(timer);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [end, duration, start]);

    return count;
};

const WORD_BANK = [
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
        'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
        'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
        'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so',
        'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
        'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people',
        'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
        'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back',
        'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
        'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is',
        'where', 'much', 'own', 'such', 'need', 'man', 'find', 'here', 'thing', 'give',
        'many', 'through', 'long', 'great', 'world', 'ask', 'different', 'large', 'turn', 'move',
        'right', 'boy', 'old', 'too', 'same', 'tell', 'does', 'set', 'three', 'want',
        'air', 'put', 'read', 'hand', 'port', 'large', 'spell', 'add', 'land', 'here',
        'must', 'big', 'high', 'such', 'follow', 'act', 'why', 'ask', 'change', 'went',
        'light', 'kind', 'off', 'need', 'house', 'picture', 'try', 'again', 'animal', 'point',
        'mother', 'world', 'near', 'build', 'self', 'earth', 'father', 'head', 'stand', 'page',
        'should', 'country', 'found', 'answer', 'school', 'grow', 'study', 'still', 'learn', 'plant',
        'cover', 'food', 'sun', 'four', 'between', 'state', 'keep', 'eye', 'never', 'last',
        'let', 'thought', 'city', 'tree', 'cross', 'farm', 'hard', 'start', 'might', 'story'
];

const generateWords = (count: number): string[] => {
    const words: string[] = [];
    for (let i = 0; i < count; i++) {
        words.push(WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
    }
    return words;
};

export default function TypingTest() {
    const [words, setWords] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [correctChars, setCorrectChars] = useState(0);
    const [incorrectChars, setIncorrectChars] = useState(0);
    const [skippedWords, setSkippedWords] = useState(0);
    const [totalChars, setTotalChars] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [countdown, setCountdown] = useState(60);
    const [isActive, setIsActive] = useState(false);
    const [wpm, setWpm] = useState(0);
    const [finalWpm, setFinalWpm] = useState(0);
    const [finalTime, setFinalTime] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [isFinished, setIsFinished] = useState(false);
    const [lastSpaceTime, setLastSpaceTime] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setWords(generateWords(50));
    }, []);

    // Countdown timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && countdown > 0 && !isFinished) {
            interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        const elapsedSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 60;
                        setFinalTime(elapsedSeconds);
                        setIsFinished(true);
                        setIsActive(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, countdown, isFinished, startTime]);

    useEffect(() => {
        if (startTime && currentWordIndex < words.length) {
            const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
            const grossWpm = Math.round((correctChars / 5) / elapsedMinutes) || 0;
            const errorRate = incorrectChars / 5;
            const netWpm = Math.max(0, Math.round(grossWpm - (errorRate / elapsedMinutes)));
            setWpm(netWpm);
        }
    }, [currentWordIndex, startTime, words.length, correctChars, incorrectChars]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        if (!startTime) {
            setStartTime(Date.now());
            setIsActive(true);
        }

        if (value.endsWith(' ')) {
            const now = Date.now();
            if (now - lastSpaceTime < 150) {
                return;
            }
            setLastSpaceTime(now);
            
            const typedWord = value.trim();
            
            // Prevent empty space spam
            if (typedWord === '') {
                setCurrentInput('');
                return;
            }
            
            const currentWord = words[currentWordIndex];
            
            setTotalChars(prev => prev + currentWord.length);
            
            // Check if the word is exactly correct
            if (typedWord === currentWord) {
                setCorrectChars(prev => prev + currentWord.length);
            } else {
                // Count character-by-character errors
                let correct = 0;
                let incorrect = 0;
                for (let i = 0; i < Math.max(typedWord.length, currentWord.length); i++) {
                    if (i < typedWord.length && i < currentWord.length) {
                        if (typedWord[i] === currentWord[i]) {
                            correct++;
                        } else {
                            incorrect++;
                        }
                    } else {
                        incorrect++;
                    }
                }
                
                setCorrectChars(prev => prev + correct);
                setIncorrectChars(prev => prev + incorrect);
            }
            
            const newAccuracy = Math.round((correctChars) / (totalChars + currentWord.length) * 100) || 100;
            setAccuracy(newAccuracy);

            if (currentWordIndex === words.length - 1) {
                const elapsedSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 60;
                setFinalWpm(wpm);
                setFinalTime(elapsedSeconds);
                setIsFinished(true);
                setIsActive(false);
            } else {
                setCurrentWordIndex(prev => prev + 1);
                setCurrentCharIndex(0);
                setCurrentInput('');
            }
        } else {
            setCurrentInput(value);
            setCurrentCharIndex(value.length);
        }
    };

    const handleRestart = useCallback(() => {
        setWords(prev => prev.length > 0 ? generateWords(prev.length) : generateWords(50));
        setCurrentInput('');
        setCurrentWordIndex(0);
        setCurrentCharIndex(0);
        setCorrectChars(0);
        setIncorrectChars(0);
        setSkippedWords(0);
        setTotalChars(0);
        setStartTime(null);
        setCountdown(60);
        setIsActive(false);
        setWpm(0);
        setFinalWpm(0);
        setFinalTime(0);
        setAccuracy(100);
        setIsFinished(false);
        setLastSpaceTime(0);
        inputRef.current?.focus();
    }, []);

    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && isFinished) {
                handleRestart();
            }
            if (e.key === 'Escape') {
                handleRestart();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isFinished, handleRestart]);

    const getCharClass = (wordIndex: number, charIndex: number) => {
        if (wordIndex < currentWordIndex) {
            return 'text-gray-400 transition-all duration-200';
        }
        if (wordIndex > currentWordIndex) {
            return 'text-gray-300 transition-all duration-200';
        }
        
        if (charIndex < currentInput.length) {
            const isCorrect = currentInput[charIndex] === words[wordIndex][charIndex];
            return isCorrect
                ? 'text-gray-900 transition-all duration-200'
                : 'text-red-500 transition-all duration-300 ease-out';
        }
        
        return 'text-gray-300 transition-all duration-200';
    };

    const shouldShowCursor = (wordIndex: number, charIndex: number) => {
        return wordIndex === currentWordIndex && charIndex === currentCharIndex && startTime !== null;
    };

    const getVisibleWords = () => {
        const wordsPerLine = 8;
        const totalLines = 3;
        const startIdx = Math.floor(currentWordIndex / wordsPerLine) * wordsPerLine;
        const endIdx = startIdx + (wordsPerLine * totalLines);
        return words.slice(startIdx, endIdx);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
                <div className="rounded-2xl px-6 py-3">
                    <div className="flex items-center gap-4">
                        <a href="/" className="">
                        <Image
                            src="/wpm.png"
                            alt="WPM Logo"
                            width={48}
                            height={48}
                        />
                        </a>
                        <div className="bg-gray-300/50 w-px h-5"></div>
                        <div className="text-xs text-gray-500 font-medium">Typing Test</div>
                    </div>
                </div>
            </div>

            <div className="h-32"></div>

            <div className="flex-1 flex items-center justify-center px-8 pb-16 relative z-10">
                <div className="w-full max-w-5xl">
                    {!isFinished ? (
                        <div className="flex flex-col items-center space-y-12">
                            
                    {/* Timer */}
                    <div className={`text-6xl font-mono tabular-nums transition-all duration-500 ${
                        countdown <= 10 ? 'text-red-500 scale-110' : 'text-black'
                    } ${
                        startTime ? 'opacity-100' : 'opacity-0'
                    }`}>
                        {countdown}
                    </div>

                        <div className="text-sm text-gray-400 font-medium">
                            {currentWordIndex} / {words.length}
                        </div>

                        <div className="flex gap-1">
                                {[50, 100, 150, 200].map((count) => (
                                        <button
                                                key={count}
                                                onClick={() => {
                                                        if (words.length !== count) {
                                                                setWords(generateWords(count));
                                                                handleRestart();
                                                        }
                                                }}
                                                disabled={startTime !== null}
                                                className={`px-4 py-1.5 rounded cursor-pointer text-xs font-medium transition-all ${
                                                        words.length === count
                                                                ? 'text-orange-500'
                                                                : 'text-gray-400 hover:text-gray-600'
                                                } ${startTime !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                                {count}
                                        </button>
                            ))}
                        </div>

                        <div className="w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

                            <div 
                                ref={containerRef}
                                className="w-full px-16 py-8 cursor-text transition-all duration-500"
                                onClick={handleContainerClick}
                            >
                                                        <div className="text-3xl leading-relaxed tracking-wide h-[180px] overflow-hidden transition-all duration-500 font-mono">
                                                            {getVisibleWords().map((word, idx) => {
                                                                const globalIndex = Math.floor(currentWordIndex / 8) * 8 + idx;
                                                                return (
                                                                    <span key={globalIndex} className="inline-block mr-5 my-1 transition-all duration-300 relative">
                                                                        {word.split('').map((char, charIndex) => (
                                                                            <span key={charIndex} className="relative inline-block">
                                                                                <span className={getCharClass(globalIndex, charIndex)}>
                                                                                    {char}
                                                                                </span>
                                                                                {shouldShowCursor(globalIndex, charIndex) && (
                                                                                    <span className="absolute z-100 -left-1 top-1/2 -translate-y-1/2 w-0.5 h-7 bg-orange-500 rounded-full animate-pulse-smooth"></span>
                                                                                )}
                                                                            </span>
                                                                        ))}
                                                                        {globalIndex === 0 && startTime === null && (
                                                                            <span className="absolute z-100 -left-1 z-100 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-orange-500 rounded-full animate-pulse-smooth"></span>
                                                                        )}
                                                                    </span>
                                                                );
                                                            })}
                                </div>
        
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={currentInput}
                                    onChange={handleInputChange}
                                    autoFocus
                                    className="absolute opacity-0 pointer-events-none"
                                    autoComplete="off"
                                    autoCapitalize="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                />
                            </div>

                        <div className="w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

                            <div className="w-full max-w-2xl flex flex-col items-center justify-center gap-3">
                                <p className="text-sm text-gray-400">
                                    Click and start typing
                                </p>

                                <p className="text-xs text-gray-400">
                                         Press <kbd className="px-2 py-1 bg-white rounded border border-gray-200 font-mono text-xs">Esc</kbd> to restart
                                </p>
                            </div>
                        </div>
                    ) : (
                        <ResultsScreen 
                            finalWpm={finalWpm}
                            finalTime={finalTime}
                            accuracy={accuracy}
                            correctChars={correctChars}
                            incorrectChars={incorrectChars}
                            skippedWords={skippedWords}
                            onRestart={handleRestart}
                        />
                    )}
                </div>
            </div>
                
            <div className="h-8"></div>
            <footer className="fixed bottom-0 left-0 right-0 z-200 py-4 bg-gray-50/80 backdrop-blur-sm border-t border-gray-200/50">
                <div className="max-w-5xl mx-auto px-8 flex items-center justify-center gap-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <span className="text-gray-400">Built with</span>
                        <span className="font-semibold text-gray-600">Next.js</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-gray-400">by</span>
                        <a 
                            href="https://batuhan.tech" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="font-medium text-orange-500 hover:text-orange-600 transition-colors"
                        >
                            Batuhan Eroğlu
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function ResultsScreen({
    finalWpm,
    finalTime,
    accuracy,
    correctChars,
    incorrectChars,
    skippedWords,
    onRestart
}: {
    finalWpm: number;
    finalTime: number;
    accuracy: number;
    correctChars: number;
    incorrectChars: number;
    skippedWords: number;
    onRestart: () => void;
}) {
    const animatedWpm = useCountUp(finalWpm, 2000, 0);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center space-y-10 animate-fade-in">
            
            <div className="text-center">
                <div className="text-9xl font-bold text-orange-500 tabular-nums">
                    {animatedWpm}
                </div>
                <div className="text-lg text-gray-500 mt-4 font-medium">words per minute</div>
                <div className="text-sm text-gray-400 mt-2">completed in {formatTime(finalTime)}</div>
            </div>  

            <div className="grid grid-cols-3 gap-8 w-full max-w-3xl">
                <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
                    <div className="text-4xl font-bold text-gray-700">{accuracy}%</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mt-2">accuracy</div>
                </div>
                <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
                    <div className="text-4xl font-bold text-gray-700">{correctChars}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mt-2">correct (letters)</div>
                </div>
                <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
                    <div className="text-4xl font-bold text-gray-700">{incorrectChars}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mt-2">errors (letters)</div>
                </div>
            </div>

            <div className={`px-8 py-3 rounded-full font-bold text-sm ${
                finalWpm >= 60 ? 'bg-green-600 text-white' :
                finalWpm >= 40 ? 'bg-yellow-600 text-white' :
                finalWpm >= 20 ? 'bg-orange-600 text-white' :
                'bg-red-600 text-white'
            }`}>
                {finalWpm >= 60 ? 'Expert' :
                 finalWpm >= 40 ? 'Advanced' :
                 finalWpm >= 20 ? 'Intermediate' :
                 'Beginner'}
            </div>

            <button
                onClick={onRestart}
                className="px-12 py-4 cursor-pointer border border-orange-500 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all"
            >
                Try Again
            </button>

            <p className="text-xs text-gray-400">
                Press <kbd className="px-2 py-1 bg-white rounded border border-gray-200 font-mono text-xs">Esc</kbd> to restart
            </p>
        </div>
    );
}
