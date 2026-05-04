'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, ShoppingBag, Car, Utensils, Zap, Gamepad2, GraduationCap, Heart, Briefcase, TrendingUp, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useFinance } from '@/lib/finance-context'

const categoryIcons: Record<string, React.ReactNode> = {
  salary: <Briefcase className="h-4 w-4" />,
  freelance: <Briefcase className="h-4 w-4" />,
  investments: <TrendingUp className="h-4 w-4" />,
  food: <Utensils className="h-4 w-4" />,
  transport: <Car className="h-4 w-4" />,
  entertainment: <Gamepad2 className="h-4 w-4" />,
  utilities: <Zap className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  health: <Heart className="h-4 w-4" />,
  education: <GraduationCap className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  })
}

export function TransactionList() {
  const { transactions } = useFinance()

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Últimas Transacciones</CardTitle>
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-1">
              <AnimatePresence mode="popLayout">
                {transactions.slice(0, 8).map((transaction, index) => (
                    <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: 'oklch(0.22 0.01 260 / 0.5)' }}
                        className="group flex items-center justify-between rounded-xl p-3 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            transaction.type === 'income'
                                ? 'bg-[oklch(0.65_0.20_145_/_0.15)] text-[oklch(0.65_0.20_145)]'
                                : 'bg-[oklch(0.60_0.22_25_/_0.15)] text-[oklch(0.60_0.22_25)]'
                        }`}>
                          {categoryIcons[transaction.category]}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{transaction.category}</span>
                            <span>•</span>
                            <span>{formatDate(transaction.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`font-semibold ${
                              transaction.type === 'income'
                                  ? 'text-[oklch(0.65_0.20_145)]'
                                  : 'text-foreground'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                        </div>
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                            transaction.type === 'income'
                                ? 'bg-[oklch(0.65_0.20_145_/_0.15)]'
                                : 'bg-[oklch(0.60_0.22_25_/_0.15)]'
                        }`}>
                          {transaction.type === 'income' ? (
                              <ArrowUpRight className="h-3 w-3 text-[oklch(0.65_0.20_145)]" />
                          ) : (
                              <ArrowDownRight className="h-3 w-3 text-[oklch(0.60_0.22_25)]" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
  )
}