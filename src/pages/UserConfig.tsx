import Cookies from "js-cookie";
import React, { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { HiOutlineQuestionMarkCircle, HiEye, HiEyeOff } from "react-icons/hi"; 
import { usePopper } from "react-popper";

export function UserConfig() {
  const [senhaElotech, setSenhaElotech] = useState("");
  const [homologacao, setHomologacao] = useState("");
  const [showPopover, setShowPopover] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const referenceRef = useRef(null);
  const popperRef = useRef(null);

  const { styles, attributes } = usePopper(referenceRef.current, popperRef.current, {
    placement: "bottom",
  });

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const userId = Cookies.get("/user/find");
        console.log("cookie item: " + userId);

        if (!userId) {
          console.error("Usuário não encontrado ou não autenticado");
          return;
        }

        const response = await api.find_user(userId); 

        if (response) {
          setHomologacao(response.homologacao ? "Sim" : "Não");
          setSenhaElotech(response.senhaElotech);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações do usuário:", error);
      }
    };

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

  const handleSaveSettings = async () => {
    try {
      const userId = Cookies.get("userId");
      if (!userId) {
        console.error("Usuário não autenticado");
        return;
      }

      const updatedSettings = {
        homologacao: homologacao === "Sim",
        senhaElotech: senhaElotech,
      };

      await api.saveUserSettings(userId, updatedSettings);

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
              {showPassword ? <HiEyeOff /> : <HiEye />}
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