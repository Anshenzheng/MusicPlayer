import React, { useState, useEffect, useRef } from 'react'

function MusicPlayer({ 
  currentSong, 
  isPlaying, 
  isLoop,
  onPlayPause, 
  onNext, 
  onPrev, 
  onToggleLoop,
  onSongEnd,
  songs 
}) {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  const hasAudioFile = currentSong?.audio_file

  useEffect(() => {
    if (audioRef.current && hasAudioFile) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log('Play error:', e))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, hasAudioFile])

  useEffect(() => {
    if (audioRef.current && hasAudioFile) {
      setCurrentTime(0)
      setDuration(0)
      audioRef.current.load()
    }
  }, [currentSong?.id, hasAudioFile])

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

  const handlePlayPause = () => {
    if (!hasAudioFile) {
      console.log('No audio file available')
      return
    }
    onPlayPause()
  }

  const handleNext = () => {
    if (songs && songs.length > 0) {
      onNext()
    }
  }

  const handlePrev = () => {
    if (songs && songs.length > 0) {
      onPrev()
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

  const getAudioUrl = (audioFile) => {
    if (audioFile) {
      return `/uploads/audio/${audioFile}`
    }
    return ''
  }

  return (
    <div className="player">
      {hasAudioFile && (
        <audio
          ref={audioRef}
          src={getAudioUrl(currentSong.audio_file)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={onSongEnd}
          loop={isLoop}
          preload="metadata"
        />
      )}

      <div className="player-content">
        {currentSong ? (
          <>
            <div className="player-cover">
              <img 
                src={getCoverUrl(currentSong.cover)} 
                alt={currentSong.title}
                className={`cover-image ${isPlaying && hasAudioFile ? 'rotating' : ''}`}
              />
            </div>
            
            <div className="player-info">
              <div className="player-title">{currentSong.title}</div>
              <div className="player-artist">
                {currentSong.artist}
                {!hasAudioFile && (
                  <span style={{ color: '#e74c3c', marginLeft: '8px', fontSize: '0.8rem' }}>
                    (无音频文件)
                  </span>
                )}
              </div>
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
          
          <button 
            className="control-btn prev-btn" 
            onClick={handlePrev}
            disabled={!songs || songs.length === 0}
          >
            ⏮
          </button>
          
          <button 
            className="control-btn play-btn" 
            onClick={handlePlayPause}
            disabled={!currentSong || !hasAudioFile}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          
          <button 
            className="control-btn next-btn" 
            onClick={handleNext}
            disabled={!songs || songs.length === 0}
          >
            ⏭
          </button>
        </div>
      </div>

      {currentSong && hasAudioFile && (
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

      {currentSong && !hasAudioFile && (
        <div className="player-progress" style={{ justifyContent: 'center' }}>
          <span style={{ color: '#e74c3c', fontSize: '0.9rem' }}>
            请前往管理后台上传音频文件
          </span>
        </div>
      )}
    </div>
  )
}

export default MusicPlayer
