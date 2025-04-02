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

  async find_schedulings(){
    const response = await fetch(`${API_URL}/scheduling/find`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
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
    const response = await fetch(`${API_URL}/pagarme/get-all-subscriptions`, {
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
};
