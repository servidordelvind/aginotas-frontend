import Cookies from "js-cookie";
import React, { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";
import { usePopper } from "react-popper";

export function UserConfig() {
  const [empresa, setEmpresa] = useState("");
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [homologacao, setHomologacao] = useState("");
  const [showPopover, setShowPopover] = useState(false);
  const referenceRef = useRef(null);
  const popperRef = useRef(null);

  const { styles, attributes } = usePopper(referenceRef.current, popperRef.current, {
    placement: "bottom",
  });

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const userId = Cookies.get("/user/find");
        console.log("cokkie item: " + userId);

        if (!userId) {
          console.error("Usuário não encontrado ou não autenticado");
          return;
        }

        const response = await api.find_user(userId);

        if (response) {
          setEmpresa(response.empresa);
          setInscricaoMunicipal(response.inscricaoMunicipal);
          setHomologacao(response.homologacao ? "Sim" : "Não");
        }
      } catch (error) {
        console.error("Erro ao carregar configurações do usuário:", error);
      }
    };

    loadUserSettings();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (referenceRef.current && popperRef.current && !referenceRef.current.contains(event.target) && !popperRef.current.contains(event.target)) {
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

      if (senha !== senhaConfirmacao) {
        console.error("As senhas não coincidem");
        return;
      }

      const updatedSettings = {
        empresa: empresa,
        inscricaoMunicipal: inscricaoMunicipal,
        homologacao: homologacao === "Sim",
        senha: senha,
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
          <div>
            <label className="block text-sm font-semibold text-gray-600">Nome da Empresa</label>
            <input
              type="text"
              className="w-full mt-2 p-3 border border-gray-300 rounded-md"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600">Inscrição Municipal</label>
            <input
              type="text"
              className="w-full mt-2 p-3 border border-gray-300 rounded-md"
              value={inscricaoMunicipal}
              onChange={(e) => setInscricaoMunicipal(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600">Senha</label>
            <input
              type="password"
              className="w-full mt-2 p-3 border border-gray-300 rounded-md"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600">Confirmar Senha</label>
            <input
              type="password"
              className="w-full mt-2 p-3 border border-gray-300 rounded-md"
              value={senhaConfirmacao}
              onChange={(e) => setSenhaConfirmacao(e.target.value)}
            />
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