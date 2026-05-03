import React, { useState } from 'react'
import axios from 'axios'

function AdminPanel({ songs, onRefresh, onPlay, currentSong, isPlaying }) {
  const [showForm, setShowForm] = useState(false)
  const [editingSong, setEditingSong] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    artist: ''
  })
  const [coverFile, setCoverFile] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCoverChange = (e) => {
    setCoverFile(e.target.files[0])
  }

  const handleAudioChange = (e) => {
    setAudioFile(e.target.files[0])
  }

  const resetForm = () => {
    setFormData({ title: '', artist: '' })
    setCoverFile(null)
    setAudioFile(null)
    setEditingSong(null)
    setShowForm(false)
    setMessage({ type: '', text: '' })
  }

  const handleEdit = (song) => {
    setEditingSong(song)
    setFormData({ title: song.title, artist: song.artist })
    setShowForm(true)
  }

  const handleDelete = async (song) => {
    if (window.confirm(`确定要删除歌曲 "${song.title}" 吗？`)) {
      try {
        await axios.delete(`/api/songs/${song.id}`)
        setMessage({ type: 'success', text: '歌曲删除成功！' })
        onRefresh()
      } catch (error) {
        setMessage({ type: 'error', text: '删除失败，请重试' })
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('artist', formData.artist)
      
      if (coverFile) {
        data.append('cover', coverFile)
      }
      
      if (audioFile) {
        data.append('audio', audioFile)
      }

      if (editingSong) {
        await axios.put(`/api/songs/${editingSong.id}`, data)
        setMessage({ type: 'success', text: '歌曲更新成功！' })
      } else {
        await axios.post('/api/songs', data)
        setMessage({ type: 'success', text: '歌曲添加成功！' })
      }

      onRefresh()
      resetForm()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || '操作失败，请重试' })
    } finally {
      setLoading(false)
    }
    
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const getCoverUrl = (cover) => {
    if (cover) {
      return `/uploads/covers/${cover}`
    }
    return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20music%20album%20cover%20art%20minimalist%20artistic%20style%20with%20warm%20soft%20colors&image_size=square'
  }

  const handleRowClick = (song) => {
    if (onPlay) {
      onPlay(song)
    }
  }

  const handlePlayClick = (e, song) => {
    e.stopPropagation()
    if (onPlay) {
      onPlay(song)
    }
  }

  const isCurrentSong = (song) => {
    return currentSong?.id === song.id
  }

  const isSongPlaying = (song) => {
    return isCurrentSong(song) && isPlaying
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>管理后台</h2>
        <button 
          className="add-btn"
          onClick={() => { resetForm(); setShowForm(true) }}
        >
          + 添加歌曲
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="form-container">
          <h3>{editingSong ? '编辑歌曲' : '添加新歌曲'}</h3>
          <form onSubmit={handleSubmit} className="song-form">
            <div className="form-group">
              <label>歌曲名称 *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="输入歌曲名称"
              />
            </div>

            <div className="form-group">
              <label>歌手 *</label>
              <input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleInputChange}
                required
                placeholder="输入歌手名称"
              />
            </div>

            <div className="form-group">
              <label>封面图片 {editingSong ? '(可选，不填则保留原封面)' : '(可选)'}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
              />
              {editingSong?.cover && !coverFile && (
                <div className="current-cover">
                  <img src={getCoverUrl(editingSong.cover)} alt="当前封面" />
                  <span>当前封面</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>音乐文件 {editingSong ? '(可选，不填则保留原文件)' : '(可选)'}</label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
              />
              {editingSong?.audio_file && (
                <p className="current-file">当前文件: {editingSong.audio_file}</p>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={resetForm}>
                取消
              </button>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? '提交中...' : (editingSong ? '更新' : '添加')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="song-list">
        <h3>歌曲列表 ({songs.length}) <span style={{ fontSize: '0.9rem', color: '#8a8a8a', fontWeight: 'normal' }}>(点击歌曲可播放)</span></h3>
        {songs.length === 0 ? (
          <p className="empty-admin">暂无歌曲，请点击上方按钮添加</p>
        ) : (
          <table className="song-table">
            <thead>
              <tr>
                <th>封面</th>
                <th>歌曲名</th>
                <th>歌手</th>
                <th>音频</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song) => (
                <tr 
                  key={song.id} 
                  className={`song-row ${isCurrentSong(song) ? 'active' : ''}`}
                  onClick={() => handleRowClick(song)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img 
                        src={getCoverUrl(song.cover)} 
                        alt={song.title}
                        className="table-cover"
                      />
                      {isSongPlaying(song) && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: 'rgba(0,0,0,0.6)',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px'
                        }}>
                          ▶
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="song-title">{song.title}</td>
                  <td>{song.artist}</td>
                  <td>
                    {song.audio_file ? (
                      <span style={{ color: '#27ae60' }}>✓ 已上传</span>
                    ) : (
                      <span style={{ color: '#e74c3c' }}>✗ 未上传</span>
                    )}
                  </td>
                  <td className="actions">
                    <button 
                      className="edit-btn"
                      onClick={(e) => { e.stopPropagation(); handleEdit(song) }}
                    >
                      编辑
                    </button>
                    <button 
                      className="play-btn-small"
                      onClick={(e) => handlePlayClick(e, song)}
                      title={isSongPlaying(song) ? '暂停' : '播放'}
                      style={{
                        background: isCurrentSong(song) ? '#c9a87c' : '#d4c4b0',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginRight: '0.5rem'
                      }}
                    >
                      {isSongPlaying(song) ? '⏸' : '▶'}
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={(e) => { e.stopPropagation(); handleDelete(song) }}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
