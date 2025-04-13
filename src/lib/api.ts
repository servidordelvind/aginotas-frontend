import { saveAs } from 'file-saver';
import logomedianeira from '../public/medianeira.jpg';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { writeFile } from "fs/promises";
import puppeteer from "puppeteer";
const API_URL = import.meta.env.VITE_API_URL;
import Cookies from "js-cookie";

export const api = {

  async create_user(data: any) {
    const response = await fetch(`${API_URL}/user/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar usuário');
    }

    return response.json();
  },

  async create_subscription_user(data: any) {
    const response = await fetch(`${API_URL}/pagarme/create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar assinatura do usuário');
    }

    return response.json();
  },

  async update_user(data: any) {
    const response = await fetch(`${API_URL}/user/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar dados');
    }

    return response.json();
  },  

  async update_customer(id: string, data: any) {
    const response = await fetch(`${API_URL}/customer/update/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar cliente');
    }

    return response.json();
  }, 

  async login_user(data: any) {
    const response = await fetch(`${API_URL}/user/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao autenticar usuário');
    }

    return response.json();
  }, 

  async find_user(data: any) {
    const response = await fetch(`${API_URL}/user/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar usuário');
    }

    return response.json();
  },

  async find_all_users() {
    const response = await fetch(`${API_URL}/user/findall`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Falha ao buscar usuários');
    }

    return response.json();
  },

  async recover_send_email_user(data: any) {
    const response = await fetch(`${API_URL}/user/recover/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao enviar código no email do cliente');
    }

    return response.json();
  },

  async recover_password_user(data: any) {
    const response = await fetch(`${API_URL}/user/recover/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar a senha');
    }

    return response.json();
  },

  async create_customer(data: any) {
    const response = await fetch(`${API_URL}/customer/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao cadastrar cliente');
    }

    return response.json();
  },

  async find_customers() {
    const response = await fetch(`${API_URL}/customer/find`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar clientes');
    }

    return response.json();
  },

  async find_customers_user() {
    const response = await fetch(`${API_URL}/customer/findbyuser`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar clientes');
    }

    return response.json();
  },
  
  async find_subscription(id: string) {
    const response = await fetch(`${API_URL}/pagarme/get-subscription/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao assinatura');
    }

    return response.json();
  },
  
  async find_customers_actives() {
    const response = await fetch(`${API_URL}/customer/actives`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar clientes ativos');
    }

    return response.json();
  },

  async delete_customer(id: String) {
    const response = await fetch(`${API_URL}/customer/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao excluir cliente');
    }

    return response.json();
  },

  async delete_schedule(id: String) {
    const response = await fetch(`${API_URL}/scheduling/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao excluir agendamento');
    }

    return response.json();
  },

  async changestatus_customer(id: String, status: String) {
    const data = {
      status
    }
    const response = await fetch(`${API_URL}/customer/changestatus/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao cadastrar cliente');
    }

    return response.json();
  },

  async save_ondatabase_invoice(id: string, data: any) {
    const response = await fetch(`${API_URL}/invoice/create/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao salvar nota fiscal');
    }

    return response.json();
  },

  async find_invoices(){
    const response = await fetch(`${API_URL}/invoice/findinvoices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar notas fiscais');
    }

    return response.json();
  },

  async find_all_invoices(){
    const response = await fetch(`${API_URL}/invoice/find`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar notas fiscais');
    }

    return response.json();
  },

  async find_schedulings(id: string){
    const response = await fetch(`${API_URL}/scheduling/find/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar agendamentos');
    }

    return response.json();
  },

  async create_scheduling(data: any) {
    const response = await fetch(`${API_URL}/scheduling/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar agendamento');
    }

    return response.json();
  },

  async create_invoice(data: any) {
    const response = await fetch(`${API_URL}/invoice/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar nota fiscal');
    }

    return response.json();
  },

  async login_admin(data: any){
    const response = await fetch(`${API_URL}/admin/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao autenticar usuário');
    }

    return response.json();
  },

  async find_all_invoices_customer(id:string){
    const response = await fetch(`${API_URL}/invoice/findinvoicescustomer/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar notas fiscais geradas no sistema');
    }

    return response.json();
  },

  async cancel_invoice(data: any){
    const response = await fetch(`${API_URL}/invoice/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao cancelar nota fiscal');
    }

    return response.json();
  },

  async replace_invoice(data: any){
    const response = await fetch(`${API_URL}/invoice/replace`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao cancelar nota fiscal');
    }

    return response.json();
  },

  async find_plans(){
    const response = await fetch(`${API_URL}/pagarme/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar planos cadastrados no sistema');
    }

    return response.json();
  }, 
  
  async Edit_Plan(data: any){
    const response = await fetch(`${API_URL}/pagarme/edit-item-plan`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    return response.json();
  },

  async Find_All_Subscriptions(){
    const response = await fetch(`${API_URL}/pagarme/get-all-subscriptions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    return response.json();
  }, 

  async Cancel_Subscription(id: String) {
    const response = await fetch(`${API_URL}/pagarme/cancel-subscription/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao cancelar assinatura');
    }

    return response.json();
  },

  async Find_CNAES_ELOTECH(){
    const response = await fetch(`${API_URL}/elotech/cnaes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    return response.json();
  }, 

  async Find_SERVICOS_ELOTECH(){
    const response = await fetch(`${API_URL}/elotech/servicos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    return response.json();
  },

  async Find_SERVICO_POR_CNAE(id: string){
    const response = await fetch(`${API_URL}/elotech/servicosporcnae/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    return response.json();
  },

  async Find_Invoice_ByID(id: string){
    const response = await fetch(`${API_URL}/invoice/find/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    return response.json();
  },

/*   async Export_Invoice_PDF(customer: any){
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(customer.xml, "text/xml");

    const getValue = (tagName: string) => {
        const element = xmlDoc.getElementsByTagName(tagName)[0];
        return element ? element.textContent || "" : "N/A";
    };

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = 10;
    const titleColor = rgb(0.3, 0.3, 0.6); // Azul escuro puxado para roxo

    const drawText = (
        text: string,
        x: number,
        y: number,
        size = fontSize,
        bold = false
    ) => {
        page.drawText(text, {
            x,
            y,
            size,
            font: bold ? fontBold : font,
            color: rgb(0, 0, 0),
        });
    };

    const drawTitleBar = (text: string, x: number, y: number, width: number) => {
        page.drawRectangle({
            x,
            y,
            width,
            height: 16,
            color: rgb(0.8, 0.8, 1), // lilás claro
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
        });
        drawText(text, x + 5, y + 4, 10, true);
    };

    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
        page.drawLine({
            start: { x: x1, y: y1 },
            end: { x: x2, y: y2 },
            thickness: 1,
            color: rgb(0, 0, 0),
        });
    };


    const response = await fetch(logomedianeira);
    const logoBytes = await response.arrayBuffer();
    const logoPrefeitura = await pdfDoc.embedJpg(logoBytes);
    const prefeituraDims = logoPrefeitura.scale(0.3);

    let y = 800;

    // Cabeçalho + logo prefeitura
     page.drawImage(logoPrefeitura, {
        x: 50,
        y: y + -40,
        width: prefeituraDims.width,
        height: prefeituraDims.height,
    }); 

    drawText("MUNICÍPIO DE MEDIANEIRA", 150, y, 12, true);
    drawText("Nota Fiscal de Serviços Eletrônica", 150, y - 14, 10);
    drawText(`Número: ${getValue("ns2:Numero")}`, 400, y, 10);
    drawText(`Data de Emissão: ${getValue("ns2:DataEmissao")}`, 400, y - 14, 10);
    drawText(`Código Verificação: ${getValue("ns2:CodigoVerificacao")}`, 400, y - 28, 10);
    y -= 60;

    drawText(
        "SITE AUTENTICIDADE: https://medianeira.oxy.elotech.com.br/iss/autenticar-documento-fiscal",
        50,
        y,
        8
    );
    y -= 25;

    // DADOS DO PRESTADOR
    drawTitleBar("DADOS DO PRESTADOR DO SERVIÇO", 50, y, 495);

    y -= 20;
    drawText(`Nome/Razão Social: ${getValue("ns2:RazaoSocial")}`, 55, y);
    drawText(`CNPJ: ${getValue("ns2:Cnpj")}`, 55, y - 14);
    drawText(`Inscrição Municipal: ${getValue("ns2:InscricaoMunicipal")}`, 350, y - 14);
    drawText(
        `Endereço: ${getValue("ns2:Endereco")} ${getValue("ns2:Numero")}`,
        55, //130
        y - 28
    );
    y -= 42;
    drawLine(50, y, 545, y);
    y -= 10;

    // DADOS DO TOMADOR
    drawTitleBar("DADOS DO TOMADOR DO SERVIÇO", 50, y, 495);
    y -= 18;
    drawText(
        `Nome/Razão Social: ${customer.data.Rps.Tomador.RazaoSocial || "N/A"}`,
        55,
        y
    );
    drawText(
        `CPF/CNPJ: ${customer.data.Rps.Tomador.IdentificacaoTomador.CpfCnpj || "N/A"}`,
        55,
        y - 14
    );
    drawText(
      `Endereço: ${customer.data.Rps.Tomador.Endereco.Endereco}, ${customer.data.Rps.Tomador.Endereco.Numero}`,
      55,
      y - 28
  );
    y -= 48;
    drawLine(50, y, 545, y);
    y -= 10;

    // DEFINIÇÃO DO SERVIÇO
    drawTitleBar("DEFINIÇÃO DO SERVIÇO", 50, y, 495);
    y -= 18;
    drawText(`Item da Lista de Serviços: ${getValue("ns2:ItemListaServico")}`, 55, y);
    drawText(`CNAE: ${getValue("ns2:CodigoCnae")}`, 210, y);
    drawText(`Local da Prestação: ${getValue("ns2:CodigoMunicipio")}-PR`, 370, y);
    y -= 14;
    drawLine(50, y, 545, y);
    y -= 10;


    function breakTextIntoLines(text, maxCharsPerLine) {
      const lines = [];
      for (let i = 0; i < text.length; i += maxCharsPerLine) {
          lines.push(text.substring(i, i + maxCharsPerLine));
      }
      return lines;
  }
  
    // Uso:
    drawTitleBar("DISCRIMINAÇÃO DO SERVIÇO", 50, y, 495);
    y -= 18;
    const descricao = getValue("ns2:Descricao");
    const lines = breakTextIntoLines(descricao, 60); // 60 caracteres por linha
    
    lines.forEach(line => {
        drawText(line, 55, y);
        y -= 14; // Ajuste conforme o espaçamento desejado
    });
    
    drawLine(50, y, 545, y);
    y -= 10;

    // TRIBUTOS
    drawTitleBar("TRIBUTOS INCIDENTES", 50, y, 495);
    y -= 18;
    drawText(`ISSQN: R$ ${getValue("ns2:ValorIss")} | Alíquota: ${getValue("ns2:Aliquota")}%`, 55, y);
    y -= 14;
    drawLine(50, y, 545, y);
    y -= 10;

    // TOTALIZAÇÃO
    drawTitleBar("TOTALIZAÇÃO DO DOCUMENTO FISCAL", 50, y, 495);
    y -= 18;
    drawText(`Base de Cálculo ISSQN: R$ ${getValue("ns2:BaseCalculo")}`, 55, y);
    drawText(`Valor Total: R$ ${getValue("ns2:ValorServicos")}`, 300, y);
    y -= 14;
    drawLine(50, y, 545, y);
    y -= 25;

    // Assinatura
    drawText(`Recebemos de ${getValue("ns2:RazaoSocial")} os serviços constantes nesta NFS-e.`, 50, y);
    drawText("DATA: ___/___/_____    Assinatura: ________________________________", 50, y - 20);

    const pdfBytes = await pdfDoc.save();
    saveAs(new Blob([pdfBytes], { type: "application/pdf" }), `${getValue("ns2:Descricao")}.pdf`);
  }, */

  async Export_Invoice_PDF(customer: any){
    try {
      const response = await fetch(`${API_URL}/invoice/nfsepdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`,
        },
        body: JSON.stringify(customer),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Falha ao gerar PDF');
      }
  
      // Verifica se é um PDF
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/pdf')) {
        const responseData = await response.text();
        console.error('Resposta inesperada:', responseData);
        throw new Error('Resposta não é um PDF válido');
      }
  
      const blob = await response.blob();
      
      // Verificação adicional
      if (blob.size === 0) {
        throw new Error('PDF recebido está vazio');
      }
  
      // Cria URL temporária para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NFSe_${customer.numero || Date.now()}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
  
      // Limpeza
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
  
    } catch (error) {
      console.error('Erro no download:', error);
      throw new Error(`Falha no download: ${error.message}`);
    }
  },
  
  
  async Find_Receipts(){
    const response = await fetch(`${API_URL}/financial/receipts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar recebimentos');
    }

    return response.json();
  },

  async Create_Receive(data: any) {
    const response = await fetch(`${API_URL}/financial/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar recebimento');
    }

    return response.json();
  },

  async Update_Receive(id: string, status: string) {
    const response = await fetch(`${API_URL}/financial/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify({status}),
    });

    if (!response.ok) {
      throw new Error('Falha ao dar baixa no recibo');
    }

    return response.json();
  },

  async Delete_Receive(id: string) {
    const response = await fetch(`${API_URL}/financial/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao dar excluir recibo');
    }

    return response.json();
  },
};
