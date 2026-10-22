import { useApp } from './context/AppContext'
import { useTranscriptions } from './hooks/useTranscriptions'
import Header from './components/Header'
import TranscribePanel from './components/TranscribePanel'
import HistoryPanel from './components/HistoryPanel'
import DashboardPanel from './components/DashboardPanel'
import Toast from './components/Toast'

export default function App() {
  const { activeTab } = useApp()
  const {
    transcriptions,
    stats,
    loading,
    fetchAll,
    fetchStats,
    create,
    update,
    remove,
    favorite,
  } = useTranscriptions()

  const handleSaved = async (payload) => {
    await create(payload)
    fetchStats()
  }

  const handleUpdate = async (id, payload) => {
    await update(id, payload)
    fetchStats()
  }

  const handleDelete = async (id) => {
    await remove(id)
    fetchStats()
  }

  const handleFavorite = async (id) => {
    return await favorite(id)
  }

  return (
    <>
      <Header />

      <main className="main-content">
        {activeTab === 'transcribe' && (
          <TranscribePanel onSaved={handleSaved} />
        )}
        {activeTab === 'history' && (
          <HistoryPanel
            transcriptions={transcriptions}
            loading={loading}
            onRefresh={fetchAll}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onFavorite={handleFavorite}
          />
        )}
        {activeTab === 'dashboard' && (
          <DashboardPanel
            stats={stats}
            transcriptions={transcriptions}
            onRefresh={() => { fetchAll(); fetchStats() }}
          />
        )}
      </main>

      <Toast />
    </>
  )
}
