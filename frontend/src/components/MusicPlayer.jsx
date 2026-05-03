import React, { useState, useEffect, useRef } from 'react'

function MusicPlayer({ 
  currentSong, 
  isPlaying, 
  isLoop,
  onPlayPause, 
  onNext, 
  onPrev, 
  onToggleLoop,
  onSongEnd 
}) {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log('Play error:', e))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentSong])

  useEffect(() => {
    if (audioRef.current && currentSong?.audio_file) {
      audioRef.current.load()
    }
  }, [currentSong])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getCoverUrl = (cover) => {
    if (cover) {
      return `/uploads/covers/${cover}`
    }
    return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20music%20album%20cover%20art%20minimalist%20artistic%20style%20with%20warm%20soft%20colors&image_size=square'
  }

  return (
    <div className="player">
      {currentSong?.audio_file && (
        <audio
          ref={audioRef}
          src={`/uploads/audio/${currentSong.audio_file}`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={onSongEnd}
          loop={isLoop}
        />
      )}

      <div className="player-content">
        {currentSong ? (
          <>
            <div className="player-cover">
              <img 
                src={getCoverUrl(currentSong.cover)} 
                alt={currentSong.title}
                className={`cover-image ${isPlaying ? 'rotating' : ''}`}
              />
            </div>
            
            <div className="player-info">
              <div className="player-title">{currentSong.title}</div>
              <div className="player-artist">{currentSong.artist}</div>
            </div>
          </>
        ) : (
          <div className="player-empty">
            <span className="empty-icon">🎵</span>
            <span>选择一首歌曲开始播放</span>
          </div>
        )}

        <div className="player-controls">
          <button 
            className={`control-btn loop-btn ${isLoop ? 'active' : ''}`}
            onClick={onToggleLoop}
            title={isLoop ? '取消循环' : '循环播放'}
          >
            🔁
          </button>
          
          <button className="control-btn prev-btn" onClick={onPrev}>
            ⏮
          </button>
          
          <button 
            className="control-btn play-btn" 
            onClick={onPlayPause}
            disabled={!currentSong}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          
          <button className="control-btn next-btn" onClick={onNext}>
            ⏭
          </button>
        </div>
      </div>

      {currentSong && (
        <div className="player-progress">
          <span className="time-display">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="progress-bar"
          />
          <span className="time-display">{formatTime(duration)}</span>
        </div>
      )}
    </div>
  )
}

export default MusicPlayer
