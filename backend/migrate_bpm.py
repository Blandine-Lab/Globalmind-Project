root = pathlib.Path('.'
 
# 1. Cherche config DB 
print('=== Config DB ===') 
for f in root.rglob('*'): 
    if f.is_file() and f.suffix in ('.py','.env','.toml','.yml','.yaml','.ini'): 
        try: txt = f.read_text(encoding='utf-8', errors='ignore') 
        except: continue 
