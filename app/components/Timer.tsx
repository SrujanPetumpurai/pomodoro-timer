'use client'
import './Timer.css'
import { m6x11 } from '../../lib/fonts'
import IconBtn from "./IconBtn"
import { Maximize, Play, Pause, Settings } from "lucide-react"
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
const MAX_SECONDS = 180 * 60 // sane upper bound: 3h

// format a total-seconds value as "MM:SS" for the editor input
const formatMMSS = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
}

// parse an "MM:SS", "MM:S", or plain "SS" string into total seconds.
// returns null if the input can't be parsed into a positive duration.
const parseMMSS = (input: string): number | null => {
    const trimmed = input.trim()
    if (!trimmed) return null

    if (trimmed.includes(':')) {
        const parts = trimmed.split(':')
        if (parts.length !== 2) return null
        const [minPart, secPart] = parts
        const minutes = parseInt(minPart, 10)
        const seconds = parseInt(secPart, 10)
        if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null
        if (minutes < 0 || seconds < 0 || seconds > 59) return null
        const total = minutes * 60 + seconds
        return total > 0 ? total : null
    }

    // no colon: treat the bare number as seconds
    const seconds = parseInt(trimmed, 10)
    if (!Number.isFinite(seconds) || seconds <= 0) return null
    return seconds
}

export default function Timer({ session }: { session: Session | null }) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [cycles, setCycles] = useState(0)
    const [topicId] = useState<string | null>(null)
    const [mode, setMode] = useState<ModeKey>("pomodoro")

    const [customDurations, setCustomDurations] = useState<Record<ModeKey, number>>(DURATIONS)
    const totalSeconds = customDurations[mode]

    const [secondsLeft, setSecondsLeft] = useState(customDurations.pomodoro)
    const [isRunning, setIsRunning] = useState(false)
    const completeSoundRef = useRef<HTMLAudioElement | null>(null)
    const endTimeRef = useRef<number | null>(null)
    const blastSoundRef = useRef<HTMLAudioElement | null>(null)

    // "change time" popover — now takes mm:ss (or bare seconds) instead of minutes-only
    const [showTimeEditor, setShowTimeEditor] = useState(false)
    const [customTimeInput, setCustomTimeInput] = useState(
        formatMMSS(customDurations.pomodoro)
    )
    const [timeEditorError, setTimeEditorError] = useState<string | null>(null)

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

   const CLASH_ANIM_MS = 1000   // your naruto/sasuke clash keyframes are 1s
const BLAST_ANIM_MS = 500    // your blast-effect keyframe is 0.5s
const SEQUENCE_SECONDS = Math.ceil((CLASH_ANIM_MS + BLAST_ANIM_MS) / 1000) // 2s

useEffect(() => {
    if (secondsLeft <= SEQUENCE_SECONDS && secondsLeft > 0 && phase === 'running') {
        setPhase('clashing')
        const blastTimer = setTimeout(() => {
            setPhase('blast')
            playBlastSound()
        }, CLASH_ANIM_MS) // fire blast exactly when clash animation finishes
        return () => clearTimeout(blastTimer)
    }

    if (secondsLeft > SEQUENCE_SECONDS && (phase === 'clashing' || phase === 'blast')) {
        setPhase('running')
    }
}, [secondsLeft, phase])
    useEffect(() => {
        if (!isRunning) return

        const tick = () => {
            if (endTimeRef.current == null) return
            const remaining = Math.round((endTimeRef.current - Date.now()) / 1000)
            if (remaining <= 0) {
                setSecondsLeft(0)
                setIsRunning(false)
                endTimeRef.current = null
            } else {
                setSecondsLeft(remaining)
            }
        }

        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [isRunning])

    const handleMode = (key: ModeKey) => {
        setSecondsLeft(customDurations[key])
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
            setSecondsLeft(customDurations.pomodoro)
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

    const handleApplyCustomTime = () => {
        const parsedSeconds = parseMMSS(customTimeInput)
        if (parsedSeconds == null) {
            setTimeEditorError('Enter time as mm:ss (e.g. 0:10 or 25:00)')
            return
        }

        const newSeconds = Math.min(parsedSeconds, MAX_SECONDS)
        setCustomDurations((prev) => ({ ...prev, [mode]: newSeconds }))
        setSecondsLeft(newSeconds)
        setIsRunning(false)
        setPhase('idle')
        endTimeRef.current = null
        setTimeEditorError(null)
        setShowTimeEditor(false)
    }

    const minutes = Math.floor(secondsLeft / 60)
    const seconds = secondsLeft % 60
    const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

    const runnerProgress =
    phase === 'idle' || phase === 'charging'
        ? 0
        : progress 
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
                <header className="control-btns mt-8 flex flex-col items-center gap-3 w-full px-8 pt-8">
                    <div className="flex items-center gap-3">
                        <IconBtn color='orange' onClick={handleToggleRunning} icon={isRunning ? Pause : Play}></IconBtn>

                        <button
                            type="button"
                            disabled={isRunning}
                            onClick={() => {
                                setCustomTimeInput(formatMMSS(totalSeconds))
                                setTimeEditorError(null)
                                setShowTimeEditor((v) => !v)
                            }}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Set custom time"
                        >
                            <Settings size={18} />
                        </button>
                    </div>

                    {showTimeEditor && (
                        <div className="flex flex-col items-center gap-2 bg-white rounded-lg shadow-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="mm:ss"
                                    value={customTimeInput}
                                    onChange={(e) => {
                                        setCustomTimeInput(e.target.value)
                                        if (timeEditorError) setTimeEditorError(null)
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleApplyCustomTime()
                                    }}
                                    className="w-20 border rounded px-2 py-1 text-gray-900"
                                />
                                <span className="text-sm text-gray-600">mm:ss</span>
                                <button
                                    onClick={handleApplyCustomTime}
                                    className="bg-[#D97757] text-white text-sm rounded px-3 py-1"
                                >
                                    Set
                                </button>
                            </div>
                            {timeEditorError && (
                                <span className="text-xs text-red-500">{timeEditorError}</span>
                            )}
                        </div>
                    )}
                </header>
            </div>
        </section>
    )
}