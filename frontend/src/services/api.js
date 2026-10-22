import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.port === '3000' ? 'http://localhost:5000/api' : '/api'),
  timeout: 10000,
})

// ── Transcriptions CRUD ──────────────────────────────────────────────────────

export const getTranscriptions = (params = {}) =>
  API.get('/transcriptions', { params }).then(r => r.data)

export const getTranscription = (id) =>
  API.get(`/transcriptions/${id}`).then(r => r.data)

export const createTranscription = (payload) =>
  API.post('/transcriptions', payload).then(r => r.data)

export const updateTranscription = (id, payload) =>
  API.put(`/transcriptions/${id}`, payload).then(r => r.data)

export const deleteTranscription = (id) =>
  API.delete(`/transcriptions/${id}`).then(r => r.data)

export const toggleFavorite = (id) =>
  API.patch(`/transcriptions/${id}/favorite`).then(r => r.data)

export const getStats = () =>
  API.get('/transcriptions/stats').then(r => r.data)

export const healthCheck = () =>
  API.get('/health').then(r => r.data)

export default API
