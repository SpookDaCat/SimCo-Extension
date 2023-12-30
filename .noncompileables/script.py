import json

with open("items.json") as f:
    j = json.load(f)
    d = {}
    for item, id in j.items():
        d[item] = {"id": id, "type": "normal"}
    with open(".noncompileables/items.json", 'w') as w:
        json.dump(d, w, indent=4)