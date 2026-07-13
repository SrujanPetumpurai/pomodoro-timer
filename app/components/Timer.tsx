'use client'
import './Timer.css'
import IconBtn from "./IconBtn" 
import { Maximize,Play } from "lucide-react";
import { useState, useEffect } from 'react';
import ModeTabs from "./ModeTab";
import Cycle from "./Cycle";
import type { ModeKey } from './ModeTab';
const DURATIONS: Record<ModeKey, number> = {
    pomodoro: 1500,
    short_break: 300,
    long_break: 600,
};
export default function Timer(){
    const radius = 125;
    const circumference = 2 * Math.PI * radius;
    const [cycles,setCycles] = useState(0)
    const [mode, setMode] = useState<ModeKey>("pomodoro");
    const totalSeconds = DURATIONS[mode];
    const [secondsLeft, setSecondsLeft] = useState(1500);
    const [isRunning, setIsRunning] = useState(false);
    const [cx,cy]=[140,140]
    const strokeWidth= 30   ;
    const giveMedal = ()=>{
        return(
            console.log('brownse medal')
        )
    }
    const handleMode = (key:ModeKey)=>{
        setSecondsLeft(DURATIONS[key]);
        setMode(key);
        setIsRunning(false);
    }
    useEffect(() => {
        if (!isRunning) return;

        const intervalId = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(intervalId);
                    setIsRunning(false);
                    if (mode === "pomodoro") {
                        setCycles((c) => {
                            const next = c + 1;
                            if (next === 4) giveMedal();
                            return next;
                        });
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [isRunning]);

     const progressRatio = secondsLeft / totalSeconds;
    const offset = circumference * progressRatio;

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
   const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return(
        <section className="pomodoro-card bg-white/40 flex flex-col items-center gap-y-4 backdrop-blur-xs rounded-2xl px-8 py-8 sm:w-100 md:w-120">
            <header className="control-btns flex justify-between w-full mx-8">
                <IconBtn color='orange' onClick={()=>setIsRunning((prev)=>!prev)} icon={Play}></IconBtn>
                <IconBtn color='orange' icon={Maximize}></IconBtn>
            </header>
            <section className="timer">
               <div className="outer">
                <svg
                    className="progress-ring"
                    viewBox="0 0 280 280"
                    width="280"
                    height="280"
                    style={{ transform: 'rotate(-90deg)' }}
                >
                    <circle
                        r={radius}
                        cx={cx}
                        cy={cy}
                        fill="transparent"
                        stroke="white"
                        strokeWidth={strokeWidth}
                    />
                    <circle
                        r={radius}
                        cx={cx}
                        cy={cy}
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                </svg>
                <div className="inner font-tiny5 font-light">
                    <span className='timer-text text-7xl text-black'>{displayTime}</span>
                </div>
               </div>
            </section>
            <section className="pomo-cycle ">
                <Cycle completedCycles={2}></Cycle>
            </section>
            <section className="modes">
                <ModeTabs onChange={(key:ModeKey)=>handleMode(key)}></ModeTabs>
            </section>
        </section>
    )
}   

