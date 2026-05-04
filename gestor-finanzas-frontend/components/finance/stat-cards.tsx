'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useFinance } from '@/lib/finance-context'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  index: number
  accentColor: string
}

function StatCard({ title, value, change, changeType, icon, index, accentColor }: StatCardProps) {
  return (
      <motion.div
          custom={index}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
      >
        <Card className="relative overflow-hidden border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10" style={{ background: accentColor }} />

          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <motion.p
                  className="text-3xl font-bold tracking-tight"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 200 }}
              >
                {value}
              </motion.p>
              {change && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                      changeType === 'positive' ? 'text-[oklch(0.65_0.20_145)]' :
                          changeType === 'negative' ? 'text-[oklch(0.60_0.22_25)]' : 'text-muted-foreground'
                  }`}>
                    {changeType === 'positive' ? (
                        <TrendingUp className="h-4 w-4" />
                    ) : changeType === 'negative' ? (
                        <TrendingDown className="h-4 w-4" />
                    ) : null}
                    {change}
                  </div>
              )}
            </div>
            <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: `${accentColor}20` }}
            >
              <div style={{ color: accentColor }}>{icon}</div>
            </div>
          </div>
        </Card>
      </motion.div>
  )
}

export function StatCards() {
  const { summary, loading } = useFinance()

  if (loading) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <div className="h-20 animate-pulse bg-muted rounded" />
              </Card>
          ))}
        </div>
    )
  }

  const stats = [
    {
      title: 'Balance Total',
      value: formatCurrency(summary.balance),
      icon: <Wallet className="h-6 w-6" />,
      accentColor: 'oklch(0.65 0.20 145)'
    },
    {
      title: 'Ingresos',
      value: formatCurrency(summary.totalIncome),
      change: '+ vs mes anterior',
      changeType: 'positive' as const,
      icon: <TrendingUp className="h-6 w-6" />,
      accentColor: 'oklch(0.65 0.20 145)'
    },
    {
      title: 'Gastos',
      value: formatCurrency(summary.totalExpenses),
      change: '- vs mes anterior',
      changeType: 'negative' as const,
      icon: <TrendingDown className="h-6 w-6" />,
      accentColor: 'oklch(0.60 0.22 25)'
    },
    {
      title: 'Tasa de Ahorro',
      value: `${summary.savingsRate}%`,
      change: 'Objetivo: 30%',
      changeType: 'neutral' as const,
      icon: <PiggyBank className="h-6 w-6" />,
      accentColor: 'oklch(0.55 0.22 280)'
    }
  ]

  return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
            <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>
  )
}