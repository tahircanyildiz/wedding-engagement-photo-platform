import { useState, useEffect } from 'react';
import { memoriesAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const MemoryManagement = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedMemories, setSelectedMemories] = useState([]);
  const [stats, setStats] = useState({ total: 0, recent: 0 });

  useEffect(() => {
    fetchMemories();
    fetchStats();
  }, [sortBy]);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const response = await memoriesAPI.getAll({ sort: sortBy });
      setMemories(response.data);
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast.error('Anılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await memoriesAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu anıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await memoriesAPI.delete(id);
      toast.success('Anı silindi');
      fetchMemories();
      fetchStats();
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast.error('Anı silinirken hata oluştu');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMemories.length === 0) {
      toast.error('Lütfen silinecek anıları seçin');
      return;
    }

    if (!confirm(`${selectedMemories.length} anıyı silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await memoriesAPI.bulkDelete(selectedMemories);
      toast.success(`${selectedMemories.length} anı silindi`);
      setSelectedMemories([]);
      fetchMemories();
      fetchStats();
    } catch (error) {
      console.error('Error bulk deleting memories:', error);
      toast.error('Anılar silinirken hata oluştu');
    }
  };

  const toggleSelectMemory = (id) => {
    setSelectedMemories(prev =>
      prev.includes(id)
        ? prev.filter(memoryId => memoryId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMemories.length === memories.length) {
      setSelectedMemories([]);
    } else {
      setSelectedMemories(memories.map(m => m._id));
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Anı Defteri Yönetimi</h1>
        <p className="text-gray-600">Misafirlerin paylaştığı anıları yönetin</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-romantic-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📖</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Toplam Anı</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🆕</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Son 7 Gün</p>
              <p className="text-3xl font-bold text-gray-800">{stats.recent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="newest">En Yeni</option>
              <option value="oldest">En Eski</option>
            </select>

            {selectedMemories.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="btn-secondary bg-red-500 hover:bg-red-600 text-white"
              >
                Seçilenleri Sil ({selectedMemories.length})
              </button>
            )}
          </div>

          <button
            onClick={fetchMemories}
            className="btn-secondary"
          >
            🔄 Yenile
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-romantic-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && memories.length === 0 && (
        <div className="card text-center py-20">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            Henüz anı yok
          </h3>
          <p className="text-gray-600">
            Misafirler anı paylaştığında burada görünecek
          </p>
        </div>
      )}

      {/* Memories List */}
      {!loading && memories.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-4 mb-6 pb-4 border-b">
            <input
              type="checkbox"
              checked={selectedMemories.length === memories.length}
              onChange={toggleSelectAll}
              className="w-5 h-5 text-romantic-600 rounded focus:ring-romantic-500"
            />
            <span className="font-medium text-gray-700">
              {selectedMemories.length === memories.length ? 'Tümünün seçimini kaldır' : 'Tümünü seç'}
            </span>
          </div>

          <div className="space-y-4">
            {memories.map((memory) => (
              <div
                key={memory._id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedMemories.includes(memory._id)
                    ? 'border-romantic-600 bg-romantic-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedMemories.includes(memory._id)}
                    onChange={() => toggleSelectMemory(memory._id)}
                    className="mt-1 w-5 h-5 text-romantic-600 rounded focus:ring-romantic-500"
                  />

                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-romantic-400 to-romantic-600 flex items-center justify-center text-white font-bold text-xl">
                      {memory.guest_name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-800">
                        {memory.guest_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {format(new Date(memory.created_at), 'dd MMM yyyy, HH:mm', { locale: tr })}
                        </span>
                        <button
                          onClick={() => handleDelete(memory._id)}
                          className="text-red-600 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                          title="Sil"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {memory.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryManagement;
