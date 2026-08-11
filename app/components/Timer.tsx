'use client'
import './Timer.css'
import { m6x11 } from '../../lib/fonts'
import IconBtn from "./IconBtn"
import { Maximize, Play, Pause } from "lucide-react"
import { useState, useEffect, useRef } from 'react'
import type { Session } from 'next-auth'
import ModeTabs from "./ModeTab"
import Cycle from "./Cycle"
import { logFocusSession } from '@/lib/focusSession'
import type { ModeKey } from './ModeTab'

const DURATIONS: Record<ModeKey, number> = {
    pomodoro: 1500,
    short_break: 300,
    long_break: 600,
}


type Phase = 'idle' | 'charging' | 'running' | 'clashing' | 'blast'

const CHARGE_DURATION_MS = 4000

export default function Timer({ session }: { session: Session | null }) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [cycles, setCycles] = useState(0)
    const [topicId] = useState<string | null>(null)
    const [mode, setMode] = useState<ModeKey>("pomodoro")
    const totalSeconds = DURATIONS[mode]
    const [secondsLeft, setSecondsLeft] = useState(DURATIONS.pomodoro)
    const [isRunning, setIsRunning] = useState(false)
    const completeSoundRef = useRef<HTMLAudioElement | null>(null)
    const CLASH_THRESHOLD = 0.92
    const endTimeRef = useRef<number | null>(null)
    const blastSoundRef = useRef<HTMLAudioElement | null>(null)

    const playBlastSound = () => {
        if (!blastSoundRef.current) {
            blastSoundRef.current = new Audio('/kenney_interface-sounds/Audio/impact_002.ogg')
        }
        blastSoundRef.current.currentTime = 0
        blastSoundRef.current.play().catch(() => {})
    }

    const elapsed = totalSeconds - secondsLeft
    const progress = Math.min(1, Math.max(0, elapsed / totalSeconds))

    const giveMedal = () => {
        console.log('bronze medal')
    }

    useEffect(() => {
        if (!isRunning) {
            if (phase !== 'clashing' && phase !== 'blast') {
                setPhase('idle')
            }
            return
        }

        if (phase === 'idle') {
            setPhase('charging')
            const chargeTimer = setTimeout(() => {
                setPhase('running')
            }, CHARGE_DURATION_MS)
            return () => clearTimeout(chargeTimer)
        }
    }, [isRunning])

    // --- running -> clashing -> blast, driven by progress ---
    useEffect(() => {
        if (progress >= CLASH_THRESHOLD && phase === 'running') {
            setPhase('clashing')
            const blastTimer = setTimeout(() => {
                setPhase('blast')
                playBlastSound()
            }, 400) // let the clash pose hold briefly before the blast pops
            return () => clearTimeout(blastTimer)
        }
        // only reset out of clashing/blast when a fresh cycle starts —
        // don't stomp on 'idle' or 'charging'
        if (progress < CLASH_THRESHOLD && (phase === 'clashing' || phase === 'blast')) {
            setPhase('running')
        }
    }, [progress, phase])

    const handleMode = (key: ModeKey) => {
        setSecondsLeft(DURATIONS[key])
        setMode(key)
        setIsRunning(false)
        setPhase('idle')
        endTimeRef.current = null
    }

    useEffect(() => {
        const logSession = async () => {
            if (secondsLeft !== 0 || mode !== "pomodoro" || !session?.user?.id) return
            try {
                await logFocusSession(topicId)
                setCycles((c) => c + 1)
            } catch (err) {
                console.error('Failed to log focus session', err)
            }
        }
        logSession()
    }, [secondsLeft])

    useEffect(() => {
        if (secondsLeft === 0 && !isRunning) {
            setSecondsLeft(DURATIONS.pomodoro)
        }
    }, [secondsLeft, isRunning])

    const handleToggleRunning = () => {
        setIsRunning((prev) => {
            const next = !prev
            if (next) {
                endTimeRef.current = Date.now() + secondsLeft * 1000
            } else {
                endTimeRef.current = null
            }
            return next
        })
    }

    const minutes = Math.floor(secondsLeft / 60)
    const seconds = secondsLeft % 60
    const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

    // sprites hold at their starting corners while idle/charging,
    // only start closing the gap once phase === 'running'
    const runnerProgress =
        phase === 'idle' || phase === 'charging'
            ? 0
            : Math.min(progress, CLASH_THRESHOLD)

    return (
        <section className="relative w-full h-screen">
            <div className="absolute left-0 right-0 px-16">
                <div className="flex justify-center mt-8">
                    <span className={`timer-text ${m6x11.className} text-8xl text-gray-900`}>
                        {displayTime}
                    </span>
                </div>
                <div className="relative w-full h-[6px] bg-white/40 rounded-full">
                    <div
                        className="absolute left-0 top-0 h-full bg-[#D97757] rounded-full"
                        style={{ width: `${progress * 100}%`, transition: 'width 1s linear' }}
                    />
                    <div
                        className={`runner-naruto absolute -top-16 ${phase}`}
                        style={{
                            left: `calc(${runnerProgress * 50}% - 15px)`,
                            transition: phase === 'running' ? 'left 1s linear' : 'none',
                        }}
                    />
                    <div
                        className={`runner-sasuke absolute -top-16 ${phase}`}
                        style={{
                            right: `calc(${runnerProgress * 50}% - 15px)`,
                            transition: phase === 'running' ? 'right 1s linear' : 'none',
                        }}
                    />
                </div>
                <div
                    className={`blast-effect absolute -top-20 left-1/2 -translate-x-1/2 ${
                        phase === 'blast' ? 'blast-active' : 'opacity-0'
                    }`}
                />
                <header className="control-btns mt-8 flex justify-center w-full px-8 pt-8">
                    <IconBtn color='orange' onClick={handleToggleRunning} icon={isRunning ? Pause : Play}></IconBtn>
                </header>
            </div>
        </section>
    )
}