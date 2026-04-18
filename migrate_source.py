import sqlite3
conn = sqlite3.connect("calai.db")
cur = conn.cursor()
cur.execute("PRAGMA table_info(food_items)")
cols = [r[1] for r in cur.fetchall()]
print("Existing columns:", cols)
if "source" not in cols:
    cur.execute('ALTER TABLE food_items ADD COLUMN source TEXT DEFAULT "database"')
    print("Added source column")
else:
    print("source column already exists")
conn.commit()
conn.close()
