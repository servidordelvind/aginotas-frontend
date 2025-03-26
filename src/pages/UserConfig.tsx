import Cookies from "js-cookie";
import React, { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { HiOutlineQuestionMarkCircle, HiEye, HiEyeOff } from "react-icons/hi";
import { usePopper } from "react-popper";
import { useNavigate } from "react-router-dom";

export function UserConfig() {
  const [senhaElotech, setSenhaElotech] = useState("");
  const [homologacao, setHomologacao] = useState('');
  const [regimeEspecialTributacao, setRegimeEspecialTributacao] = useState(0);//valores padrões 
  const [incentivoFiscal, setIncentivoFiscal] = useState(0); //valores padrões 
  const [showPopover, setShowPopover] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const referenceRef = useRef(null);
  const popperRef = useRef(null);

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configurações de Usuário</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="space-y-4">
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