import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = JSON.parse(atob(base64));
    return decodedPayload;
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: senha }),
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data = await response.json();

      // Decodifica o token para extrair info do usuário
      const decoded = decodeJWT(data.access);
      const nome = decoded?.username || username; // ou outro campo, como `name` ou `email`

      const userInfo = {
        nome,
        loginHorario: new Date().toISOString(),
      };

      login({ access: data.access, refresh: data.refresh }, userInfo);
      navigate('/dashboard');
    } catch (err) {
      setErro(err.message || 'Erro no login');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <h1 className="text-xl mb-4 text-center font-bold">Login</h1>
        {erro && <div className="text-red-500 mb-2 text-center">{erro}</div>}

        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 w-full mb-2 rounded"
          autoComplete="username"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          autoComplete="current-password"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
