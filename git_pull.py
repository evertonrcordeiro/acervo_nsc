import subprocess
import sys

BRANCH = "main"  # alterar aqui se usar outra branch
DOCKER_COMPOSE_CMD = "docker-compose"  # ou "docker compose" se for a versão nova

def run_command(command):
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ Erro ao executar: {command}")
            print("Saída de erro:", result.stderr.strip())
            sys.exit(1)
        else:
            print(result.stdout.strip())
    except Exception as e:
        print(f"❌ Exceção ao executar comando: {command}")
        print(e)
        sys.exit(1)

print("🔽 Buscando atualizações do repositório...")
run_command(f"git pull origin {BRANCH}")
print("✅ Atualização concluída!")

print("🛑 Parando containers Docker existentes...")
run_command(f"{DOCKER_COMPOSE_CMD} down")

print("♻️ Rebuildando e subindo containers Docker...")
run_command(f"{DOCKER_COMPOSE_CMD} up -d --build")

print("✅ Containers atualizados e rodando!")
