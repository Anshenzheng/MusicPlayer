import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import MusicPlayer from './components/MusicPlayer'
import MusicList from './components/MusicList'
import AdminPanel from './components/AdminPanel'
import axios from 'axios'

function App() {
  const [songs, setSongs] = useState([])
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoop, setIsLoop] = useState(false)

  useEffect(() => {
    fetchSongs()
  }, [])

  const fetchSongs = async () => {
    try {
      const response = await axios.get('/api/songs')
      setSongs(response.data)
    } catch (error) {
      console.error('Error fetching songs:', error)
    }
  }

  const playSong = (song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying)
    } else {
      setCurrentSong(song)
      setIsPlaying(true)
    }
  }

  const playNext = () => {
    if (!songs.length || !currentSong) return
    const currentIndex = songs.findIndex(s => s.id === currentSong.id)
    const nextIndex = (currentIndex + 1) % songs.length
    setCurrentSong(songs[nextIndex])
    setIsPlaying(true)
  }

  const playPrev = () => {
    if (!songs.length || !currentSong) return
    const currentIndex = songs.findIndex(s => s.id === currentSong.id)
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length
    setCurrentSong(songs[prevIndex])
    setIsPlaying(true)
  }

  const handleSongEnd = () => {
    if (isLoop) {
      setIsPlaying(false)
      setTimeout(() => setIsPlaying(true), 100)
    } else {
      playNext()
    }
  }

  return (
    <Router>
      <div className="app">
        <nav className="nav">
          <div className="nav-brand">
            <span className="logo">🎵</span>
            <h1>音乐播放器</h1>
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-link">首页</Link>
            <Link to="/admin" className="nav-link">管理后台</Link>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <div className="home-page">
                  <MusicList 
                    songs={songs} 
                    currentSong={currentSong}
                    onPlay={playSong}
                    isPlaying={isPlaying}
                  />
                </div>
              } 
            />
            <Route 
              path="/admin" 
              element={<AdminPanel songs={songs} onRefresh={fetchSongs} />} 
            />
          </Routes>
        </main>

        <MusicPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          isLoop={isLoop}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onNext={playNext}
          onPrev={playPrev}
          onToggleLoop={() => setIsLoop(!isLoop)}
          onSongEnd={handleSongEnd}
        />
      </div>
    </Router>
  )
}

export default App
