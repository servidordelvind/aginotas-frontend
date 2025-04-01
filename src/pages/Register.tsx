import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Receipt, Loader2 } from 'lucide-react';
import { api } from '../lib/api.ts';

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [municipalRegistration, setMunicipalRegistration] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [states, setStates] = useState<{sigla: string, nome: string}[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [cnpjError, setCnpjError] = useState('');

  // Fetch da lista de estados
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
        const data = await response.json();
        const stateNames = data.map((state: any) => ({
          sigla: state.sigla,
          nome: state.nome,
        }));
        setStates(stateNames);
      } catch (err) {
        console.error('Erro ao carregar estados:', err);
      }
    };
    fetchStates();
  }, []);

  // Fetch das cidades quando estado muda
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedState) return;
      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`
        );
        const data = await response.json();
        const cityNames = data.map((city: any) => city.nome);
        setCities(cityNames);
        setSelectedCity(''); // Reseta a cidade selecionada
      } catch (err) {
        console.error('Erro ao carregar cidades:', err);
      }
    };
    fetchCities();
  }, [selectedState]);

  // Validação básica de CNPJ
  const validateCnpj = (cnpj: string): boolean => {
    const cleanedCnpj = cnpj.replace(/\D/g, '');
    
    if (cleanedCnpj.length !== 14) {
      setCnpjError('CNPJ deve ter 14 dígitos');
      return false;
    }
    
    // Padrão básico de CNPJ válido (pode implementar validação completa depois)
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/;
    if (cnpj.length > 0 && !cnpjRegex.test(cnpj) && cnpj.length >= 14) {
      setCnpjError('Formato inválido. Use 00.000.000/0000-00');
      return false;
    }
    
    setCnpjError('');
    return true;
  };

  // Formata o CNPJ enquanto digita
  const formatCnpj = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    // Aplica a formatação do CNPJ
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    if (cleaned.length > 5) formatted = `${formatted.slice(0, 6)}.${formatted.slice(6)}`;
    if (cleaned.length > 8) formatted = `${formatted.slice(0, 10)}/${formatted.slice(10)}`;
    if (cleaned.length > 12) formatted = `${formatted.slice(0, 15)}-${formatted.slice(15, 17)}`;
    
    return formatted.slice(0, 18); // Limita ao tamanho máximo
  };

  // Busca dados da empresa quando CNPJ muda
 // Função para buscar dados da empresa quando o CNPJ muda
useEffect(() => {
  const fetchCompanyData = async () => {
    const cleanedCnpj = cnpj.replace(/\D/g, '');
    
    if (!validateCnpj(cnpj) || cleanedCnpj.length !== 14) return;

    setLoadingCnpj(true);
    setError('');
    setCnpjError('');
    
    try {
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${cleanedCnpj}`);
      
      if (!response.ok) throw new Error('Erro na consulta');
      
      const data = await response.json();

      if (data.status === 'ERROR' || data.error) {
        throw new Error(data.message || 'CNPJ não encontrado');
      }

      // Preenche os campos automaticamente com os dados retornados
      setName(data.razao_social || '');
      setMunicipalRegistration(data.inscricao_municipal || '');
      setEmail(data.estabelecimento.email || '');
      setAddress(`${data.estabelecimento.tipo_logradouro || ''} ${data.estabelecimento.logradouro || ''}`.trim());

      // Preenche estado e cidade
      if (data.estabelecimento.estado) {
        setSelectedState(data.estabelecimento.estado.sigla);
        // Aguarda o carregamento das cidades antes de definir a cidade selecionada
        setTimeout(() => {
          if (data.estabelecimento.cidade.nome) {
            setSelectedCity(data.estabelecimento.cidade.nome);
          }
        }, 800);
      }

    } catch (err) {
      console.error('Erro na consulta:', err);
      setCnpjError('Dados não encontrados. Preencha manualmente');
      // Mantém o CNPJ mas limpa outros campos
      setName('');
      setMunicipalRegistration('');
      setSelectedState('');
      setSelectedCity('');
      setAddress('');
    } finally {
      setLoadingCnpj(false);
    }
  };

  const timer = setTimeout(() => {
    if (cnpj.replace(/\D/g, '').length === 14) {
      fetchCompanyData();
    }
  }, 1500);

  return () => clearTimeout(timer);
}, [cnpj]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!validateCnpj(cnpj)) {
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    //montar o const data = {} aqui e enviar ao backend com todos os dados corretamente incluindo o id da assinatura

    try {
      // await api.create_user({ 
      //   name, 
      //   cnpj: cnpj.replace(/\D/g, ''),
      //   inscricaoMunicipal: municipalRegistration, 
      //   email, 
      //   password, 
      //   estado: selectedState, 
      //   cidade: selectedCity,
      //   endereco: address
      // });
      // navigate('/login');
      console.log('Dados enviados:', {
        name,
        cnpj,
        municipalRegistration,
        email,
        password,
        selectedState,
        selectedCity,
        address
      });

      //await api.create_user({ name, cnpj, inscricaoMunicipal:municipalRegistration, email, password, estado:selectedState, cidade: selectedCity });
      //navigate('/login');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Receipt className="w-12 h-12 text-blue-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Crie sua conta</h1>
          <p className="text-gray-500">Comece seu teste grátis de 14 dias</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}
<div>
            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ {loadingCnpj && <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />}
            </label>
            <input
              id="cnpj"
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(formatCnpj(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                cnpjError ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              placeholder="00.000.000/0000-00"
            />
            {cnpjError && (
              <p className="mt-1 text-sm text-red-600">{cnpjError}</p>
            )}
          </div>
          
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome Empresa
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          

          <div>
            <label htmlFor="municipalRegistration" className="block text-sm font-medium text-gray-700 mb-1">
              Inscrição Municipal
            </label>
            <input
              id="municipalRegistration"
              type="text"
              value={municipalRegistration}
              onChange={(e) => setMunicipalRegistration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="state"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled>
                Selecione um estado
              </option>
              {states.map((state) => (
                <option key={state.sigla} value={state.sigla}>
                  {state.nome} ({state.sigla})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              Cidade
            </label>
            <select
              id="city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!selectedState}
            >
              <option value="" disabled>
                {selectedState ? 'Selecione uma cidade' : 'Selecione um estado primeiro'}
              </option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" size={18} />
                Criando conta...
              </span>
            ) : (
              'Criar conta'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}