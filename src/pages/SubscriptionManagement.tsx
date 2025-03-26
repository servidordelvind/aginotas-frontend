import React, { useState, useEffect } from 'react';
import { CircularProgress, Typography, TextField, Select, MenuItem, Button } from '@mui/material';

interface User {
    id: number;
    name: string;
    email: string;
    subscriptionValue: number;
    planId: number;
}

interface Plan {
    id: number;
    name: string;
    price: number;
}

interface Promotion {
    id: number;
    name: string;
    discount: number;
    eligiblePlans: number[];
}

export function SubscriptionManagement() {
    const [defaultSubscriptionValue, setDefaultSubscriptionValue] = useState(0);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newUserSubscriptionValue, setNewUserSubscriptionValue] = useState(0);
    const [selectedItem, setSelectedItem] = useState('settings');
    const [plans] = useState<Plan[]>([
        { id: 1, name: 'Plano Básico', price: 29.90 },
        { id: 2, name: 'Plano Profissional', price: 49.90 },
        { id: 3, name: 'Plano Premium', price: 99.90 },
    ]);
    
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [newDefaultPlanValue, setNewDefaultPlanValue] = useState(0);
    // const [promotions, setPromotions] = useState<Promotion[]>([]);
   
    const [subscriptionChangeMonth, setSubscriptionChangeMonth] = useState<number>(new Date().getMonth() + 1);
    const [promotions, setPromotions] = useState<Promotion[]>([
        { id: 1, name: 'Promoção de Verão', discount: 20, eligiblePlans: [1, 2] }, // Promoção fake
    ]);
    const [newPromotion, setNewPromotion] = useState({
        name: '',
        discount: 0,
        eligiblePlans: [] as number[],
    });



    useEffect(() => {
        // Simulação de dados fake
        const fakeData = {
            defaultValue: 50,
            users: [
                { id: 1, name: 'João Silva', email: 'joao@example.com', subscriptionValue: 50, planId: 1 },
                { id: 2, name: 'Maria Oliveira', email: 'maria@example.com', subscriptionValue: 75, planId: 2 },
                { id: 3, name: 'Carlos Souza', email: 'carlos@example.com', subscriptionValue: 100, planId: 3 },
            ],
        };


        setTimeout(() => {
            setDefaultSubscriptionValue(fakeData.defaultValue);
            setUsers(fakeData.users);
            setLoading(false);
        }, 1000);

        // Chamada de API comentada
        /*
        fetch('/api/subscriptions')
          .then((response) => {
            if (!response.ok) {
              throw new Error('Erro ao buscar dados de assinaturas');
            }
            return response.json();
          })
          .then((data) => {
            setDefaultSubscriptionValue(data.defaultValue);
            setUsers(data.users);
            setLoading(false);
          })
          .catch((err) => {
            setError(err.message);
            setLoading(false);
          });
        */
    }, []);

    const handleUpdateDefaultValue = () => {
        if (!selectedPlan) return;
        // Simulação: atualiza o valor padrão do plano selecionado
        alert(`Valor padrão do plano "${selectedPlan.name}" atualizado para ${newDefaultPlanValue}! (Simulado)`);

        // Chamada de API comentada
        /*
        fetch('/api/subscriptions/default', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ defaultValue: defaultSubscriptionValue }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Erro ao atualizar valor padrão');
            }
            alert('Valor padrão atualizado com sucesso!');
          })
          .catch((err) => {
            setError(err.message);
          });
        */

    };

   


   

    

    const handleCreatePromotion = () => {
        // ... (lógica de criação de promoção)
        // Chamada de API comentada
        /*
        fetch('/api/promotions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPromotion),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Erro ao criar promoção');
            }
            alert('Promoção criada com sucesso!');
            // Atualizar a lista de promoções
          })
          .catch((err) => {
            setError(err.message);
          });
        */
        const newPromo = {
            id: promotions.length + 1, // Simulação de ID
            name: newPromotion.name,
            discount: newPromotion.discount,
            eligiblePlans: newPromotion.eligiblePlans,
        };
        setPromotions([...promotions, newPromo]);
        alert('Promoção criada com sucesso! (Simulado)');
    };
   


    const handleDeletePromotion = (id: number) => {
        setPromotions(promotions.filter(promo => promo.id !== id));
    };



    const handleUpdateSubscriptionValue = () => {
        if (!selectedUser) return;
        alert('Funcionalidade de alterar o valor da assinatura de usuários já existentes. (Simulado)');
    };

   

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return <p className="text-red-500">Erro: {error}</p>;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-indigo-700 text-white py-4 shadow-md">
                <nav className="flex justify-center items-center">
                    <ul className="flex space-x-6">
                        
                        <li>
                            <button className={`px-4 py-2 hover:bg-indigo-600 rounded transition-colors duration-300 ${selectedItem === 'promotions' ? 'bg-indigo-600' : ''}`} onClick={() => setSelectedItem('promotions')}>Promoções</button>
                        </li>
                        
                        <li>
                            <button className={`px-4 py-2 hover:bg-indigo-600 rounded transition-colors duration-300 ${selectedItem === 'settings' ? 'bg-indigo-600' : ''}`} onClick={() => setSelectedItem('settings')}>Configurações</button>
                        </li>
                    </ul>
                </nav>
            </header>

            <main className="flex-1 p-10 space-y-8">
               
                {selectedItem === 'promotions' && <h1 className="text-3xl font-semibold mb-6 text-gray-900">Gerenciar Promoções</h1>}
                
                {selectedItem === 'settings' && <h1 className="text-3xl font-semibold mb-6 text-gray-900">Configurações dos Planos</h1>}

               

                {selectedItem === 'promotions' && (
                    <div className="p-8 space-y-8">
                        <div className="p-8 bg-white rounded-lg shadow-md">
                            <Typography variant="h6" className="mb-4 text-gray-900">Criar Nova Promoção</Typography>
                            <TextField label="Nome da Promoção" value={newPromotion.name} onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })} fullWidth margin="normal" className="mb-4 border border-gray-300 focus:ring-indigo-500" />
                            <TextField label="Desconto (%)" type="number" value={newPromotion.discount} onChange={(e) => setNewPromotion({ ...newPromotion, discount: Number(e.target.value) })} fullWidth margin="normal" className="mb-4 border border-gray-300 focus:ring-indigo-500" />
                            <Select
                                multiple
                                value={newPromotion.eligiblePlans}
                                onChange={(e) => {
                                    const selectedValues = e.target.value;
                                    // Garante que selectedValues é um array de números
                                    const numericValues = Array.isArray(selectedValues) ? selectedValues.map(Number) : [];
                                    setNewPromotion({ ...newPromotion, eligiblePlans: numericValues });
                                }}
                                fullWidth
                                className="mb-4 border border-gray-300 focus:ring-indigo-500"
                            >
                                {plans.map((plan) => (
                                    <MenuItem key={plan.id} value={plan.id}>
                                        {plan.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            <Button variant="contained" onClick={handleCreatePromotion} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Criar Promoção</Button>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-lg shadow-md">
                            <Typography variant="h6" className="mb-4 text-gray-900">Promoções Existentes</Typography>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {promotions.map(promo => (
                                    <div key={promo.id} className="bg-white rounded-lg p-6 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Typography variant="subtitle1" className="font-semibold text-gray-900">{promo.name}</Typography>
                                                <Typography variant="body2" className="text-gray-700">{promo.discount}% de desconto</Typography>
                                                <Typography variant="caption" className="text-gray-500">
                                                    Planos: {promo.eligiblePlans.map(planId => {
                                                        const plan = plans.find(p => p.id === planId);
                                                        return plan ? plan.name : '';
                                                    }).join(', ')}
                                                </Typography>
                                            </div>
                                            <Button variant="outlined" color="error" size="small" onClick={() => handleDeletePromotion(promo.id)} className="transition-colors duration-300">
                                                Excluir
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
               

                {selectedItem === 'settings' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <Typography variant="h6" className="mb-4 text-gray-900">Alterar Valor Padrão da Assinatura</Typography>
                            <Select value={selectedPlan?.id || ''} onChange={(e) => setSelectedPlan(plans.find(plan => plan.id === Number(e.target.value)) || null)} displayEmpty fullWidth className="mb-4 border border-gray-300 focus:ring-indigo-500">
                                <MenuItem value="">Selecione um plano</MenuItem>
                                {plans.map((plan) => (<MenuItem key={plan.id} value={plan.id}>{plan.name}</MenuItem>))}
                            </Select>
                            {selectedPlan && (
                                <>
                                    <TextField label="Novo Valor Padrão" type="number" value={newDefaultPlanValue} onChange={(e) => setNewDefaultPlanValue(Number(e.target.value))} fullWidth margin="normal" className="border border-gray-300 focus:ring-indigo-500" />
                                    <Button variant="contained" onClick={handleUpdateDefaultValue} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Atualizar Valor Padrão</Button>
                                </>
                            )}
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-8">
                            <Typography variant="h6" className="mb-4 text-gray-900">Alterar Valor da Assinatura de Usuário Existente</Typography>
                            <Select value={selectedUser?.id || ''} onChange={(e) => setSelectedUser(users.find(user => user.id === Number(e.target.value)) || null)} displayEmpty fullWidth className="mb-4 border border-gray-300 focus:ring-indigo-500">
                                <MenuItem value="">Selecione um usuário</MenuItem>
                                {users.map((user) => (<MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>))}
                            </Select>
                            {selectedUser && (
                                <>
                                    <TextField label="Novo Valor da Assinatura" type="number" value={newUserSubscriptionValue} onChange={(e) => setNewUserSubscriptionValue(Number(e.target.value))} fullWidth margin="normal" className="border border-gray-300 focus:ring-indigo-500" />
                                    <Select value={subscriptionChangeMonth} onChange={(e) => setSubscriptionChangeMonth(Number(e.target.value))} fullWidth className="mb-4 border border-gray-300 focus:ring-indigo-500">
                                        <MenuItem value={1}>Janeiro</MenuItem>
                                        <MenuItem value={2}>Fevereiro</MenuItem>
                                        <MenuItem value={3}>Março</MenuItem>
                                        <MenuItem value={4}>Abril</MenuItem>
                                        <MenuItem value={5}>Maio</MenuItem>
                                        <MenuItem value={6}>Junho</MenuItem>
                                        <MenuItem value={7}>Julho</MenuItem> <MenuItem value={8}>Agosto</MenuItem>
                                        <MenuItem value={9}>Setembro</MenuItem>
                                        <MenuItem value={10}>Outubro</MenuItem>
                                        <MenuItem value={11}>Novembro</MenuItem>
                                        <MenuItem value={12}>Dezembro</MenuItem>
                                    </Select>
                                    <Button variant="contained" onClick={handleUpdateSubscriptionValue} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Atualizar Assinatura do Usuário</Button>
                                </>
                            )}
                        </div>

                       
                    </div>
                )}
            </main>
        </div>
    );

}