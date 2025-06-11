import os
import time
import shutil

WATCH_DIR = '/app/watchfolder/incoming'
PROCESSED_DIR = '/app/watchfolder/processed'
POLL_INTERVAL = 5  # segundos

def ensure_directories():
    os.makedirs(WATCH_DIR, exist_ok=True)
    os.makedirs(PROCESSED_DIR, exist_ok=True)

def process_file(file_path):
    filename = os.path.basename(file_path)
    destination = os.path.join(PROCESSED_DIR, filename)
    
    print(f"[INFO] Processando arquivo: {filename}")
    
    # Aqui você pode adicionar processamento real (ex: extrair metadados, cadastrar no banco, etc)
    
    shutil.move(file_path, destination)
    print(f"[INFO] Arquivo movido para: {destination}")

def watch_folder():
    print(f"[INFO] Monitorando: {WATCH_DIR}")
    while True:
        for filename in os.listdir(WATCH_DIR):
            file_path = os.path.join(WATCH_DIR, filename)
            if os.path.isfile(file_path):
                process_file(file_path)
        time.sleep(POLL_INTERVAL)

if __name__ == '__main__':
    ensure_directories()
    watch_folder()
