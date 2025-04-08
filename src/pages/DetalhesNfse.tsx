import { useParams } from "react-router-dom";
import { saveAs } from 'file-saver';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { api } from '../lib/api.ts';
import { useEffect, useState } from "react";

export function DetalhesNfse() {
    const id = useParams<{ id: string }>();

    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    function downloadCustomerXml(customer: any) {
        const blob = new Blob([customer.xml], { type: 'application/xml' });
        const fileName = `${customer.data.Rps.Servico.Discriminacao}_nota.xml`;
        saveAs(blob, fileName);
    }

    async function criarNotaFiscal(customer: any) {
    
            //console.log(customer);
    
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(customer.xml, "text/xml");
    
            const getValue = (tagName: string) => {
            const element = xmlDoc.getElementsByTagName(tagName)[0];
            return element ? element.textContent || "" : "N/A";
            };
    
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([595.28, 841.89]); // A4 em pontos
    
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const fontSize = 10;
    
            const drawText = (text: string, x: number, y: number, size = fontSize) => {
            page.drawText(text, {
                x,
                y,
                size,
                font,
                color: rgb(0, 0, 0),
            });
            };
    
            // Cabeçalho
            drawText('MUNICIPIO DE MEDIANEIRA - Nota Fiscal de Serviços Eletrônica', 150, 800, 12);
            drawText(`Número: ${getValue("ns2:Numero")}`, 50, 780);
            drawText(`Data Prestação: ${getValue("ns2:DataEmissao")}`, 250, 780);
            drawText(`Autenticidade: ${getValue("ns2:CodigoVerificacao")}`, 450, 780);
            drawText('SITE AUTENTICIDADE: https://medianeira.oxy.elotech.com.br/iss/autenticar-documento-fiscal', 50, 765, 8);
    
            // Dados do prestador
            drawText('DADOS DO PRESTADOR DO SERVIÇO', 50, 740, 11);
            drawText(`Nome/Razão Social: ${getValue("ns2:RazaoSocial")}`, 50, 725);
            drawText(`CNPJ: ${getValue("ns2:Cnpj")}`, 50, 710);
            drawText(`Insc. Municipal: ${getValue("ns2:InscricaoMunicipal")}`, 50, 695);
            drawText(`Endereço: ${getValue("ns2:Endereco")}, ${getValue("ns2:Numero")}`, 50, 680);
            drawText(`Município/UF: ${getValue("ns2:CodigoMunicipio")}-${getValue("ns2:Uf")} | CEP: ${getValue("ns2:Cep")}`, 50, 665);
            drawText(`Fone: ${getValue("ns2:Telefone")} | E-mail: ${getValue("ns2:Email")}`, 50, 650);
    
            // Dados do tomador
            drawText('DADOS DO TOMADOR DO SERVIÇO', 50, 625, 11);
            drawText(`Nome/Razão Social: ${customer.data.Rps.Tomador.RazaoSocial || 'N/A'}`, 50, 610);
            drawText(`CPF/CNPJ: ${customer.data.Rps.Tomador.IdentificacaoTomador.CpfCnpj || 'N/A'}`, 50, 595);
            drawText(`Endereço: ${customer.data.Rps.Tomador.Endereco.Endereco}, ${customer.data.Rps.Tomador.Endereco.Numero} - ${customer.data.Rps.Tomador.Endereco.Bairro}`, 50, 580);
            drawText(`Município/UF: ${customer.data.Rps.Tomador.Endereco.CodigoMunicipio}-${customer.data.Rps.Tomador.Endereco.Uf} | CEP: ${customer.data.Rps.Tomador.Endereco.Cep}`, 50, 565);
            drawText(`Fone: ${customer.data.Rps.Tomador.Contato.Telefone || 'N/A'} | E-mail: ${customer.data.Rps.Tomador.Contato.Email || 'N/A'}`, 50, 550);
    
            // Serviço
            drawText('DEFINIÇÃO DO SERVIÇO', 50, 525, 11);
            drawText(`Item da Lista de Serviços: ${getValue("ns2:ItemListaServico")} ${getValue("ns2:Descricao")}`, 50, 510);
            drawText(`CNAE: ${getValue("ns2:CodigoCnae")} | Competência: ${getValue("ns2:Competencia")}`, 50, 495);
            drawText(`Local da Prestação: ${getValue("ns2:CodigoMunicipio")}-${getValue("ns2:Uf")}`, 50, 480);
            drawText('Natureza da Operação: EXIGÍVEL', 50, 465);
    
            // Discriminação
            drawText('DISCRIMINAÇÃO DO SERVIÇO', 50, 440, 11);
            drawText(`- ${getValue("ns2:Discriminacao")}`, 50, 425);
            drawText(`Descrição: ${getValue("ns2:Descricao")} | Qtde: ${getValue("ns2:Quantidade")} | Valor Unitário: R$ ${getValue("ns2:ValorUnitario")} | Valor Total: R$ ${getValue("ns2:ValorServicos")}`, 50, 410);
    
            // Tributos
            drawText('TRIBUTOS INCIDENTES', 50, 380, 11);
            drawText(`ISSQN: R$ ${getValue("ns2:ValorIss")} | Alíquota: ${getValue("ns2:Aliquota")}% | Retido: ${getValue("ns2:IssRetido") === "2" ? "Não" : "Sim"}`, 50, 365);
    
            // Totais
            drawText('TOTALIZAÇÃO DO DOCUMENTO FISCAL', 50, 320, 11);
            drawText(`Base de Cálculo ISSQN: R$ ${getValue("ns2:BaseCalculo")}`, 50, 305);
            drawText(`Valor Total: R$ ${getValue("ns2:ValorServicos")} | Descontos: R$ ${getValue("ns2:DescontoIncondicionado")} | Valor Líquido: R$ ${getValue("ns2:ValorLiquidoNfse")}`, 50, 290);
    
            // Assinatura
            drawText(`Recebemos de ${getValue("ns2:RazaoSocial")} os serviços constantes nesta NFS-e.`, 50, 260);
            drawText('DATA: ____/____/_____   Assinatura: ____________________________', 50, 240);
    
            // Salvar
            const pdfBytes = await pdfDoc.save();
            saveAs(new Blob([pdfBytes], { type: "application/pdf" }), "modelo-nota-fiscal.pdf");
    }

    useEffect(()=>{
        async function fetchData() {
            try {
                setLoading(true);
                const response = await api.Find_Invoice_ByID(`${id}`);
                const customer = response.data;
                console.log(customer);
                downloadCustomerXml(customer);
                criarNotaFiscal(customer);
                setLoading(false);
            } catch (error) {
                console.error("Erro ao buscar os dados:", error);
            }
        }
        fetchData();
    },[])

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
    }

    return(
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="flex justify-center gap-4 mb-6">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600">
            Baixar XML
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600">
            Baixar PDF
            </button>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-4xl">
            <h2 className="text-lg font-bold mb-4 text-center">Resumo da NFSe</h2>
            <div className="grid grid-cols-2 gap-4">
            <div>
            <p><span className="font-semibold">Número Nota:</span> 4</p>
            <p><span className="font-semibold">Data Prestação:</span> 29/03/2025</p>
            </div>
            <div>
            <p><span className="font-semibold">Tipo Documento:</span> NFS-e (NOTA FISCAL DE SERVIÇOS ELETRONICA)</p>
            </div>
            <div>
            <p><span className="font-semibold">Prestador:</span> 57.278.676/0001-69 - DELVIND TECNOLOGIA DA INFORMAÇÃO LTDA</p>
            </div>
            <div>
            <p><span className="font-semibold">Tomador:</span> 11.769.293/0001-92 - Z D FRACARO LTDA</p>
            </div>
            <div>
            <p><span className="font-semibold">Natureza da Operação:</span> EXIGÍVEL</p>
            </div>
            <div>
            <p><span className="font-semibold">Código do Serviço:</span> 102</p>
            </div>
            <div className="col-span-2">
            <p><span className="font-semibold">Dados da Criação do Documento:</span> Emitido via Integração de Sistemas - 29/03/2025 19:13</p>
            </div>
            </div>

            <h2 className="text-lg font-bold mt-6 mb-4 text-center">Valores Totais</h2>
            <div className="grid grid-cols-2 gap-4">
            <div>
            <p><span className="font-semibold">Total Descontos Condicionados:</span> R$ 0,00</p>
            <p><span className="font-semibold">Total Descontos Incondicionados:</span> R$ 0,00</p>
            <p><span className="font-semibold">% Deduções:</span> 0,00 %</p>
            </div>
            <div>
            <p><span className="font-semibold">Base de Cálculo do ISS:</span> R$ 1.224,00</p>
            <p><span className="font-semibold">Valor dos Impostos:</span> R$ 53,98</p>
            <p><span className="font-semibold">Valor Líquido:</span> R$ 1.224,00</p>
            </div>
            </div>

            <div className="mt-6 p-4 bg-green-100 rounded-lg">
            <p className="text-green-700 font-bold text-center">Total da Nota Fiscal: R$ 1.224,00</p>
            </div>
            </div>
        </div>
    )
}