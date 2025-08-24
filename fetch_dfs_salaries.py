import http.client
import json
from env_keys import RAPID_API

conn = http.client.HTTPSConnection("tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com")

headers = {
    'x-rapidapi-key': RAPID_API,
    'x-rapidapi-host': "tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com"
}

conn.request("GET", "/getNFLDFS?date=20250824", headers=headers)

res = conn.getresponse()
data = res.read()

json_data = json.loads(data.decode("utf-8"))
with open('dfs_salaries.json', 'w', encoding='utf-8') as f:
    json.dump(json_data, f, indent=2, ensure_ascii=False)