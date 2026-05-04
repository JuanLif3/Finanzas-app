// Datos de ejemplo para mantener el diseño visual
export const mockStats = {
  balance: 95000,
  totalIncome: 0,
  totalExpenses: 30000,
  savingsRate: 0,
};

export const mockTransactions = [
  {
    id: '1',
    amount: 25000,
    description: 'Compra supermercado',
    date: '2026-05-03',
    type: 'expense',
    category: 'food'
  },
  {
    id: '2',
    amount: 5000,
    description: 'Viaje al centro',
    date: '2026-05-03',
    type: 'expense',
    category: 'transport'
  },
];

export const mockGoals = [
  {
    id: '1',
    name: 'Vacaciones',
    current: 50000,
    target: 200000,
    color: 'oklch(0.75 0.18 80)',
    icon: 'Plane'
  },
  {
    id: '2',
    name: 'Fondo de emergencia',
    current: 0,
    target: 100000,
    color: 'oklch(0.65 0.20 145)',
    icon: 'Target'
  },
];

export const mockCategories = [
  { name: 'Alimentación', amount: 25000, color: '#33FF57', percentage: 83 },
  { name: 'Transporte', amount: 5000, color: '#FF5733', percentage: 17 },
];

export const mockEvolution = [
  { month: '2026-05', year: 2026, totalExpenses: 30000, totalIncome: 0, balance: -30000 },
];