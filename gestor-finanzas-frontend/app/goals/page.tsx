'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, PiggyBank, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import api from '@/lib/api'

const USER_ID = '1de4024a-a90f-4c8e-bbb5-9da9bfd030f7'

interface Account {
    id: string
    name: string
    type: string
    balance: number
}

interface SavingGoal {
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    remainingAmount: number
    percentageCompleted: number
    deadline: string | null
    account: Account
    status: string
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

function formatDate(dateString: string | null) {
    if (!dateString) return 'Sin fecha límite'
    return new Date(dateString).toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

export default function GoalsPage() {
    const [goals, setGoals] = useState<SavingGoal[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [addOpen, setAddOpen] = useState(false)
    const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        targetAmount: 0,
        deadline: '',
        accountId: ''
    })
    const [addFormData, setAddFormData] = useState({
        amount: 0,
        fromAccountId: ''
    })

    const fetchGoals = async () => {
        try {
            const response = await api.get(`/saving-goals/user/${USER_ID}`)
            setGoals(response.data)
        } catch (error) {
            console.error('Error fetching goals:', error)
            // Datos mock para mostrar el diseño
            setGoals([
                {
                    id: '1',
                    name: 'Vacaciones',
                    targetAmount: 200000,
                    currentAmount: 50000,
                    remainingAmount: 150000,
                    percentageCompleted: 25,
                    deadline: null,
                    account: { id: '1', name: 'Ahorros Copec Pay', type: 'CASH', balance: 50000 },
                    status: 'IN_PROGRESS'
                }
            ])
        } finally {
            setLoading(false)
        }
    }

    const fetchAccounts = async () => {
        try {
            const response = await api.get(`/accounts/user/${USER_ID}`)
            setAccounts(response.data)
        } catch (error) {
            console.error('Error fetching accounts:', error)
            setAccounts([
                { id: '1', name: 'Mi Cuenta Falabella', type: 'DEBIT', balance: 95000 },
                { id: '2', name: 'Ahorros Copec Pay', type: 'CASH', balance: 50000 }
            ])
        }
    }

    const createGoal = async () => {
        try {
            await api.post(`/saving-goals/user/${USER_ID}`, formData)
            setOpen(false)
            resetForm()
            fetchGoals()
        } catch (error) {
            console.error('Error creating goal:', error)
            setOpen(false)
            fetchGoals()
        }
    }

    const addToGoal = async () => {
        if (!selectedGoal) return
        try {
            await api.post(`/saving-goals/${selectedGoal.id}/user/${USER_ID}/add`, addFormData)
            setAddOpen(false)
            setSelectedGoal(null)
            resetAddForm()
            fetchGoals()
            fetchAccounts()
        } catch (error) {
            console.error('Error adding to goal:', error)
            setAddOpen(false)
            fetchGoals()
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            targetAmount: 0,
            deadline: '',
            accountId: accounts[0]?.id || ''
        })
    }

    const resetAddForm = () => {
        setAddFormData({
            amount: 0,
            fromAccountId: accounts.find(a => a.type === 'DEBIT')?.id || ''
        })
    }

    const openAddDialog = (goal: SavingGoal) => {
        setSelectedGoal(goal)
        setAddFormData({
            amount: 0,
            fromAccountId: accounts.find(a => a.type === 'DEBIT')?.id || ''
        })
        setAddOpen(true)
    }

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            await Promise.all([fetchGoals(), fetchAccounts()])
            setLoading(false)
        }
        loadData()
    }, [])

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Metas de Ahorro</h1>
                    <p className="text-muted-foreground mt-1">
                        Alcanza tus objetivos financieros
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nueva Meta
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Nueva Meta de Ahorro</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <Label>Nombre de la meta</Label>
                                <Input
                                    placeholder="Ej: Vacaciones, Coche nuevo, Casa"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Monto objetivo</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={formData.targetAmount}
                                    onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label>Cuenta de ahorro</Label>
                                <Select value={formData.accountId} onValueChange={(v) => setFormData({ ...formData, accountId: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar cuenta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.filter(a => a.type === 'CASH').map((a) => (
                                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Fecha límite (opcional)</Label>
                                <Input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                            <Button onClick={createGoal} className="w-full">
                                Crear Meta
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Goals Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : goals.length === 0 ? (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-12 text-center">
                        <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No hay metas de ahorro</p>
                        <p className="text-sm text-muted-foreground">Crea tu primera meta para empezar a ahorrar</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-5 md:grid-cols-2">
                    <AnimatePresence>
                        {goals.map((goal, index) => (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                                                    <Target className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                                                    <p className="text-xs text-muted-foreground">
                                                        Cuenta: {goal.account.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-500">
                        En progreso
                      </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-muted-foreground">Progreso</span>
                                            <span className="font-medium text-primary">
                        {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                      </span>
                                        </div>
                                        <Progress value={goal.percentageCompleted} className="h-3" />
                                        <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {goal.percentageCompleted}% completado
                      </span>
                                            <span className="text-muted-foreground">
                        Restante: {formatCurrency(goal.remainingAmount)}
                      </span>
                                        </div>
                                        <div className="flex items-center justify-between pt-3">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <TrendingUp className="h-3 w-3" />
                                                <span>Fecha límite: {formatDate(goal.deadline)}</span>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => openAddDialog(goal)}
                                                className="gap-1"
                                            >
                                                <Plus className="h-3 w-3" />
                                                Abonar
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Add to Goal Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Abonar a {selectedGoal?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <Label>Monto a abonar</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={addFormData.amount}
                                onChange={(e) => setAddFormData({ ...addFormData, amount: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <Label>¿De qué cuenta?</Label>
                            <Select
                                value={addFormData.fromAccountId}
                                onValueChange={(v) => setAddFormData({ ...addFormData, fromAccountId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.filter(a => a.type === 'DEBIT').map((a) => (
                                        <SelectItem key={a.id} value={a.id}>
                                            {a.name} - {formatCurrency(a.balance)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={addToGoal} className="w-full">
                            Abonar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}