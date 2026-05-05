'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Pencil, ArrowUpRight, ArrowDownRight, Filter, Calendar, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import api from '@/lib/api'

const USER_ID = '1de4024a-a90f-4c8e-bbb5-9da9bfd030f7'

interface Category {
    id: string
    name: string
    color: string
}

interface Account {
    id: string
    name: string
    type: string
}

interface Transaction {
    id: string
    amount: number
    description: string
    date: string
    type: 'EXPENSE' | 'INCOME'
    category: Category
    account: Account
    createdAt: string
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

export default function PaymentsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<string>('ALL')
    const [filterCategory, setFilterCategory] = useState<string>('ALL')
    const [formData, setFormData] = useState({
        categoryId: '',
        accountId: '',
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'EXPENSE'
    })

    const fetchTransactions = async () => {
        try {
            const response = await api.get(`/payments/user/${USER_ID}`)
            setTransactions(response.data)
        } catch (error) {
            console.error('Error fetching transactions:', error)
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await api.get(`/categories/user/${USER_ID}`)
            setCategories(response.data)
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const fetchAccounts = async () => {
        try {
            const response = await api.get(`/accounts/user/${USER_ID}`)
            setAccounts(response.data)
        } catch (error) {
            console.error('Error fetching accounts:', error)
        }
    }

    const createTransaction = async () => {
        try {
            await api.post(`/payments/user/${USER_ID}`, formData)
            setOpen(false)
            resetForm()
            fetchTransactions()
            // Actualizar cuentas para reflejar nuevos saldos
            fetchAccounts()
        } catch (error) {
            console.error('Error creating transaction:', error)
        }
    }

    const deleteTransaction = async (id: string) => {
        if (confirm('¿Eliminar esta transacción?')) {
            try {
                await api.delete(`/payments/${id}`)
                fetchTransactions()
                fetchAccounts()
            } catch (error) {
                console.error('Error deleting transaction:', error)
            }
        }
    }

    const resetForm = () => {
        setFormData({
            categoryId: categories[0]?.id || '',
            accountId: accounts[0]?.id || '',
            amount: 0,
            description: '',
            date: new Date().toISOString().split('T')[0],
            type: 'EXPENSE'
        })
    }

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            await Promise.all([
                fetchTransactions(),
                fetchCategories(),
                fetchAccounts()
            ])
            setLoading(false)
        }
        loadData()
    }, [])

    // Filtrar transacciones
    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterType === 'ALL' || t.type === filterType
        const matchesCategory = filterCategory === 'ALL' || t.category.id === filterCategory
        return matchesSearch && matchesType && matchesCategory
    })

    const totalExpenses = filteredTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0)

    const totalIncome = filteredTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0)

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gastos e Ingresos</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona todas tus transacciones financieras
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nueva Transacción
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Nueva Transacción</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <Label>Tipo</Label>
                                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EXPENSE">Gasto</SelectItem>
                                        <SelectItem value="INCOME">Ingreso</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Categoría</Label>
                                <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Cuenta</Label>
                                <Select value={formData.accountId} onValueChange={(v) => setFormData({ ...formData, accountId: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar cuenta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map((a) => (
                                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Monto</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label>Descripción (opcional)</Label>
                                <Input
                                    placeholder="Ej: Compra supermercado"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Fecha</Label>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <Button onClick={createTransaction} className="w-full">
                                Crear Transacción
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Total Gastos</p>
                        <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExpenses)}</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Total Ingresos</p>
                        <p className="text-2xl font-bold text-green-500">{formatCurrency(totalIncome)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <Label>Buscar</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por descripción..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="w-[150px]">
                            <Label>Tipo</Label>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todos</SelectItem>
                                    <SelectItem value="EXPENSE">Gastos</SelectItem>
                                    <SelectItem value="INCOME">Ingresos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-[200px]">
                            <Label>Categoría</Label>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todas</SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="ghost" onClick={() => {
                            setSearchTerm('')
                            setFilterType('ALL')
                            setFilterCategory('ALL')
                        }}>
                            Limpiar filtros
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Transactions List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredTransactions.length === 0 ? (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-12 text-center">
                        <p className="text-muted-foreground">No hay transacciones</p>
                        <p className="text-sm text-muted-foreground">Crea tu primera transacción para empezar</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    <AnimatePresence>
                        {filteredTransactions.map((transaction, index) => (
                            <motion.div
                                key={transaction.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                    transaction.type === 'EXPENSE'
                                                        ? 'bg-red-500/15'
                                                        : 'bg-green-500/15'
                                                }`}>
                                                    {transaction.type === 'EXPENSE' ? (
                                                        <ArrowDownRight className="h-5 w-5 text-red-500" />
                                                    ) : (
                                                        <ArrowUpRight className="h-5 w-5 text-green-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{transaction.description || transaction.category.name}</p>
                                                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                        <span>{transaction.category.name}</span>
                                                        <span>•</span>
                                                        <span>{transaction.account.name}</span>
                                                        <span>•</span>
                                                        <span>{formatDate(transaction.date)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className={`text-lg font-bold ${
                                                    transaction.type === 'EXPENSE' ? 'text-red-500' : 'text-green-500'
                                                }`}>
                                                    {transaction.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(transaction.amount)}
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => deleteTransaction(transaction.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}