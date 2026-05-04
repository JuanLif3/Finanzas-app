'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from './api';

const USER_ID = '1de4024a-a90f-4c8e-bbb5-9da9bfd030f7';

interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string;
    type: 'income' | 'expense';
    category: string;
}

interface Summary {
    balance: number;
    totalIncome: number;
    totalExpenses: number;
    savingsRate: number;
}

interface Goal {
    id: string;
    name: string;
    current: number;
    target: number;
    color: string;
    icon: string;
}

interface FinanceContextType {
    transactions: Transaction[];
    summary: Summary;
    goals: Goal[];
    loading: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

function mapCategoryName(categoryName: string): string {
    const mapping: Record<string, string> = {
        'Uber': 'transport',
        'Supermercado': 'food',
        'Alimentación': 'food',
        'Transporte': 'transport',
    };
    return mapping[categoryName] || 'other';
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<Summary>({
        balance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        savingsRate: 0,
    });
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Cargar dashboard
                const dashboardRes = await api.get(`/dashboard/user/${USER_ID}`);
                const dashboard = dashboardRes.data;

                // Cargar transacciones
                const transactionsRes = await api.get(`/payments/user/${USER_ID}`);
                const apiTransactions = transactionsRes.data;

                // Formatear transacciones
                const formattedTransactions: Transaction[] = apiTransactions.map((t: any) => ({
                    id: t.id,
                    amount: Math.abs(t.amount),
                    description: t.description || t.category.name,
                    date: new Date(t.date).toISOString().split('T')[0],
                    type: t.type === 'EXPENSE' ? 'expense' : 'income',
                    category: mapCategoryName(t.category.name),
                }));

                // Cargar metas
                const goalsRes = await api.get(`/saving-goals/user/${USER_ID}`);
                const apiGoals = goalsRes.data;

                const goalIcons: Record<string, string> = {
                    'Vacaciones': 'Plane',
                    'Coche nuevo': 'Car',
                    'Fondo de emergencia': 'Target',
                    'Entrada piso': 'Home',
                };

                const goalColors: Record<string, string> = {
                    'Vacaciones': 'oklch(0.75 0.18 80)',
                    'Coche nuevo': 'oklch(0.55 0.22 280)',
                    'Fondo de emergencia': 'oklch(0.65 0.20 145)',
                    'Entrada piso': 'oklch(0.60 0.18 200)',
                };

                const formattedGoals: Goal[] = apiGoals.map((g: any) => ({
                    id: g.id,
                    name: g.name,
                    current: g.currentAmount,
                    target: g.targetAmount,
                    color: goalColors[g.name] || 'oklch(0.65 0.20 145)',
                    icon: goalIcons[g.name] || 'Target',
                }));

                setTransactions(formattedTransactions);
                setGoals(formattedGoals);
                setSummary({
                    balance: dashboard.balanceThisMonth,
                    totalIncome: dashboard.totalIncomeThisMonth,
                    totalExpenses: dashboard.totalExpensesThisMonth,
                    savingsRate: dashboard.totalIncomeThisMonth > 0
                        ? Math.round((dashboard.balanceThisMonth / dashboard.totalIncomeThisMonth) * 100)
                        : 0,
                });
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <FinanceContext.Provider
            value={{
                transactions,
                summary,
                goals,
                loading,
            }}
        >
            {children}
        </FinanceContext.Provider>
    );
}

export function useFinance() {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
}