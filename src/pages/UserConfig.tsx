import Cookies from "js-cookie";
import React, { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { HiOutlineQuestionMarkCircle, HiEye, HiEyeOff } from "react-icons/hi";
import { usePopper } from "react-popper";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function UserConfig() {
  const [user, setUser] = useState("");
  const [senhaElotech, setSenhaElotech] = useState("");
  const [homologacao, setHomologacao] = useState('');
  const [regimeEspecialTributacao, setRegimeEspecialTributacao] = useState(0);//valores padrões 
  const [incentivoFiscal, setIncentivoFiscal] = useState(0); //valores padrões 
  const [showPopover, setShowPopover] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const referenceRef = useRef(null);
  const popperRef = useRef(null);
  const [base64Image, setBase64Image] = useState("");


  const navigate = useNavigate();
  const { styles, attributes } = usePopper(referenceRef.current, popperRef.current, {
    placement: "bottom",
  });

  const [anexo, setAnexo] = useState('Anexo III');
  const [receitaBruta, setReceitaBruta] = useState(0);

  const faixasAnexoIII = [
    {
      descricao: 'Até 180.000,00',
      limiteSuperior: 180000,
      aliquota: 6.00,
      distribuicao: [
        { nome: 'IRPJ', valor: 4.00 },
        { nome: 'CSLL', valor: 3.50 },
        { nome: 'Cofins', valor: 12.82 },
        { nome: 'PIS PASEP', valor: 2.78 },
        { nome: 'CPP', valor: 43.40 },
        { nome: 'ISS', valor: 33.50 },
      ]
    },
    {
      descricao: 'De 180.000,01 a 360.000,00',
      limiteSuperior: 360000,
      aliquota: 11.20,
      distribuicao: [
        { nome: 'IRPJ', valor: 4.00 },
        { nome: 'CSLL', valor: 3.50 },
        { nome: 'Cofins', valor: 14.05 },
        { nome: 'PIS PASEP', valor: 3.05 },
        { nome: 'CPP', valor: 43.40 },
        { nome: 'ISS', valor: 32.00 },
      ]
    },
    {
      descricao: 'De 360.000,01 a 720.000,00',
      limiteSuperior: 720000,
      aliquota: 13.50,
      distribuicao: [
        { nome: 'IRPJ', valor: 4.00 },
        { nome: 'CSLL', valor: 3.50 },
        { nome: 'Cofins', valor: 13.64 },
        { nome: 'PIS PASEP', valor: 2.96 },
        { nome: 'CPP', valor: 43.40 },
        { nome: 'ISS', valor: 32.50 },
      ]
    },
    {
      descricao: 'De 720.000,01 a 1.800.000,00',
      limiteSuperior: 1800000,
      aliquota: 16.00,
      distribuicao: [
        { nome: 'IRPJ', valor: 4.00 },
        { nome: 'CSLL', valor: 3.50 },
        { nome: 'Cofins', valor: 13.64 },
        { nome: 'PIS PASEP', valor: 2.96 },
        { nome: 'CPP', valor: 43.40 },
        { nome: 'ISS', valor: 32.50 },
      ]
    },
    {
      descricao: 'De 1.800.000,01 a 3.600.000,00',
      limiteSuperior: 3600000,
      aliquota: 21.00,
      distribuicao: [
        { nome: 'IRPJ', valor: 4.00 },
        { nome: 'CSLL', valor: 3.50 },
        { nome: 'Cofins', valor: 12.82 },
        { nome: 'PIS PASEP', valor: 2.78 },
        { nome: 'CPP', valor: 43.40 },
        { nome: 'ISS', valor: 33.50 },
      ]
    },
    {
      descricao: 'De 3.600.000,01 a 4.800.000,00',
      limiteSuperior: 4800000,
      aliquota: 33.00,
      distribuicao: [
        { nome: 'IRPJ', valor: 35.00 },
        { nome: 'CSLL', valor: 15.00 },
        { nome: 'Cofins', valor: 16.03 },
        { nome: 'PIS PASEP', valor: 3.47 },
        { nome: 'CPP', valor: 30.50 },
        { nome: 'ISS', valor: 0.00 },
      ]
    },
  ];

  const faixaAtual = faixasAnexoIII.find(faixa => receitaBruta <= faixa.limiteSuperior) || faixasAnexoIII[faixasAnexoIII.length - 1];

  const [tributos, setTributos] = useState([
    { nome: 'ISS', aliquota: 2.01, valor: 5.58, retido: false },
    { nome: 'Cofins', aliquota: 0.7692, valor: 2.13864, retido: false },
    { nome: 'IR', aliquota: 0.24, valor: 0.68672, retido: false },
    { nome: 'CPP', aliquota: 2.604, valor: 7.23391, retido: false },
    { nome: 'PIS', aliquota: 0.1688, valor: 0.48337, retido: false },
    { nome: 'INSS', aliquota: 0, valor: 0, retido: false },
    { nome: 'CSLL', aliquota: 0.213, valor: 0.58338, retido: false },
    { nome: 'Outras', aliquota: 0, valor: 0, retido: false },
  ]);

  useEffect(() => {
    if (!faixaAtual) return;

    const totalDistribuicao = faixaAtual.distribuicao.reduce((acc, curr) => acc + curr.valor, 0);

    const novaLista = tributos.map((tributo) => {
      // Mapeamento dos nomes dos impostos entre os dois objetos
      const mapNomes = {
        IR: 'IRPJ',
        CSLL: 'CSLL',
        Cofins: 'Cofins',
        PIS: 'PIS PASEP',
        CPP: 'CPP',
        ISS: 'ISS',
      };

      const correspondente = faixaAtual.distribuicao.find((item) => item.nome === mapNomes[tributo.nome]);

      if (correspondente) {
        const novaAliquota = correspondente.valor;
        const novoValor = parseFloat(((novaAliquota / 100) * receitaBruta).toFixed(2)); // Se valor for sobre receita
        return {
          ...tributo,
          aliquota: parseFloat(novaAliquota.toFixed(4)),
          valor: novoValor
        };
      }

      return tributo; // se não encontrar correspondente, mantém como está
    });

    setTributos(novaLista);
  }, [receitaBruta]);


  const handleAliquotaChange = (index: number, newAliquota: number) => {
    const updated = [...tributos];
    updated[index].aliquota = newAliquota;
    setTributos(updated);
  };

  const handleRetidoChange = (index: number, checked: boolean) => {
    const updated = [...tributos];
    updated[index].retido = checked;
    setTributos(updated);
  };

  useEffect(() => {
    loadUserSettings();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        referenceRef.current &&
        popperRef.current &&
        !referenceRef.current.contains(event.target) &&
        !popperRef.current.contains(event.target)
      ) {
        setShowPopover(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [referenceRef, popperRef]);

  
  const loadUserSettings = async () => {
    const user = localStorage.getItem("user");
    if (!user) throw new Error("Usuário não encontrado");
    const userConvertido = JSON.parse(user);

    let verify = '';
    if(userConvertido.homologa === true){
      verify = 'Sim';
    }else{
      verify = 'Não';
    }
    setUser(userConvertido);
    setHomologacao(verify);
    setSenhaElotech(userConvertido.senhaelotech);
    setRegimeEspecialTributacao(userConvertido.RegimeEspecialTributacao);
    setIncentivoFiscal(userConvertido.IncentivoFiscal); //
  };

  const handleSaveSettings = async () => {
    try {
      let verify = false;

      if(homologacao === 'Sim'){
        verify = true;
      }else{
        verify = false;
      }

      const updatedSettings = {
        homologa: verify,
        senhaelotech: senhaElotech,        
        RegimeEspecialTributacao: regimeEspecialTributacao,
        IncentivoFiscal: incentivoFiscal,
      };

      await api.update_user(updatedSettings);
      loadUserSettings();
      navigate('/login');
      console.log("Configurações salvas com sucesso");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setBase64Image(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateUser = async () => {
    try {
      await api.update_user({picture:base64Image});
      toast.success("Imagem atualizada com sucesso!");
      navigate('/login');
    } catch (error) {
      toast.error("Ocorreu um erro ao realizar essa atualização!");
      return;
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configurações de Usuário</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="space-y-4">
        {user && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Pré-visualização:</p>
            <img
              src={user.picture}
              alt="Preview"
              className="max-h-48 rounded border"
            />
          </div>
        )}

        {base64Image && (
          <div className="mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              onClick={() => handleUpdateUser()}
            >
              Enviar imagem
            </button>
          </div>
        )}
        <div className="relative">
        <label className="block text-sm font-semibold text-gray-600">Picture</label>
        <input
          type="file"
          accept="image/*"
          className="w-full mt-2 p-3 border border-gray-300 rounded-md"
          onChange={handleImageUpload}
        />
      </div>
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-600">Senha Elotech</label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md"
              value={senhaElotech}
              onChange={(e) => setSenhaElotech(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <HiEyeOff size={24} /> : <HiEye size={24} />}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <label className="block text-sm font-semibold text-gray-600">Homologação</label>
            <button
              ref={referenceRef}
              className="p-1 text-gray-500"
              onClick={() => setShowPopover(!showPopover)}
            >
              <HiOutlineQuestionMarkCircle size={20} />
            </button>

            <select
              className="w-full mt-2 p-3 border border-gray-300 rounded-md"
              value={homologacao}
              onChange={(e) => setHomologacao(e.target.value)}
            >
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>

          {showPopover && (
            <div
              ref={popperRef}
              style={styles.popper}
              {...attributes.popper}
              className="bg-white border border-gray-300 rounded-md p-2 shadow-md"
            >
              <p>
                <strong>Sim:</strong> Modo de teste.
              </p>
              <p>
                <strong>Não:</strong> Modo real.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-600">Regime Especial de Tributação</label>
            <input
              type="number"
              className="w-full mt-2 p-3 border border-gray-300 rounded-md"
              value={regimeEspecialTributacao}
              onChange={(e) => setRegimeEspecialTributacao(parseInt(e.target.value, 10))}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600">Incentivo Fiscal</label>
            <input
              type="number"
              className="w-full mt-2 p-3 border border-gray-300 rounded-md"
              value={incentivoFiscal}
              onChange={(e) => setIncentivoFiscal(parseInt(e.target.value, 10))}
            />
          </div>

          <div className="w-full bg-white rounded-md p-4 border border-gray-200 space-y-4">
          {/* Seletor de Anexo e Receita Bruta */}
          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm font-semibold text-gray-600">Anexo</label>
              <select
                value={anexo}
                onChange={(e) => setAnexo(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="Anexo III">ANEXO III DA LEI COMPLEMENTAR Nº 123, DE 14 DE DEZEMBRO DE 2006</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">Receita Bruta dos últimos 12 meses (RBT12)</label>
              <input
                type="number"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                value={receitaBruta}
                onChange={(e) => setReceitaBruta(parseFloat(e.target.value))}
              />
            </div>

            <button className="bg-green-600 text-white font-semibold px-4 py-2 rounded-md h-10">
              Visualizar Faixas
            </button>
          </div>
          {/* Informações da faixa */}
          <div className="border-t pt-4">
            <div className="text-sm mb-2 text-gray-700">Faixa: <strong>{faixaAtual.descricao}</strong></div>
            <div className="text-sm mb-4 text-gray-700">Alíquota: <strong>{faixaAtual.aliquota}%</strong></div>

            <div className="grid grid-cols-2 gap-y-2 text-sm text-green-700 font-medium">
              {faixaAtual.distribuicao.map((imp, idx) => (
                <div key={idx} className="flex justify-between px-2">
                  <span>{imp.nome}:</span>
                  <span>{imp.valor}%</span>
                </div>
              ))}
            </div>
          </div>
          {/* Tributos detalhados */}
          <div className="mt-6 border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Tributos Calculados</h4>
            <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-800">
              {tributos.map((t, idx) => (
                <div key={idx} className="flex justify-between px-2">
                  <span>{t.nome}:</span>
                  <span>{t.valor} (Aliquota: {t.aliquota}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

          <div className="w-full">
              <div className="grid grid-cols-4 gap-2 mb-2">
                <span className="text-sm font-bold text-gray-700">-------</span>
                <span className="text-sm font-bold text-gray-700">Alíquota %</span>
                <span className="text-sm font-bold text-gray-700">Valor</span>
                <span className="text-sm font-bold text-gray-700">Retido</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {tributos.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-4 items-center gap-2">
                    <label className="text-sm font-semibold text-gray-600 col-span-1">
                      {item.nome}
                    </label>

                    <input
                      type="text"
                      value={item.aliquota}
                      className="p-2 border border-gray-300 rounded-md w-full"
                      onChange={(e) => handleAliquotaChange(idx, parseFloat(e.target.value))}
                      readOnly
                    />

                    <input
                      type="text"
                      value={`R$ ${item.valor}`}
                      className="p-2 border border-gray-300 rounded-md w-full"
                      readOnly
                    />

                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={item.retido}
                      onChange={(e) => handleRetidoChange(idx, e.target.checked)}
                    />
                  </div>
                ))}
              </div>
            </div>

          <div>
            <button
              onClick={handleSaveSettings}
              className="w-full mt-4 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700"
            >
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}