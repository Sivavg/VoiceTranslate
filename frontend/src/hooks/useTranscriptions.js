import { useState, useEffect, useCallback } from 'react'
import {
  getTranscriptions,
  createTranscription,
  updateTranscription,
  deleteTranscription,
  toggleFavorite,
  getStats,
} from '../services/api'

export function useTranscriptions() {
  const [transcriptions, setTranscriptions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const res = await getTranscriptions(params)
      setTranscriptions(res.data || [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const res = await getStats()
      setStats(res.data)
    } catch (err) {
      console.error('Stats fetch error:', err)
    }
  }, [])

  const create = useCallback(async (payload) => {
    const res = await createTranscription(payload)
    setTranscriptions(prev => [res.data, ...prev])
    return res
  }, [])

  const update = useCallback(async (id, payload) => {
    const res = await updateTranscription(id, payload)
    setTranscriptions(prev => prev.map(t => (t.id === id ? res.data : t)))
    return res
  }, [])

  const remove = useCallback(async (id) => {
    await deleteTranscription(id)
    setTranscriptions(prev => prev.filter(t => t.id !== id))
  }, [])

  const favorite = useCallback(async (id) => {
    const res = await toggleFavorite(id)
    setTranscriptions(prev => prev.map(t => (t.id === id ? res.data : t)))
    return res
  }, [])

  useEffect(() => {
    fetchAll()
    fetchStats()
  }, [fetchAll, fetchStats])

  return {
    transcriptions,
    stats,
    loading,
    error,
    fetchAll,
    fetchStats,
    create,
    update,
    remove,
    favorite,
  }
}
