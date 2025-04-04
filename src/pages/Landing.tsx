import { Link } from 'react-router-dom';
import { FaFileInvoiceDollar, FaChartLine, FaUsers, FaBars, FaTimes, FaChevronRight } from 'react-icons/fa';
import { useEffect, useState, useRef } from 'react';
import lpheroimg from '../public/lpheroimg.png';
import logodelvind from '../public/logodelvind.png';
import nomelogodelvind from '../public/nomelogodelvind.png';
import logocomnome from '../public/logocomnome.png';
import bolaImagem from '../public/cardimg.png';
import delvindapp from '../public/delvindapp.png';

export function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              setActiveSection(entry.target.id);
            }, 100);
          }
        });
      },
      {
        threshold: [0.5],
        rootMargin: '-10px 0px -10% 0px'
      }
    );
    const currentSections = sectionsRef.current;
    currentSections.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => {
      currentSections.forEach(section => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerHeight = document.querySelector('header').offsetHeight;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - headerHeight,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };
  const sections = [
    { id: 'hero', label: 'Início' },
    { id: 'mission', label: 'Missão' },
    { id: 'simplicity', label: 'Como Funciona' },
  ];

  return (
    <div className="min-h-screen bg-[#161e2e] text-white flex flex-col" style={{ fontFamily: 'Montserrat, sans-serif' }}> 
     <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-[#161e2e]/95 backdrop-blur-sm shadow-lg py-[0.0rem] md:py-0 lg:py-0' : 'py-[0.0rem] md:py-0 lg:py-0'}`}>
  <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <img
            src={logodelvind}
            alt="Nome Logo Delvind"
            className="h-12 w-12 object-contain -mr-16 md:h-16 md:w-16"
          />
          <img
            src={nomelogodelvind}
            alt="Nome Logo Delvind"
            className="w-full max-w-[284px] aspect-[16/9] object-contain md:max-w-[320px]"
          />
        </div>

        {/* Menu desktop -  só aparece acima de 1024px */}
        <nav className="hidden lg:flex space-x-4 items-center">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`px-2 py-1 rounded-md text-sm font-medium transition-colors ${activeSection === section.id ? 'text-[#FFFFFF] font-bold' : 'text-gray-500 hover:text-white'}`}
            >
              {section.label}
            </button>
          ))}
          <Link to="/login" className="text-white text-sm">Login</Link>
          <Link to="/pricing" className="bg-white text-[#0D47A1] px-3 py-1 sm:px-4 sm:py-1 rounded-full font-semibold hover:bg-gray-200 transition-colors text-sm">
            Teste Grátis
          </Link>
        </nav>

        {/* Botão do menu mobile - aparece abaixo de 1024px (727-1024px e <727px) */}
        <button
          className="lg:hidden text-gray-300 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={25} />}
        </button>
      </div>

        {/* Menu mobile - aparece abaixo de 1024px */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 flex flex-col bg-[#0f172a]/95 backdrop-blur-sm h-full min-h-screen">
            <div
              className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Container principal */}
            <div className="relative h-full flex flex-col">

              {/* Logo centralizada no topo */}
              <div className="flex justify-center">
                <img
                  src={nomelogodelvind}
                  alt="Nome Logo Delvind"
                  className="w-full max-w-[284px] aspect-[16/9] object-contain md:max-w-[320px]"
                />
              </div>

              {/* Botão de fechar no canto superior direito */}
              <button
                className="absolute top-16 right-4 text-gray-300 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <FaTimes size={28} />
              </button>

              {/* Lista de seções */}
              <div key={Date.now()} className="flex-grow px-6 overflow-y-auto">
                <div className="space-y-6 pb-72 text-right">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setTimeout(() => scrollToSection(section.id), 100);
                      }}
                      className={`block text-xl font-medium w-full text-right ${activeSection === section.id ? 'text-white font-bold' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      {section.label}
                    </button>
                  ))}
                  <Link
                    to="/login"
                    className="block text-xl text-gray-400 hover:text-white transition-colors w-full text-right"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </div>
              </div>

              {/* Botão "Teste Grátis" fixado no bottom 0 e centralizado */}
              <div className="fixed bottom-0 left-0 w-full bg-[#0f172a] border-t border-[#1e293b] p-4 flex justify-center">
                <Link
                  to="/pricing"
                  className="bg-[#2962FF] w-80 text-white px-8 py-3 rounded-full font-semibold hover:bg-[#1E50D9] transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Teste Grátis
                </Link>
              </div>
            </div>
          </div>
        )}



      </header>

      <main className="pt-32">
        {/* Seção Hero */}
        <section
          id="hero"
          ref={el => sectionsRef.current[0] = el}
          className="container mx-auto px-3 sm:px-6 lg:px-8 sm:pt-8 pb-12 sm:pb-16 lg:pb-20 flex flex-col-reverse lg:flex-row items-center justify-between min-h-[10vh]  lg:min-h-[100vh] relative"
        >
          {/* Bolhas grandes desktop - mantidas */}
          <div className="hidden lg:block absolute rounded-full bg-[#2962FF] w-[300px] h-[300px] right-[50px] top-[-150px] opacity-20 blur-[80px]"></div>
          <div className="hidden lg:block absolute rounded-full bg-[#2962FF] w-[200px] h-[200px] right-[200px] top-[-100px] opacity-15 blur-[60px]"></div>

          {/* Conteúdo de texto */}
          <div className="max-w-sm sm:max-w-md lg:max-w-lg text-left ml-4 sm:ml-8 md:ml-12 lg:ml-1 z-10 mt-8 sm:mt-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              O jeito fácil e automático de emitir NFS-E para sua empresa!
            </h1>
            <p className="text-sm sm:text-base mb-6 text-gray-300 max-w-xs sm:max-w-md md:max-w-md mx-0 text-justify">
              Automatize a emissão de notas fiscais de serviços, eliminando burocracias e otimizando seu fluxo de trabalho de forma ágil e eficiente.
            </p>
            <div className="text-left">
              <button
                onClick={() => scrollToSection('mission')}
                className="bg-[#2962FF] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold hover:bg-[#1E50D9] transition-colors inline-block"
              >
                SAIBA MAIS
              </button>
            </div>
          </div>

          <div className="relative w-full lg:w-1/2 mt-8 sm:mt-10 lg:mt-0">
            {/* Todas as bolinhas desktop mantidas */}
            <div className="hidden lg:block absolute rounded-full bg-[#2962FF] w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] right-[50px] md:right-[250px] top-[-400px] md:top-[-800px]" style={{ filter: 'blur(300px)' }}></div>
            <div className="hidden lg:block absolute rounded-full bg-[#2962FF] w-[200px] sm:w-[300px] md:w-[400px] h-[200px] sm:h-[300px] md:h-[400px] right-[200px] md:right-[1300px] top-[-200px] md:top-[-400px]" style={{ filter: 'blur(50px)' }}></div>
            <div className="hidden lg:block absolute rounded-full bg-[#2962FF] w-[20px] h-[20px] right-[50px] top-[-250px]"></div>
            <div className="hidden lg:block absolute rounded-full bg-[#2962FF] w-[50px] sm:w-[100px] h-[50px] sm:h-[100px] right-[-50px] sm:right-[-100px] top-[-150px] sm:top-[-250px]"></div>

            {/* Imagem desktop com bolinhas */}
            <div className="hidden lg:block absolute rounded-full bg-[#2962FF] w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] right-[-50px] sm:right-[-100px] top-[-100px] sm:top-[-230px]">
              <img
                src={lpheroimg}
                alt="Homem sorrindo usando tablet"
                className="relative z-10 rounded-lg max-w-full"
                style={{
                  position: 'absolute',
                  top: '40%',
                  left: '41%',
                  transform: 'translate(-50%, -50%)',
                  filter: 'blur(0px)',
                  maskImage: 'linear-gradient(to top, transparent 7%, black 18%)'
                }}
              />
            </div>

            {/* Bolinhas adicionais desktop */}
            <div className="hidden lg:block absolute rounded-full bg-[#2962FF] w-[20px] h-[20px] right-[200px] sm:right-[550px] top-[40px] sm:top-[80px]"></div>
            <div className="hidden lg:block absolute rounded-full bg-[#2962FF] w-[20px] h-[20px] left-[-200px] sm:left-[-680px] top-[-100px] sm:top-[-145px]"></div>
            <div className="hidden lg:block absolute rounded-full bg-[#2962FF] w-[50px] sm:w-[100px] h-[50px] sm:h-[100px] left-[-200px] sm:left-[-800px] top-[150px] sm:top-[265px]"></div>

            {/* Versão mobile/tablet com TODAS as bolinhas mantidas */}
            <div className="lg:hidden py-20 sm:py-10 flex items-center justify-center relative" style={{ overflow: 'visible' }}>
              <div className="absolute top-[25px] left-0 w-full h-[2px] bg-[#2962FF] lg:hidden"></div>

              <div className="relative w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] rounded-full bg-[#2962FF]">
                <img
                  src={lpheroimg}
                  alt="Homem sorrindo usando tablet"
                  className="rounded-lg"
                  style={{
                    objectFit: 'cover',
                    width: '150%',
                    height: '145%',
                    top: '15%',
                    left: '45%',
                    transform: 'translate(-50%, -50%)',
                    maxWidth: '500px',
                    zIndex: 10,
                    position: 'absolute',
                    filter: 'blur(0px)',
                    maskImage: 'linear-gradient(to top, transparent 7%, black 18%)'
                  }}
                />

                {/* Efeitos grandes mobile/tablet - mantidos */}
                <div className="absolute rounded-full bg-[#2962FF] w-[300px] h-[300px] right-[50px] top-[-400px]" style={{ filter: 'blur(300px)' }}></div>
                <div className="absolute rounded-full bg-[#2962FF] w-[150px] h-[150px] right-[-50px] top-[-200px]" style={{ filter: 'blur(50px)' }}></div>

                {/* Efeitos médios mobile/tablet - mantidos */}
                <div className="absolute rounded-full bg-[#2962FF] w-[150px] h-[150px] right-[150px] top-[-150px]" style={{ filter: 'blur(50px)' }}></div>

                {/* Bolinhas pequenas mobile/tablet - mantidas */}
                <div className="absolute rounded-full bg-[#2962FF] w-[20px] h-[20px] right-[-55px] top-[-50px]"></div>
                <div className="absolute rounded-full bg-[#2962FF] w-[50px] h-[50px] right-[-120px] top-[50px]"></div>
                <div className="absolute rounded-full bg-[#2962FF] w-[5px] h-[5px] right-[-25px] top-[-45px]"></div>
                <div className="absolute rounded-full bg-[#2962FF] w-[5px] h-[5px] right-[225px] top-[-5px]"></div>
                <div className="absolute rounded-full bg-[#2962FF] w-[50px] h-[50px] right-[250px] top-[150px]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Recursos */}
        <section className="py-10 sm:py-14 lg:py-16 bg-[#161e2e] relative">
          <div className="absolute right-0 bottom-0 w-20 h-20 rounded-full bg-[#2962FF] opacity-25 blur-sm"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold py-8 sm:py-10 lg:py-12 text-center mb-6 sm:mb-8 lg:mb-10">
              Uma plataforma inovadora pra facilitar a gestão de NFS-E
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              {/* Card 1 */}
              <div className="bg-[#1e293b] rounded-xl overflow-hidden aspect-[4/3] relative flex flex-col">
                <div className="flex justify-center pt-6 sm:pt-8 pb-3 sm:pb-4">
                  <div className="bg-[#2962FF] p-3 sm:p-4 rounded-full">
                    <FaFileInvoiceDollar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                </div>
                <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                  <h3 className="text-lg sm:text-xl lg:text-xl font-semibold mb-3 sm:mb-4">Faturamento Automático</h3>
                  <p className="text-gray-400 text-sm sm:text-base">
                    Configure cobranças recorrentes e deixe nosso sistema fazer o resto.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#1e293b] rounded-xl overflow-hidden aspect-[4/3] relative flex flex-col">
                <div className="flex justify-center pt-6 sm:pt-8 pb-3 sm:pb-4">
                  <div className="bg-[#2962FF] p-3 sm:p-4 rounded-full">
                    <FaChartLine className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                </div>
                <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                  <h3 className="text-lg sm:text-xl lg:text-xl font-semibold mb-3 sm:mb-4">Acompanhamento Inteligente</h3>
                  <p className="text-gray-400 text-sm sm:text-base">
                    Monitore pagamentos e receba notificações de atualizações.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-[#1e293b] rounded-xl overflow-hidden aspect-[4/3] relative flex flex-col">
                <div className="flex justify-center pt-6 sm:pt-8 pb-3 sm:pb-4">
                  <div className="bg-[#2962FF] p-3 sm:p-4 rounded-full">
                    <FaUsers className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                </div>
                <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                  <h3 className="text-lg sm:text-xl lg:text-xl font-semibold mb-3 sm:mb-4">Portal do Cliente</h3>
                  <p className="text-gray-400 text-sm sm:text-base">
                    Ofereça aos clientes acesso ao histórico de notas fiscais.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-start mt-10 sm:mt-12">
              <Link to="/pricing" className="bg-[#2962FF] text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-full font-semibold hover:bg-[#1E50D9] transition-colors relative inline-block">
                <span className="absolute left-[8px] top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></span>
                TESTE GRÁTIS
              </Link>
            </div>
          </div>
        </section>

        {/* Seção Missão */}
        {/* Seção Missão */}
        <section
          id="mission"
          ref={el => sectionsRef.current[1] = el}
          className="py-8 sm:py-10 lg:py-12 bg-[#161e2e] relative"
        >
          <div className="absolute left-10 w-7 h-7 rounded-full bg-[#2962FF] opacity-25 blur-sm"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl py-6 sm:py-8 font-bold">
              AUTOMATIZE SUA NFS-E E ESQUEÇA A BUROCRACIA!
            </h1>

            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-center">
              <div className="w-full lg:w-2/3 flex flex-col lg:flex-row gap-6 sm:gap-8">
                <div className="w-full lg:w-1/2">
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5">NOSSA MISSÃO</h2>
                    <p className="text-lg sm:text-xl text-justify">
                      Oferecer uma plataforma inovadora que facilite a gestão de NFS-E para empresas que prestam serviços contínuos, eliminando burocracias e otimizando processos.
                    </p>
                  </div>
                </div>

                <div className="w-full lg:w-1/2">
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">NOSSO PROPÓSITO</h2>
                    <p className="text-lg sm:text-xl text-justify mb-6 sm:mb-8">
                      Automatizar a emissão de NFS-E recorrentes, tornando o processo mais ágil, simples e eficiente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/3 flex justify-center lg:justify-end">
                <div className="rounded-full w-[180px] h-[180px] sm:w-[250px] sm:h-[250px] lg:w-[350px] lg:h-[350px]">
                  <img
                    src={bolaImagem}
                    alt="Imagem decorativa"
                    className="w-full h-full object-cover opacity-70"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <div className="w-full flex mt-8 sm:mt-10">
              <Link
                to="/pricing"
                className="bg-[#2962FF] text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-full font-semibold hover:bg-[#1E50D9] transition-colors relative"
              >
                <span className="absolute left-[8px] top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></span>
                TESTE GRÁTIS
              </Link>
            </div>
          </div>
        </section>

        {/* Seção Simplicidade */}
        <section
          id="simplicity"
          ref={el => sectionsRef.current[2] = el}
          className="bg-[#161e2e] relative pb-8 sm:pb-12 lg:pb-16"
        >
          <div className="absolute left-20 top-1/2 w-6 h-6 rounded-full bg-[#2962FF] opacity-30"></div>
          <div className="absolute right-32 bottom-32 w-20 h-20 rounded-full bg-[#2962FF] opacity-25 blur-sm"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">   <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="lg:col-span-5">
              <div className="text-center lg:text-left pt-8 sm:pt-10 lg:pt-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-white">
                  VEJA COMO É SIMPLES
                </h2>
                <p className="text-lg sm:text-xl lg:text-xl text-gray-300 text-center lg:text-justify">
                  O AgiNotas é simples de usar. Basta assinar o teste grátis, preencher algumas informações de autenticação com sua prefeitura e pronto, você já pode usar.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 flex items-center justify-center">
              <img
                src={delvindapp}
                alt="Tablet com AgiNotas"
                className="w-full max-w-[500px] sm:max-w-[600px] mx-auto lg:mx-0"
                loading="lazy"
              />
            </div>
          </div>

            <div className="flex justify-center mt-10 sm:mt-12">
              <Link
                to="/manual"
                className="bg-[#C0C0C0] text-black px-5 sm:px-6 py-2 sm:py-3 rounded-md font-semibold flex items-center min-w-[250px] sm:min-w-[280px] hover:bg-gray-300 transition-colors duration-200"
              >
                <img
                  src={logocomnome}
                  alt="Logo Delvind"
                  className="h-10 w-10 sm:h-12 sm:w-12 bg-[#161e2e] rounded-md p-1 mr-3 sm:mr-4"
                />
                <div className="flex flex-col items-start flex-grow">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base sm:text-lg font-medium">BAIXAR</span>
                    <FaChevronRight className="ml-2" />
                  </div>
                  <span className="text-xs sm:text-sm opacity-70 mt-1">Manual</span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0f172a] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center md:items-start">
              <div className="flex items-center">
                <img
                  src={logodelvind}
                  alt="Nome Logo Delvind"
                  className="h-12 w-12 object-contain -mr-2 md:h-16 md:w-16"
                />
                <img
                  src={nomelogodelvind}
                  alt="Nome Logo Delvind"
                  className="max-h-[100px] object-contain md:max-h-[150px]"
                />
              </div>
              <p className="text-gray-400 text-sm text-center text-justify w-full">
                Solução completa para gestão de NFS-E para serviços contínuos.
              </p>
            </div>


            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a3.333 3.333 0 100-6.666 3.333 3.333 0 000 6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
                Links Rápidos
              </h3>
              <a href="/politica-cookies" className="text-gray-400 hover:text-white transition-colors duration-200 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Política de Cookies
              </a>
              <a href="/politica-privacidade" className="text-gray-400 hover:text-white transition-colors duration-200 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Política de Privacidade
              </a>
              <a href="/termos-uso" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Termos de Uso
              </a>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Contato
              </h3>
              <p className="text-gray-400 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                contato@aginotas.com.br
              </p>
              <p className="text-gray-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                (45) 8800-0647
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Redes Sociais
              </h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-6 border-t border-[#1e293b] text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Delvind. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}