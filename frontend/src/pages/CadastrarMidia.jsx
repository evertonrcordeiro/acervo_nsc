import { useState, useEffect } from 'react';
import useMetadadosMidias from '../hooks/useMetadadosMidias';

export default function CadastrarMidia() {
  const { locais, programas, fontes, erro: erroMetadados } = useMetadadosMidias();

  const [form, setForm] = useState({
    cod_documento: 0,
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

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const token = localStorage.getItem('access_token');

useEffect(() => {
  const buscarProximoCodigo = async () => {
    try {
      // Busca o maior valor existente do cod_documento
      const res = await fetch('http://localhost:8000/api/midias/max_cod_documento/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      let proximo = data.max_cod_documento ? data.max_cod_documento + 1 : 1;


      // Verifica se já existe (muito improvável, mas garante)
      let existe = true;
      while (existe) {
        const check = await fetch(`http://localhost:8000/api/midias/?cod_documento=${proximo}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const checkData = await check.json();
        if (checkData.results && checkData.results.length === 0) {
          existe = false;
        } else {
          proximo++;
        }
      }

      setForm((prev) => ({ ...prev, cod_documento: proximo }));
    } catch (e) {
      console.error('Erro ao buscar próximo cod_documento', e);
      setErro('Erro ao obter próximo código de documento');
    }
  };
  buscarProximoCodigo();
}, [token]);


  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    let newValue = value;

    if (['duracao', 'timecode'].includes(name)) {
      newValue = newValue.replace(/[^\d]/g, '').slice(0, 6);
      if (newValue.length >= 5)
        newValue = `${newValue.slice(0, 2)}:${newValue.slice(2, 4)}:${newValue.slice(4, 6)}`;
      else if (newValue.length >= 3)
        newValue = `${newValue.slice(0, 2)}:${newValue.slice(2, 4)}`;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    const formData = new FormData();

    for (const key in form) {
      if (['id_local', 'id_fonte', 'id_programa'].includes(key)) continue;
      if (form[key] !== '' && form[key] !== null) {
        formData.append(key, form[key]);
      }
    }


    // Pega os ids reais pelo nome digitado
    const local = locais.find((l) => l.nome.toLowerCase() === form.id_local.toLowerCase());
    const fonte = fontes.find((f) => f.nome.toLowerCase() === form.id_fonte.toLowerCase());
    const programa = programas.find((p) => p.nome.toLowerCase() === form.id_programa.toLowerCase());

    if (local) formData.append('id_local', local.id);
    if (fonte) formData.append('id_fonte', fonte.id);
    if (programa) formData.append('id_programa', programa.id);

    try {
      const response = await fetch('http://localhost:8000/api/midias/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro detalhado:', errorData);
        throw new Error('Erro ao cadastrar mídia: ' + JSON.stringify(errorData));
      }

      setMensagem('Mídia cadastrada com sucesso!');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
      
      // Atualiza o cod_documento para o próximo (incrementa 1)
      setForm({
        cod_documento: form.cod_documento + 1,
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
  <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow space-y-6">
    <h2 className="text-2xl font-bold text-blue-700 text-center">Cadastrar Nova Mídia</h2>

    {mensagem && <p className="text-green-700">{mensagem}</p>}
    {erro && <p className="text-red-700">{erro}</p>}
    {erroMetadados && <p className="text-red-700">Erro ao carregar metadados: {erroMetadados}</p>}

    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Código e Número da Fita */}
      <div className="flex flex-col  sm:flex-row gap-4">
        <input
          type="number"
          name="cod_documento"
          value={form.cod_documento}
          readOnly
          className="p-2 border rounded bg-gray-100 cursor-not-allowed sm:w-[100px]"
          placeholder="Código do Documento"
        />
        <input
          type="text"
          name="num_fita"
          value={form.num_fita}
          onChange={handleChange}
          className="p-2 border rounded sm:w-[100px]"
          placeholder="Número da Fita"
        />
        <input
          type="text"
          name="titulo"
          required
          value={form.titulo}
          onChange={handleChange}
          className="p-2 border rounded w-full"
          placeholder="Título"
        />        
      </div>

      {/* Tipo, Data, Duração, Timecode */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <select
          name="tipo_midia"
          value={form.tipo_midia}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="">Tipo de Mídia</option>
          <option value="vivo">Vivo</option>
          <option value="bruta">Bruta</option>
          <option value="editada">Editada</option>
        </select>
        <input
          type="date"
          name="data_inclusao"
          value={form.data_inclusao}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="duracao"
          value={form.duracao}
          onChange={handleChange}
          className="p-2 border rounded"
          placeholder="Duração (hh:mm:ss)"
        />
        <input
          type="text"
          name="timecode"
          value={form.timecode}
          onChange={handleChange}
          className="p-2 border rounded"
          placeholder="Timecode (hh:mm:ss)"
        />
      </div>

      {/* Local, Fonte, Programa */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          list="locais"
          name="id_local"
          value={form.id_local}
          onChange={handleChange}
          className="p-2 border rounded"
          placeholder="Digite ou selecione o local"
        />
        <datalist id="locais">
          {locais.map((l) => (
            <option key={l.id}>{l.nome}</option>
          ))}
        </datalist>

        <input
          list="fontes"
          name="id_fonte"
          value={form.id_fonte}
          onChange={handleChange}
          className="p-2 border rounded"
          placeholder="Digite ou selecione a fonte"
        />
        <datalist id="fontes">
          {fontes.map((f) => (
            <option key={f.id}>{f.nome}</option>
          ))}
        </datalist>

        <input
          list="programas"
          name="id_programa"
          value={form.id_programa}
          onChange={handleChange}
          className="p-2 border rounded"
          placeholder="Digite ou selecione o programa"
        />
        <datalist id="programas">
          {programas.map((p) => (
            <option key={p.id}>{p.nome}</option>
          ))}
        </datalist>
      </div>

      {/* Arquivo e Armazenamento */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="file"
          name="arquivo"
          onChange={handleChange}
          className="p-2 border rounded w-full sm:w-2/3"
        />
        <select
          name="armazenamento"
          value={form.armazenamento}
          onChange={handleChange}
          className="p-2 border rounded w-full sm:w-1/3"
        >
          <option value="">Tipo de Armazenamento</option>
          <option value="disco">Disco</option>
          <option value="local">Local</option>
          <option value="nuvem">Nuvem</option>
        </select>
      </div>

      {/* Observações */}
      <div>
        <textarea
          name="observacoes"
          value={form.observacoes}
          onChange={handleChange}
          className="p-2 border rounded w-full"
          placeholder="Observações"
          rows={3}
        />
      </div>

      {/* Botão */}
      <div className="text-center">
        <button
          type="submit"
          className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800"
        >
          Salvar
        </button>
      </div>
    </form>
  </div>
);

}
