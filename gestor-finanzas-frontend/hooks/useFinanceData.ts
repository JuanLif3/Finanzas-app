'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

// ID fijo del usuario (por ahora, después lo cambiaremos con login)
const USER_ID = '1de4024a-a90f-4c8e-bbb5-9da9bfd030f7';

export interface CategoryExpense {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    totalAmount: number;
    percentage: number;
}

export interface MonthlyEvolution {
    month: string;
    year: number;
    totalExpenses: number;
    totalIncome: number;
    balance: number;
}

export interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string;
    type: 'EXPENSE' | 'INCOME';
    category: {
        id: string;
        name: string;
        color: string;
    };
    account: {
        id: string;
        name: string;
        type: string;
    };
}

export interface SavingGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    remainingAmount: number;
    percentageCompleted: number;
    status: string;
}

export interface DashboardData {
    totalExpensesThisMonth: number;
    totalIncomeThisMonth: number;
    balanceThisMonth: number;
    totalSaved: number;
    topExpensesByCategory: CategoryExpense[];
    monthlyEvolution: MonthlyEvolution[];
}

export function useFinanceData() {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<SavingGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = async () => {
        try {
            const response = await api.get(`/dashboard/user/${USER_ID}`);
            setDashboard(response.data);
        } catch (err: any) {
            console.error('Error fetching dashboard:', err);
            setError(err.response?.data?.message || 'Error al cargar dashboard');
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await api.get(`/payments/user/${USER_ID}`);
            setTransactions(response.data);
        } catch (err: any) {
            console.error('Error fetching transactions:', err);
        }
    };

    const fetchGoals = async () => {
        try {
            const response = await api.get(`/saving-goals/user/${USER_ID}`);
            setGoals(response.data);
        } catch (err: any) {
            console.error('Error fetching goals:', err);
        }
    };

    const fetchAll = async () => {
        setLoading(true);
        await Promise.all([fetchDashboard(), fetchTransactions(), fetchGoals()]);
        setLoading(false);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    return {
        dashboard,
        transactions,
        goals,
        loading,
        error,
        refetch: fetchAll,
    };
}