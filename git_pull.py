import subprocess

def run_git_command(command):
    result = subprocess.run(command, shell=True)
    if result.returncode != 0:
        print(f"❌ Erro ao executar: {command}")
        exit(1)

print("🔽 Buscando atualizações do repositório...")
run_git_command("git pull origin main")

print("✅ Atualização concluída!")
