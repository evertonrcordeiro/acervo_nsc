import { useState, useEffect } from 'react';

export default function CadastrarMidia() {
  const [form, setForm] = useState({
    cod_documento: '',
    num_fita: '',
    titulo: '',
    tipo_midia: '',
    arquivo: null,
    data_inclusao: '',
    duracao: '',
    timecode: '',
    armazenamento: '',
    id_local: '',
    id_fonte: '',
    id_programa: '',
    observacoes: '',
  });

  const [locais, setLocais] = useState([]);
  const [fontes, setFontes] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchData = async () => {
      const endpoints = [
        { url: '/api/locais/', set: setLocais },
        { url: '/api/fontes/', set: setFontes },
        { url: '/api/programas/', set: setProgramas },
      ];
      for (const { url, set } of endpoints) {
        try {
          const res = await fetch(`http://localhost:8000${url}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          set(data.results || []);
        } catch (e) {
          console.error(`Erro ao buscar ${url}`, e);
        }
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    const formData = new FormData();
    for (const key in form) {
      if (form[key]) {
        formData.append(key, form[key]);
      }
    }

    try {
      const response = await fetch('http://localhost:8000/api/midias/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Erro ao cadastrar mídia');

      setMensagem('Mídia cadastrada com sucesso!');
      setForm({
        cod_documento: '',
        num_fita: '',
        titulo: '',
        tipo_midia: '',
        arquivo: null,
        data_inclusao: '',
        duracao: '',
        timecode: '',
        armazenamento: '',
        id_local: '',
        id_fonte: '',
        id_programa: '',
        observacoes: '',
      });
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold text-blue-700 text-center">Cadastrar Nova Mídia</h2>

      {mensagem && <p className="text-green-700">{mensagem}</p>}
      {erro && <p className="text-red-700">{erro}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="number" name="cod_documento" required value={form.cod_documento} onChange={handleChange} className="flex-grow p-2 border rounded" placeholder="Código do Documento" />
          <input type="text" name="num_fita" value={form.num_fita} onChange={handleChange} className="flex-grow p-2 border rounded" placeholder="Número da Fita" />
          <input type="text" name="titulo" required value={form.titulo} onChange={handleChange} className="flex-grow p-2 border rounded" placeholder="Título" />
          <select name="tipo_midia" value={form.tipo_midia} onChange={handleChange} className="flex-grow p-2 border rounded">
            <option value="">Tipo de Mídia</option>
            <option value="vivo">Vivo</option>
            <option value="bruta">Bruta</option>
            <option value="editada">Editada</option>
          </select>
        </div>

        {/* Arquivo e datas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="file" name="arquivo" onChange={handleChange} className="flex-grow p-2 border rounded" />
          <input type="date" name="data_inclusao" value={form.data_inclusao} onChange={handleChange} className="flex-grow p-2 border rounded" />
          <input type="text" name="duracao" value={form.duracao} onChange={handleChange} className="flex-grow p-2 border rounded" placeholder="Duração" />
          <input type="text" name="timecode" value={form.timecode} onChange={handleChange} className="flex-grow p-2 border rounded" placeholder="Timecode" />
        </div>

        {/* Relacionamentos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select name="id_local" value={form.id_local} onChange={handleChange} className="flex-grow p-2 border rounded">
            <option value="">Selecione o Local</option>
            {locais.map((l) => (
              <option key={l.id} value={l.id}>{l.nome}</option>
            ))}
          </select>

          <select name="id_fonte" value={form.id_fonte} onChange={handleChange} className="flex-grow p-2 border rounded">
            <option value="">Selecione a Fonte</option>
            {fontes.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>

          <select name="id_programa" value={form.id_programa} onChange={handleChange} className="flex-grow p-2 border rounded">
            <option value="">Selecione o Programa</option>
            {programas.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        {/* Armazenamento e observações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select name="armazenamento" value={form.armazenamento} onChange={handleChange} className="flex-grow p-2 border rounded">
            <option value="">Tipo de Armazenamento</option>
            <option value="disco">Disco</option>
            <option value="local">Local</option>
            <option value="nuvem">Nuvem</option>
          </select>

          <textarea name="observacoes" value={form.observacoes} onChange={handleChange} className="flex-grow p-2 border rounded" placeholder="Observações" rows={3} />
        </div>

        <div className="text-center">
          <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800">
            Cadastrar
          </button>
        </div>
      </form>
    </div>
  );
}
