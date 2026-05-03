import http.client
import json
import os
import sys

os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, '.')

print("=" * 50)
print("直接测试后端API")
print("=" * 50)

try:
    conn = http.client.HTTPConnection('127.0.0.1', 5000)
    conn.request('GET', '/api/songs')
    response = conn.getresponse()
    
    print(f"\nStatus: {response.status}")
    print(f"Reason: {response.reason}")
    
    data = response.read().decode('utf-8')
    print(f"Response: {data[:500]}")
    
    if response.status == 200:
        songs = json.loads(data)
        print(f"\n✅ API正常工作！找到 {len(songs)} 首歌曲:")
        for song in songs:
            print(f"  - {song['title']} by {song['artist']}")
    else:
        print(f"\n❌ API返回错误: {response.status}")
    
    conn.close()
    
except Exception as e:
    print(f"\n❌ 连接错误: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 50)
