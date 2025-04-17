import Cookies from "js-cookie";
import React, { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { HiOutlineQuestionMarkCircle, HiEye, HiEyeOff } from "react-icons/hi";
import { usePopper } from "react-popper";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ApiUrl = import.meta.env.VITE_API_URL;

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

  const [anexo, setAnexo] = useState("Anexo III");
  const [receitaBruta12Meses, setReceitaBruta12Meses] = useState(0);
  const [receitaMes, setReceitaMes] = useState(0);
  const [resultado, setResultado] = useState(null);

/*   const handleCalcular = async () => {
    try {
      const response = await api.Calculate_Taxation({
        anexo,
        receitaBruta12Meses,
        receitaMes,
      });
      setResultado(response);
    } catch (error) {
      console.error("Erro ao calcular tributos:", error);
    }
  }; */

  const navigate = useNavigate();
  const { styles, attributes } = usePopper(referenceRef.current, popperRef.current, {
    placement: "bottom",
  });

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

  const handleImageUpload = (e:any) => {
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

{/*           <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Cálculo de Tributos - Simples Nacional</h2>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600">Anexo</label>
              <select
                value={anexo}
                onChange={(e) => setAnexo(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="Anexo III">Anexo III</option>
                <option value="Anexo IV">Anexo IV</option>
                <option value="Anexo V">Anexo V</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600">Receita Bruta (12 meses)</label>
              <input
                type="number"
                className="w-full mt-1 p-2 border rounded-md"
                value={receitaBruta12Meses}
                onChange={(e) => setReceitaBruta12Meses(parseFloat(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600">Receita do Mês</label>
              <input
                type="number"
                className="w-full mt-1 p-2 border rounded-md"
                value={receitaMes}
                onChange={(e) => setReceitaMes(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <button
            onClick={handleCalcular}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Calcular Tributos
          </button>

          {resultado && (
            <div className="mt-6 space-y-4">
              <div className="text-sm text-gray-700">
                <div><strong>Faixa:</strong> {resultado.faixa}</div>
                <div><strong>Alíquota Nominal:</strong> {(resultado.aliquotaNominal * 100)}%</div>
                <div><strong>Alíquota Efetiva:</strong> {(resultado.aliquotaEfetiva * 100)}%</div>
                <div><strong>Valor a Deduzir:</strong> R$ {resultado.valorADeduzir}</div>
                <div><strong>Total de Tributos:</strong> R$ {resultado.totalTributos}</div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Distribuição por Imposto</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(resultado.distribuicaoPorImposto).map(([nome, valor], idx) => (
                    <div key={idx} className="flex justify-between px-2">
                      <span>{nome}:</span>
                      <span>R$ {Number(valor)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>   */}        

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