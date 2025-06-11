from ldap3 import Server, Connection, ALL

# server_address = 'SNCADSPRDFLO002.somosnsc.com.br'
server_address = '172.17.48.28'
username = 'SOMOSNSC\\everton_cordeiro'  # Formato DOMAIN\username
password = '3V3rt@n14'

server = Server(server_address, get_info=ALL)
# server = Server('172.17.48.28', get_info=ALL)
conn = Connection(server, user=username, password=password)

if not conn.bind():
    print("❌ Erro de autenticação:")
    print(conn.result)  # Exibe detalhes do erro LDAP
else:
    print("✅ Autenticado com sucesso no servidor", server_address)
    conn.unbind()
