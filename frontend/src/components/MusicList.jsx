import React from 'react'

function MusicList({ songs, currentSong, onPlay, isPlaying }) {
  const getCoverUrl = (cover) => {
    if (cover) {
      return `/uploads/covers/${cover}`
    }
    return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20music%20album%20cover%20art%20minimalist%20artistic%20style%20with%20warm%20soft%20colors&image_size=square'
  }

  return (
    <div className="music-list-container">
      <h2 className="list-title">音乐列表</h2>
      
      {songs.length === 0 ? (
        <div className="empty-list">
          <span className="empty-icon">🎶</span>
          <p>暂无音乐，请前往管理后台添加</p>
        </div>
      ) : (
        <div className="music-grid">
          {songs.map((song) => {
            const isCurrentSong = currentSong?.id === song.id
            const isSongPlaying = isCurrentSong && isPlaying
            
            return (
              <div 
                key={song.id}
                className={`music-card ${isCurrentSong ? 'active' : ''}`}
                onClick={() => onPlay(song)}
              >
                <div className="card-cover">
                  <img 
                    src={getCoverUrl(song.cover)} 
                    alt={song.title}
                    className="card-image"
                  />
                  <div className="card-overlay">
                    <span className="play-icon">
                      {isSongPlaying ? '⏸' : '▶'}
                    </span>
                  </div>
                </div>
                
                <div className="card-info">
                  <h3 className="card-title">{song.title}</h3>
                  <p className="card-artist">{song.artist}</p>
                </div>
                
                {isSongPlaying && (
                  <div className="playing-indicator">
                    <span className="music-bars">
                      <span className="bar"></span>
                      <span className="bar"></span>
                      <span className="bar"></span>
                      <span className="bar"></span>
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MusicList
