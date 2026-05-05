'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import api from '@/lib/api'
import { useRefresh } from '@/hooks/useRefresh'

const USER_ID = '1de4024a-a90f-4c8e-bbb5-9da9bfd030f7'

interface Category {
    id: string
    name: string
    color: string
}

interface Budget {
    id: string
    category: Category
    limitAmount: number
    period: string
    startDate: string
    endDate: string
}

interface BudgetWithSpent {
    id: string
    category: Category
    limitAmount: number
    spentAmount: number
    remainingAmount: number
    percentageUsed: number
    period: string
    startDate: string
    endDate: string
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

function getAlertColor(percentage: number) {
    if (percentage >= 100) return 'text-red-500'
    if (percentage >= 80) return 'text-yellow-500'
    return 'text-green-500'
}

function getProgressColor(percentage: number) {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
}

export default function BudgetsPage() {
    const { refreshBudgets } = useRefresh()
    const [budgets, setBudgets] = useState<BudgetWithSpent[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        categoryId: '',
        limitAmount: 0,
        period: 'MONTHLY'
    })

    // Función para calcular el gasto real de una categoría en un período
    const calculateSpentForBudget = async (budget: Budget): Promise<number> => {
        try {
            // Obtener todas las transacciones del usuario
            const response = await api.get(`/payments/user/${USER_ID}`)
            const transactions = response.data

            // Filtrar transacciones de la categoría y tipo gasto
            const categoryTransactions = transactions.filter((t: any) =>
                t.type === 'EXPENSE' &&
                t.category.id === budget.category.id
            )

            // Sumar los montos
            const totalSpent = categoryTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)
            return totalSpent
        } catch (error) {
            console.error('Error calculating spent:', error)
            return 0
        }
    }

    const fetchBudgets = async () => {
        try {
            setLoading(true)
            // Obtener presupuestos
            const response = await api.get(`/budgets/user/${USER_ID}`)
            const budgetsData = response.data

            // Para cada presupuesto, calcular el gasto real
            const budgetsWithSpent: BudgetWithSpent[] = await Promise.all(
                budgetsData.map(async (budget: Budget) => {
                    const spentAmount = await calculateSpentForBudget(budget)
                    const remainingAmount = budget.limitAmount - spentAmount
                    const percentageUsed = budget.limitAmount > 0
                        ? Math.min(Math.round((spentAmount / budget.limitAmount) * 100), 100)
                        : 0

                    return {
                        ...budget,
                        spentAmount,
                        remainingAmount: remainingAmount > 0 ? remainingAmount : 0,
                        percentageUsed
                    }
                })
            )

            setBudgets(budgetsWithSpent)
        } catch (error) {
            console.error('Error fetching budgets:', error)
            setBudgets([])
        } finally {
            setLoading(false)
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

    const createBudget = async () => {
        try {
            await api.post(`/budgets/user/${USER_ID}`, formData)
            setOpen(false)
            resetForm()
            await fetchBudgets()
        } catch (error) {
            console.error('Error creating budget:', error)
            alert('Error al crear presupuesto')
        }
    }

    const resetForm = () => {
        setFormData({
            categoryId: categories[0]?.id || '',
            limitAmount: 0,
            period: 'MONTHLY'
        })
    }

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchBudgets(), fetchCategories()])
        }
        loadData()
    }, [])

    // Efecto para recargar cuando refreshBudgets cambie (desde gastos)
    useEffect(() => {
        if (!loading) {
            fetchBudgets()
        }
    }, [refreshBudgets])

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Presupuestos</h1>
                    <p className="text-muted-foreground mt-1">
                        Controla tus límites de gasto por categoría
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nuevo Presupuesto
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Nuevo Presupuesto</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
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
                                <Label>Monto límite</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={formData.limitAmount}
                                    onChange={(e) => setFormData({ ...formData, limitAmount: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label>Período</Label>
                                <Select value={formData.period} onValueChange={(v) => setFormData({ ...formData, period: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DAILY">Diario</SelectItem>
                                        <SelectItem value="WEEKLY">Semanal</SelectItem>
                                        <SelectItem value="MONTHLY">Mensual</SelectItem>
                                        <SelectItem value="YEARLY">Anual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={createBudget} className="w-full">
                                Crear Presupuesto
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Budgets Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : budgets.length === 0 ? (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-12 text-center">
                        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No hay presupuestos creados</p>
                        <p className="text-sm text-muted-foreground">Crea tu primer presupuesto para controlar tus gastos</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-5 md:grid-cols-2">
                    <AnimatePresence>
                        {budgets.map((budget, index) => (
                            <motion.div
                                key={budget.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                                    <div
                                        className="h-2"
                                        style={{ backgroundColor: budget.category.color }}
                                    />
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: `${budget.category.color}20` }}
                                                >
                                                    <Target className="h-5 w-5" style={{ color: budget.category.color }} />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{budget.category.name}</CardTitle>
                                                    <p className="text-xs text-muted-foreground">
                                                        {budget.period === 'MONTHLY' && 'Mensual'}
                                                        {budget.period === 'WEEKLY' && 'Semanal'}
                                                        {budget.period === 'DAILY' && 'Diario'}
                                                        {budget.period === 'YEARLY' && 'Anual'}
                                                    </p>
                                                </div>
                                            </div>
                                            {budget.percentageUsed >= 80 && (
                                                <AlertCircle className={`h-5 w-5 ${budget.percentageUsed >= 100 ? 'text-red-500' : 'text-yellow-500'}`} />
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Gastado</span>
                                            <span className={`font-medium ${getAlertColor(budget.percentageUsed)}`}>
                        {formatCurrency(budget.spentAmount)} de {formatCurrency(budget.limitAmount)}
                      </span>
                                        </div>
                                        <Progress
                                            value={budget.percentageUsed}
                                            className="h-2"
                                            style={{
                                                '--progress-background': getProgressColor(budget.percentageUsed)
                                            } as React.CSSProperties}
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground pt-2">
                                            <span>{budget.percentageUsed}% usado</span>
                                            <span>Restante: {formatCurrency(budget.remainingAmount)}</span>
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