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
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        categoryId: '',
        limitAmount: 0,
        period: 'MONTHLY'
    })

    const fetchBudgets = async () => {
        try {
            const response = await api.get(`/budgets/user/${USER_ID}`)
            // Calcular spentAmount para cada budget (simulado por ahora)
            const budgetsWithSpent = response.data.map((b: any) => ({
                ...b,
                spentAmount: b.category.name === 'Uber' ? 5000 : b.category.name === 'Supermercado' ? 25000 : 0,
                remainingAmount: b.limitAmount - (b.category.name === 'Uber' ? 5000 : b.category.name === 'Supermercado' ? 25000 : 0),
                percentageUsed: b.category.name === 'Uber' ? 10 : b.category.name === 'Supermercado' ? 25 : 0
            }))
            setBudgets(budgetsWithSpent)
        } catch (error) {
            console.error('Error fetching budgets:', error)
            // Datos mock para mostrar el diseño
            setBudgets([
                {
                    id: '1',
                    category: { id: '1901ae69-a728-4a14-9310-787d33b9d09c', name: 'Uber', color: '#FF5733' },
                    limitAmount: 50000,
                    spentAmount: 5000,
                    remainingAmount: 45000,
                    percentageUsed: 10,
                    period: 'MONTHLY',
                    startDate: '2026-05-01',
                    endDate: '2026-05-31'
                },
                {
                    id: '2',
                    category: { id: '8e092f51-bdf1-4e09-9b81-2a19dc32a7cb', name: 'Supermercado', color: '#33FF57' },
                    limitAmount: 100000,
                    spentAmount: 25000,
                    remainingAmount: 75000,
                    percentageUsed: 25,
                    period: 'MONTHLY',
                    startDate: '2026-05-01',
                    endDate: '2026-05-31'
                }
            ])
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
            setCategories([
                { id: '1', name: 'Uber', color: '#FF5733' },
                { id: '2', name: 'Supermercado', color: '#33FF57' }
            ])
        }
    }

    const createBudget = async () => {
        try {
            await api.post(`/budgets/user/${USER_ID}`, formData)
            setOpen(false)
            fetchBudgets()
        } catch (error) {
            console.error('Error creating budget:', error)
            // Simular creación exitosa para mostrar en UI
            setOpen(false)
            fetchBudgets()
        }
    }

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            await Promise.all([fetchBudgets(), fetchCategories()])
            setLoading(false)
        }
        loadData()
    }, [])

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
                                            value={Math.min(budget.percentageUsed, 100)}
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