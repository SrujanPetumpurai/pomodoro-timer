'use client'
import { useState, useEffect, useRef, useTransition } from 'react'
import { getUserTopics, createTopic } from '@/lib/topics'
import { m6x11 } from '../../lib/fonts'
import { Tag, X, Plus, Check } from 'lucide-react'

type Topic = { id: string; name: string; color: string }

export default function TopicPicker({
  selectedTopicId,
  onSelect,
}: {
  selectedTopicId: string | null
  onSelect: (topicId: string | null) => void
}) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getUserTopics().then(setTopics)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  useEffect(() => {
    if (creating) inputRef.current?.focus()
  }, [creating])

  const handleCreate = () => {
    if (!newName.trim()) return
    startTransition(async () => {
      const topic = await createTopic(newName.trim())
      setTopics((prev) => [topic, ...prev])
      onSelect(topic.id)
      setNewName('')
      setCreating(false)
    })
  }

  const selectedTopic = topics.find((t) => t.id === selectedTopicId)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`${m6x11.className} flex items-center gap-2 rounded-full border-2 border-gray-900 bg-white/80 px-4 py-1.5 text-sm text-gray-800 shadow-[2px_2px_0_0_rgba(0,0,0,0.9)] transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.9)] active:translate-y-0 active:shadow-[1px_1px_0_0_rgba(0,0,0,0.9)]`}
      >
        <span
          className="h-2.5 w-2.5 rounded-full border border-gray-900"
          style={{ backgroundColor: selectedTopic?.color ?? '#d1d5db' }}
        />
        {selectedTopic ? selectedTopic.name : 'No topic'}
      </button>


      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-80 rounded-2xl border-4 border-gray-900 bg-[#FBF8F3] p-5 shadow-[6px_6px_0_0_rgba(0,0,0,0.9)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`${m6x11.className} flex items-center gap-2 text-xl text-gray-900`}>
                <Tag size={18} className="text-[#D97757]" />
                Pick a topic
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md border-2 border-gray-900 bg-white p-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.9)] hover:bg-gray-100 active:translate-y-0.5 active:shadow-none"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  onSelect(null)
                  setIsOpen(false)
                }}
                className={`flex items-center justify-between rounded-lg border-2 px-3 py-2 text-left text-sm transition-colors ${
                  selectedTopicId === null
                    ? 'border-gray-900 bg-[#D97757] text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full border border-current" />
                  No topic
                </span>
                {selectedTopicId === null && <Check size={16} />}
              </button>

              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelect(t.id)
                    setIsOpen(false)
                  }}
                  className={`flex items-center justify-between rounded-lg border-2 px-3 py-2 text-left text-sm transition-colors ${
                    selectedTopicId === t.id
                      ? 'border-gray-900 bg-[#D97757] text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-gray-900"
                      style={{ backgroundColor: t.color }}
                    />
                    {t.name}
                  </span>
                  {selectedTopicId === t.id && <Check size={16} />}
                </button>
              ))}
            </div>

            <div className="mt-4 border-t-2 border-dashed border-gray-300 pt-3">
              {creating ? (
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    placeholder="Topic name"
                    className="flex-1 rounded-lg border-2 border-gray-900 px-2 py-1.5 text-sm outline-none focus:border-[#D97757]"
                  />
                  <button
                    onClick={handleCreate}
                    disabled={isPending}
                    className="rounded-lg border-2 border-gray-900 bg-[#D97757] px-3 py-1.5 text-sm font-semibold text-white shadow-[2px_2px_0_0_rgba(0,0,0,0.9)] disabled:opacity-50 active:translate-y-0.5 active:shadow-none"
                  >
                    {isPending ? '...' : 'Add'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCreating(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-400 py-2 text-sm text-gray-600 hover:border-[#D97757] hover:text-[#D97757]"
                >
                  <Plus size={14} />
                  New topic
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}