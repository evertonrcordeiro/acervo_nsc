import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;

  // Simulação simples
  if (email === 'admin@teste.com' && senha === '123456') {
    return res.json({
      token: 'fake-jwt-token',
      nome: 'Administrador',
      email
    });
  }

  return res.status(401).json({ erro: 'Credenciais inválidas' });
});

app.listen(PORT, () => {
  console.log(`🔐 API rodando em http://localhost:${PORT}`);
});
