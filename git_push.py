import subprocess
import sys

# Mensagem de commit como argumento (ou padrão)
commit_msg = "Atualização do projeto"
if len(sys.argv) > 1:
    commit_msg = " ".join(sys.argv[1:])

def run_git_command(command):
    result = subprocess.run(command, shell=True)
    if result.returncode != 0:
        print(f"❌ Erro ao executar: {command}")
        sys.exit(1)

print("🔄 Adicionando arquivos...")
run_git_command("git add .")

print(f"📝 Fazendo commit com mensagem: '{commit_msg}'")
run_git_command(f'git commit -m "{commit_msg}"')

print("📤 Enviando para o repositório remoto...")
run_git_command("git push origin main")

print("✅ Push concluído com sucesso!")
