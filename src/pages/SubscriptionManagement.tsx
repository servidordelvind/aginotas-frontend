import React, { useState, useEffect } from 'react';
import { CircularProgress, Typography} from '@mui/material';
import { api } from '../lib/api';


export function SubscriptionManagement() {

    const [loading, setLoading] = useState(false);

    const [tab, setTab] = useState('');
 
    const [plans, setPlans] = useState([
        {
            _id: '',
            id: '',
            created_at: '',
            statement_descriptor: '',
            trial_period_days: '',
            status: '',
            items: [
                {
                    pricing_scheme:{
                        price: 0,
                    }
                }
            ],
            name: '',
            description: '',
            price: 0,
        }
    ]);
    const [subscriptions, setSubscriptions] = useState([
        {
            _id: '',
            id: '',    
            name: '',
            details: ''
        }
    ]);
    const [error, setError] = useState(null);

    const handleViewEditPlan = useState();

    useEffect(()=>{
        async function loadData() {
            setLoading(true);

            const planos = await api.find_plans();
            setPlans(planos.data);

            setLoading(false);
        }
        loadData();
    },[])

    
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
        <>
        <div className="flex flex-col items-center h-screen p-4">
            <div className="flex space-x-4 mb-6">
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setTab('plans')}
            >
                Planos
            </button>
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setTab('subscriptions')}
            >
                Assinaturas
            </button>
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => alert('Modal em construção!')}
            >
                Criar Plano
            </button>
            </div>
            {tab === 'plans' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {plans.map((plan) => (
                <div
                    key={plan._id}
                    className="p-4 border rounded shadow-md flex flex-col items-start"
                >
                    <p>{plan.id}</p>
                    <Typography variant="h6" className="text-gray-800">
                    {plan.name}
                    </Typography>
                    <Typography className="text-gray-600">
                     {new Date(plan.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                     })}
                    </Typography>
                    <Typography className="text-gray-600">
                    {plan.statement_descriptor}
                    </Typography>
                    <Typography className="text-gray-600">
                    Tempo gratuito {plan.trial_period_days} dias
                    </Typography>
                    <Typography className="text-gray-600">
                    status: {plan.status}
                    </Typography>
                    <Typography className="text-gray-800 font-bold">
                    R$ {plan.items[0].pricing_scheme.price / 100}
                    </Typography>
                    <div className="mt-4 flex space-x-2">
                    <button onClick={()=> handleViewEditPlan()} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                        Editar
                    </button>
{/*                     <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                        Excluir
                    </button> */}
                    </div>
                </div>
                ))}
            </div>
            )}
            {tab === 'subscriptions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {subscriptions.map((subscription) => (
                <div
                    key={subscription._id}
                    className="p-4 border rounded shadow-md flex flex-col items-start"
                >
                    <Typography variant="h6" className="text-gray-800">
                    {subscription.name}
                    </Typography>
                    <Typography className="text-gray-600">
                    {subscription.details}
                    </Typography>
                    <div className="mt-4 flex space-x-2">
                    <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                        Editar
                    </button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                        Excluir
                    </button>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </>
    );

}