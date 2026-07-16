'use client'
import './Timer.css'
import { m6x11 } from '../../lib/fonts'
import IconBtn from "./IconBtn"
import { Maximize, Play,Pause } from "lucide-react"
import { useState, useEffect } from 'react'
import type { Session } from 'next-auth'
import ModeTabs from "./ModeTab"
import Cycle from "./Cycle"
import TopicPicker from "./TopicPicker"
import { logFocusSession } from '@/lib/focusSession'
import type { ModeKey } from './ModeTab'

const DURATIONS: Record<ModeKey, number> = {
    pomodoro: 1500,
    short_break: 300,
    long_break: 600,
}

export default function Timer({session}:{ session: Session | null }){
    const radius = 125
    const circumference = 2 * Math.PI * radius
    const [cycles, setCycles] = useState(0)
    const [topicId, setTopicId] = useState<string | null>(null)
    const [mode, setMode] = useState<ModeKey>("pomodoro")
    const totalSeconds = DURATIONS[mode]
    const [secondsLeft, setSecondsLeft] = useState(DURATIONS.pomodoro)
    const [isRunning, setIsRunning] = useState(false)
    const [cx, cy] = [140, 140]
    const strokeWidth = 30

    const giveMedal = () => {
        console.log('bronze medal')
    }

    const handleMode = (key: ModeKey) => {
        setSecondsLeft(DURATIONS[key])
        setMode(key)
        setIsRunning(false)
    }

    useEffect(() => {
  if (!isRunning) return
  const intervalId = setInterval(() => {
    setSecondsLeft((prev) => {
      if (prev <= 0) {
        clearInterval(intervalId)
        setIsRunning(false)
        setSecondsLeft(DURATIONS.pomodoro)
        return 0
      }
      return prev - 1
    })
  }, 1000)
  return () => clearInterval(intervalId)
}, [isRunning])
useEffect(() => {
     const logSession=async()=>{
        if (secondsLeft !== 0 || mode !== "pomodoro" || !session?.user?.id) return
        try {
            await logFocusSession(topicId)
            setCycles((c) => c + 1)
            } catch (err) {
            console.error('Failed to log focus session', err)
            }
    }
    logSession();
}, [secondsLeft])
    const progressRatio = secondsLeft / totalSeconds
    const offset = circumference * progressRatio

    const minutes = Math.floor(secondsLeft / 60)
    const seconds = secondsLeft % 60
    const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

    return (
        <section className="pomodoro-card bg-white/40 flex flex-col items-center gap-y-4 backdrop-blur-xs rounded-2xl px-8 py-8 sm:w-100 md:w-120">
            <header className="control-btns flex justify-between w-full mx-8">
                <IconBtn color='orange' onClick={() => setIsRunning((prev) => !prev)} icon={isRunning ? Pause : Play}></IconBtn>
                <IconBtn color='orange' icon={Maximize}></IconBtn>
            </header>

            {session?.user && (
                <TopicPicker selectedTopicId={topicId} onSelect={setTopicId} />
            )}

            <section className="timer">
               <div className="outer">
                <svg
                    className="progress-ring"
                    viewBox="0 0 280 280"
                    width="280"
                    height="280"
                    style={{ transform: 'rotate(-90deg)' }}
                >
                    <circle r={radius} cx={cx} cy={cy} fill="transparent" stroke="white" strokeWidth={strokeWidth} />
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
                <div className="inner font-light">
                    <span className={`timer-text ${m6x11.className} text-9xl text-gray-900`}>{displayTime}</span>
                </div>
               </div>
            </section>
            <section className="pomo-cycle">
                <Cycle completedCycles={cycles}></Cycle>
            </section>
            <section className="modes">
                <ModeTabs onChange={(key: ModeKey) => handleMode(key)}></ModeTabs>
            </section>
        </section>
    )
}