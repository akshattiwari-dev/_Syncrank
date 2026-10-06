import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { API_URL } from '../api/client.js'

/**
 * Joins a contest's realtime room and keeps `standings` in sync as the
 * server broadcasts updates. Auth is via the same httpOnly cookie the REST
 * API uses (socket.io-client sends cookies automatically with
 * withCredentials). Reconnects automatically and re-joins the room on
 * reconnect — socket.io's default reconnection handles the transport
 * layer, this hook just re-runs the join handshake each time.
 */
export function useContestLiveStandings(contestId, { enabled = true } = {}) {
  const [standings, setStandings] = useState(null)
  const [connected, setConnected] = useState(false)
  const [joinError, setJoinError] = useState(null)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!enabled || !contestId) return undefined

    const socket = io(API_URL, {
      path: '/socket.io',
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })
    socketRef.current = socket

    function join() {
      socket.emit('contest:join', contestId, (ok, reason) => {
        if (!ok) setJoinError(reason ?? 'Could not join contest room')
      })
    }

    socket.on('connect', () => {
      setConnected(true)
      setJoinError(null)
      join()
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on('standings:update', (payload) => {
      if (payload.contestId === contestId) setStandings(payload.standings)
    })

    socket.on('contest:event', (message) => {
      if (message.contestId !== contestId) return
      // Status transitions (e.g. scheduled -> live) don't carry standings
      // themselves — the caller can react to this by refetching via
      // TanStack Query if needed.
    })

    return () => {
      socket.emit('contest:leave', contestId)
      socket.disconnect()
      socketRef.current = null
    }
  }, [contestId, enabled])

  return { standings, connected, joinError }
}
