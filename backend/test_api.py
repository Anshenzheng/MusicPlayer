import http.client
import json

try:
    conn = http.client.HTTPConnection('127.0.0.1', 5000)
    conn.request('GET', '/api/songs')
    response = conn.getresponse()
    print(f"Status: {response.status}")
    print(f"Reason: {response.reason}")
    
    data = response.read().decode('utf-8')
    print(f"Response: {data}")
    
    if response.status == 200:
        songs = json.loads(data)
        print(f"\nSuccess! Found {len(songs)} songs:")
        for song in songs:
            print(f"  - {song['title']} by {song['artist']}")
    
    conn.close()
except Exception as e:
    print(f"Error: {e}")
