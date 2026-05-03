from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid
import sqlite3

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
DATABASE = os.path.join(basedir, 'music.db')
UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
MAX_CONTENT_LENGTH = 50 * 1024 * 1024

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS songs (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            cover TEXT,
            audio_file TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('SELECT COUNT(*) FROM songs')
    if cursor.fetchone()[0] == 0:
        sample_songs = [
            (str(uuid.uuid4()), 'Moonlight Sonata', 'Beethoven', None, None),
            (str(uuid.uuid4()), 'Clair de Lune', 'Debussy', None, None),
            (str(uuid.uuid4()), 'Nocturne Op.9 No.2', 'Chopin', None, None)
        ]
        cursor.executemany('''
            INSERT INTO songs (id, title, artist, cover, audio_file)
            VALUES (?, ?, ?, ?, ?)
        ''', sample_songs)
    
    conn.commit()
    conn.close()

def allowed_file(filename, allowed_types):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_types

@app.route('/api/songs', methods=['GET'])
def get_songs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id, title, artist, cover, audio_file FROM songs ORDER BY created_at DESC')
    songs = cursor.fetchall()
    conn.close()
    
    result = []
    for song in songs:
        result.append({
            'id': song['id'],
            'title': song['title'],
            'artist': song['artist'],
            'cover': song['cover'],
            'audio_file': song['audio_file']
        })
    
    return jsonify(result)

@app.route('/api/songs/<song_id>', methods=['GET'])
def get_song(song_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id, title, artist, cover, audio_file FROM songs WHERE id = ?', (song_id,))
    song = cursor.fetchone()
    conn.close()
    
    if song is None:
        return jsonify({'error': 'Song not found'}), 404
    
    return jsonify({
        'id': song['id'],
        'title': song['title'],
        'artist': song['artist'],
        'cover': song['cover'],
        'audio_file': song['audio_file']
    })

@app.route('/api/songs', methods=['POST'])
def create_song():
    data = request.form
    title = data.get('title')
    artist = data.get('artist')
    
    if not title or not artist:
        return jsonify({'error': 'Title and artist are required'}), 400
    
    song_id = str(uuid.uuid4())
    cover_filename = None
    audio_filename = None
    
    if 'cover' in request.files:
        cover_file = request.files['cover']
        if cover_file.filename != '':
            if allowed_file(cover_file.filename, {'png', 'jpg', 'jpeg', 'gif', 'webp'}):
                cover_filename = str(uuid.uuid4()) + '_' + secure_filename(cover_file.filename)
                cover_path = os.path.join(UPLOAD_FOLDER, 'covers')
                os.makedirs(cover_path, exist_ok=True)
                cover_file.save(os.path.join(cover_path, cover_filename))
            else:
                return jsonify({'error': 'Invalid cover image format'}), 400
    
    if 'audio' in request.files:
        audio_file = request.files['audio']
        if audio_file.filename != '':
            if allowed_file(audio_file.filename, {'mp3', 'wav', 'ogg', 'm4a', 'flac'}):
                audio_filename = str(uuid.uuid4()) + '_' + secure_filename(audio_file.filename)
                audio_path = os.path.join(UPLOAD_FOLDER, 'audio')
                os.makedirs(audio_path, exist_ok=True)
                audio_file.save(os.path.join(audio_path, audio_filename))
            else:
                return jsonify({'error': 'Invalid audio format'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO songs (id, title, artist, cover, audio_file)
        VALUES (?, ?, ?, ?, ?)
    ''', (song_id, title, artist, cover_filename, audio_filename))
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': song_id,
        'title': title,
        'artist': artist,
        'cover': cover_filename,
        'audio_file': audio_filename
    }), 201

@app.route('/api/songs/<song_id>', methods=['PUT'])
def update_song(song_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id, title, artist, cover, audio_file FROM songs WHERE id = ?', (song_id,))
    song = cursor.fetchone()
    
    if song is None:
        conn.close()
        return jsonify({'error': 'Song not found'}), 404
    
    data = request.form
    title = song['title']
    artist = song['artist']
    cover_filename = song['cover']
    audio_filename = song['audio_file']
    
    if 'title' in data:
        title = data.get('title')
    if 'artist' in data:
        artist = data.get('artist')
    
    if 'cover' in request.files:
        cover_file = request.files['cover']
        if cover_file.filename != '':
            if allowed_file(cover_file.filename, {'png', 'jpg', 'jpeg', 'gif', 'webp'}):
                if cover_filename:
                    old_cover_path = os.path.join(UPLOAD_FOLDER, 'covers', cover_filename)
                    if os.path.exists(old_cover_path):
                        os.remove(old_cover_path)
                
                cover_filename = str(uuid.uuid4()) + '_' + secure_filename(cover_file.filename)
                cover_path = os.path.join(UPLOAD_FOLDER, 'covers')
                os.makedirs(cover_path, exist_ok=True)
                cover_file.save(os.path.join(cover_path, cover_filename))
            else:
                conn.close()
                return jsonify({'error': 'Invalid cover image format'}), 400
    
    if 'audio' in request.files:
        audio_file = request.files['audio']
        if audio_file.filename != '':
            if allowed_file(audio_file.filename, {'mp3', 'wav', 'ogg', 'm4a', 'flac'}):
                if audio_filename:
                    old_audio_path = os.path.join(UPLOAD_FOLDER, 'audio', audio_filename)
                    if os.path.exists(old_audio_path):
                        os.remove(old_audio_path)
                
                audio_filename = str(uuid.uuid4()) + '_' + secure_filename(audio_file.filename)
                audio_path = os.path.join(UPLOAD_FOLDER, 'audio')
                os.makedirs(audio_path, exist_ok=True)
                audio_file.save(os.path.join(audio_path, audio_filename))
            else:
                conn.close()
                return jsonify({'error': 'Invalid audio format'}), 400
    
    cursor.execute('''
        UPDATE songs SET title = ?, artist = ?, cover = ?, audio_file = ?
        WHERE id = ?
    ''', (title, artist, cover_filename, audio_filename, song_id))
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': song_id,
        'title': title,
        'artist': artist,
        'cover': cover_filename,
        'audio_file': audio_filename
    })

@app.route('/api/songs/<song_id>', methods=['DELETE'])
def delete_song(song_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id, title, artist, cover, audio_file FROM songs WHERE id = ?', (song_id,))
    song = cursor.fetchone()
    
    if song is None:
        conn.close()
        return jsonify({'error': 'Song not found'}), 404
    
    if song['cover']:
        cover_path = os.path.join(UPLOAD_FOLDER, 'covers', song['cover'])
        if os.path.exists(cover_path):
            os.remove(cover_path)
    
    if song['audio_file']:
        audio_path = os.path.join(UPLOAD_FOLDER, 'audio', song['audio_file'])
        if os.path.exists(audio_path):
            os.remove(audio_path)
    
    cursor.execute('DELETE FROM songs WHERE id = ?', (song_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Song deleted successfully'}), 200

@app.route('/uploads/covers/<filename>')
def serve_cover(filename):
    return send_from_directory(os.path.join(UPLOAD_FOLDER, 'covers'), filename)

@app.route('/uploads/audio/<filename>')
def serve_audio(filename):
    return send_from_directory(os.path.join(UPLOAD_FOLDER, 'audio'), filename)

@app.route('/')
def index():
    return 'Music Player API is running!'

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(os.path.join(UPLOAD_FOLDER, 'covers'), exist_ok=True)
    os.makedirs(os.path.join(UPLOAD_FOLDER, 'audio'), exist_ok=True)
    init_db()
    print(f"Routes registered: {[r.rule for r in app.url_map.iter_rules()]}")
    app.run(debug=False, host='127.0.0.1', port=5000)
