'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'

const e = React.createElement
const API = process.env.NEXT_PUBLIC_API_URL || 'https://api2.diarioinfo.com'

interface PollOption {
  _id: string
  text: string
  votes?: number
  imageUrl?: string
}

interface PollData {
  _id: string
  title: string
  description?: string
  options: PollOption[]
  status: 'draft' | 'active' | 'closed'
  totalVotes?: number
  settings?: {
    showResultsBeforeVote?: boolean
    showResultsAfterVote?: boolean
    showResultsAfterClose?: boolean
  }
}

interface Props {
  pollId: string
  className?: string
}

function getDeviceToken(): string {
  if (typeof window === 'undefined') return ''
  const key = 'poll_device_token'
  let token = localStorage.getItem(key)
  if (!token) {
    token = (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36))
    localStorage.setItem(key, token)
  }
  return token
}

export default function PollWidget({ pollId, className }: Props) {
  const [poll, setPoll] = useState<PollData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [voted, setVoted] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(function () {
    const votedFlag = typeof window !== 'undefined' ? localStorage.getItem('poll_voted_' + pollId) : null
    if (votedFlag) {
      setVoted(true)
      setSelected(votedFlag)
    }
    fetch(API + '/poll/' + pollId + '?deviceToken=' + encodeURIComponent(getDeviceToken()))
      .then(function (r) { return r.json() })
      .then(function (data) {
        if (data && data.success) {
          setPoll(data.poll)
          if (data.alreadyVoted) setVoted(true)
        }
        else setError((data && data.message) || 'No se pudo cargar la encuesta')
      })
      .catch(function () { setError('No se pudo cargar la encuesta') })
      .finally(function () { setLoading(false) })
  }, [pollId])

  const handleVote = async (optionIndex: number, optionId: string) => {
    if (submitting || voted) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(API + '/poll/' + pollId + '/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIndex: optionIndex, deviceToken: getDeviceToken() }),
      })
      const data = await res.json()
      if (res.status === 409) {
        setVoted(true)
        setError(null)
        if (data && data.poll) setPoll(data.poll)
        localStorage.setItem('poll_voted_' + pollId, optionId)
        return
      }
      if (!res.ok) {
        setError((data && data.message) || 'No se pudo registrar tu voto')
        return
      }
      setPoll(data.poll)
      setVoted(true)
      setSelected(optionId)
      localStorage.setItem('poll_voted_' + pollId, optionId)
    } catch (err) {
      setError('Error de conexión al votar')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return e('div', { className: 'flex items-center justify-center gap-2 py-8 text-gray-500 dark:text-gray-400 ' + (className || '') },
      e(Loader2, { className: 'w-5 h-5 animate-spin' }),
      e('span', { className: 'text-sm' }, 'Cargando encuesta...')
    )
  }

  if (!poll) {
    return e('div', { className: 'flex items-center gap-2 py-4 text-sm text-gray-500 dark:text-gray-400 ' + (className || '') },
      e(AlertTriangle, { className: 'w-4 h-4' }),
      e('span', null, error || 'Encuesta no disponible')
    )
  }

  const total = poll.totalVotes != null ? poll.totalVotes : poll.options.reduce(function (sum, o) { return sum + (o.votes || 0) }, 0)
  const showResults = voted || poll.status === 'closed' || (poll.settings && poll.settings.showResultsBeforeVote)

  const optionNodes = poll.options.map(function (opt, idx) {
    const votes = opt.votes || 0
    const pct = total > 0 ? Math.round((votes / total) * 100) : 0
    const isSelected = selected === opt._id

    if (showResults) {
      return e('div', { key: opt._id, className: 'relative' },
        e('div', { className: 'flex items-center justify-between text-sm mb-1' },
          e('span', { className: 'flex items-center gap-2 font-medium ' + (isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-gray-700 dark:text-gray-200') },
            opt.imageUrl ? e('img', { src: opt.imageUrl, alt: '', className: 'w-6 h-6 rounded object-cover flex-shrink-0' }) : null,
            opt.text + ' ',
            isSelected ? e(CheckCircle2, { className: 'inline w-3.5 h-3.5 ml-1' }) : null
          ),
          e('span', { className: 'text-gray-500 dark:text-gray-400 text-xs' }, pct + '%')
        ),
        e('div', { className: 'h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden' },
          e('div', {
            className: 'h-full rounded-full transition-all duration-500 ' + (isSelected ? 'bg-rose-600' : 'bg-gray-300 dark:bg-gray-600'),
            style: { width: pct + '%' },
          })
        )
      )
    }

    return e('button', {
      key: opt._id,
      disabled: submitting || poll.status !== 'active',
      onClick: function () { handleVote(idx, opt._id) },
      className: 'w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-100 hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    },
      opt.imageUrl ? e('img', { src: opt.imageUrl, alt: '', className: 'w-8 h-8 rounded object-cover flex-shrink-0' }) : null,
      opt.text
    )
  })

  return e('div', { className: 'rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm ' + (className || '') },
    e('div', { className: 'flex items-center gap-2 mb-1' },
      e('span', { className: 'inline-block px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded uppercase tracking-wide' }, 'Encuesta'),
      poll.status === 'closed' ? e('span', { className: 'text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase' }, 'Finalizada') : null
    ),
    e('h3', { className: 'text-base font-bold text-gray-900 dark:text-white leading-snug mb-1' }, poll.title),
    poll.description ? e('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-4' }, poll.description) : null,
    e('div', { className: 'space-y-2 mt-3' }, optionNodes),
    error ? e('p', { className: 'mt-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1' },
      e(AlertTriangle, { className: 'w-3.5 h-3.5' }), ' ' + error
    ) : null,
    showResults ? e('p', { className: 'mt-4 text-xs text-gray-400 dark:text-gray-500' }, total + (total === 1 ? ' voto' : ' votos')) : null
  )
}
