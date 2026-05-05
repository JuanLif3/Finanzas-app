'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CreditCard, Banknote, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import api from '@/lib/api'

const USER_ID = '1de4024a-a90f-4c8e-bbb5-9da9bfd030f7'

interface Account {
    id: string
    name: string
    type: 'DEBIT' | 'CREDIT' | 'CASH'
    bank: string
    balance: number
    creditLimit?: number
    currentDebt?: number
    billingDay?: number
    paymentDueDay?: number
}

const bankOptions = ['FALABELLA', 'SANTANDER', 'CHILE', 'ESTADO', 'BCI', 'BBVA', 'COPEC_PAY', 'MACH', 'TENPO', 'OTRO']
const typeOptions = ['DEBIT', 'CREDIT', 'CASH']

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

function getTypeIcon(type: string) {
    switch (type) {
        case 'DEBIT':
            return <CreditCard className="h-5 w-5 text-blue-500" />
        case 'CREDIT':
            return <CreditCard className="h-5 w-5 text-purple-500" />
        case 'CASH':
            return <Banknote className="h-5 w-5 text-green-500" />
        default:
            return <CreditCard className="h-5 w-5" />
    }
}

function getTypeColor(type: string) {
    switch (type) {
        case 'DEBIT':
            return 'bg-blue-500/10 border-blue-500/20'
        case 'CREDIT':
            return 'bg-purple-500/10 border-purple-500/20'
        case 'CASH':
            return 'bg-green-500/10 border-green-500/20'
        default:
            return 'bg-gray-500/10'
    }
}

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        type: 'DEBIT',
        bank: 'FALABELLA',
        balance: 0,
        creditLimit: 0,
        billingDay: 0,
        paymentDueDay: 0
    })

    const fetchAccounts = async () => {
        try {
            const response = await api.get(`/accounts/user/${USER_ID}`)
            setAccounts(response.data)
        } catch (error) {
            console.error('Error fetching accounts:', error)
        } finally {
            setLoading(false)
        }
    }

    const createAccount = async () => {
        try {
            const payload: any = {
                name: formData.name,
                type: formData.type,
                bank: formData.bank,
                balance: formData.balance
            }

            if (formData.type === 'CREDIT') {
                payload.creditLimit = formData.creditLimit
                payload.billingDay = formData.billingDay
                payload.paymentDueDay = formData.paymentDueDay
            }

            await api.post(`/accounts/user/${USER_ID}`, payload)
            setOpen(false)
            fetchAccounts()
            resetForm()
        } catch (error) {
            console.error('Error creating account:', error)
        }
    }

    const deleteAccount = async (id: string) => {
        if (confirm('¿Eliminar esta cuenta?')) {
            try {
                await api.delete(`/accounts/${id}`)
                fetchAccounts()
            } catch (error) {
                console.error('Error deleting account:', error)
            }
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'DEBIT',
            bank: 'FALABELLA',
            balance: 0,
            creditLimit: 0,
            billingDay: 0,
            paymentDueDay: 0
        })
    }

    useEffect(() => {
        fetchAccounts()
    }, [])

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cuentas Bancarias</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona tus cuentas de débito, crédito y efectivo
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nueva Cuenta
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Nueva Cuenta</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <Label>Nombre de la cuenta</Label>
                                <Input
                                    placeholder="Ej: Mi Cuenta Falabella"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Tipo de cuenta</Label>
                                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as any })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {typeOptions.map((t) => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Banco</Label>
                                <Select value={formData.bank} onValueChange={(v) => setFormData({ ...formData, bank: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bankOptions.map((b) => (
                                            <SelectItem key={b} value={b}>{b}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Saldo inicial</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={formData.balance}
                                    onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                                />
                            </div>
                            {formData.type === 'CREDIT' && (
                                <>
                                    <div>
                                        <Label>Límite de crédito</Label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={formData.creditLimit}
                                            onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Día de facturación</Label>
                                        <Input
                                            type="number"
                                            placeholder="24"
                                            value={formData.billingDay}
                                            onChange={(e) => setFormData({ ...formData, billingDay: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Día límite de pago</Label>
                                        <Input
                                            type="number"
                                            placeholder="10"
                                            value={formData.paymentDueDay}
                                            onChange={(e) => setFormData({ ...formData, paymentDueDay: Number(e.target.value) })}
                                        />
                                    </div>
                                </>
                            )}
                            <Button onClick={createAccount} className="w-full">
                                Crear Cuenta
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Accounts Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                        {accounts.map((account, index) => (
                            <motion.div
                                key={account.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className={`border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 ${getTypeColor(account.type)}`}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {getTypeIcon(account.type)}
                                                <div>
                                                    <CardTitle className="text-lg">{account.name}</CardTitle>
                                                    <p className="text-xs text-muted-foreground">{account.bank}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => deleteAccount(account.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {account.type === 'DEBIT' && 'Cuenta de Débito'}
                                                {account.type === 'CREDIT' && `Crédito: ${formatCurrency(account.creditLimit || 0)} • Deuda: ${formatCurrency(account.currentDebt || 0)}`}
                                                {account.type === 'CASH' && 'Efectivo'}
                                            </p>
                                            {account.type === 'CREDIT' && account.billingDay && (
                                                <p className="text-xs text-muted-foreground">
                                                    Factura: día {account.billingDay} • Pago: día {account.paymentDueDay}
                                                </p>
                                            )}
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