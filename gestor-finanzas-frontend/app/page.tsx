'use client'

import { motion } from 'framer-motion'
import { FinanceProvider } from '@/lib/finance-context'
import { Header } from '@/components/finance/header'
import { StatCards } from '@/components/finance/stat-cards'
import { BalanceChart } from '@/components/finance/balance-chart'
import { CategoryChart } from '@/components/finance/category-chart'
import { TransactionList } from '@/components/finance/transaction-list'
import { AddTransaction } from '@/components/finance/add-transaction'
import { GoalsCard } from '@/components/finance/goals-card'
import { QuickActions } from '@/components/finance/quick-actions'
import { ScrollReveal } from '@/components/finance/scroll-reveal'

export default function FinanceDashboard() {
  return (
    <FinanceProvider>
      <div className="min-h-screen bg-background">
        {/* Background gradient effect */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute -right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]"
          />
        </div>

        <Header />

        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Buenos días, <span className="text-primary">Juan</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Aquí tienes un resumen de tus finanzas personales
            </p>
          </motion.div>

          {/* Stats Section */}
          <section className="mb-8">
            <StatCards />
          </section>

          {/* Quick Actions */}
          <ScrollReveal delay={0.1}>
            <section className="mb-8">
              <QuickActions />
            </section>
          </ScrollReveal>

          {/* Charts Section */}
          <ScrollReveal delay={0.2}>
            <section className="mb-8 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <BalanceChart />
              </div>
              <div>
                <CategoryChart />
              </div>
            </section>
          </ScrollReveal>

          {/* Main Content Grid */}
          <ScrollReveal delay={0.3}>
            <section className="grid gap-6 lg:grid-cols-3">
              {/* Transactions - Takes 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                <AddTransaction />
                <TransactionList />
              </div>

              {/* Goals - Takes 1 column */}
              <div>
                <GoalsCard />
              </div>
            </section>
          </ScrollReveal>

          {/* Footer */}
          <ScrollReveal delay={0.4}>
            <footer className="mt-12 border-t border-border/50 pt-8">
              <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
                <p>© 2024 FinanceFlow. Gestiona tus finanzas de forma inteligente.</p>
                <div className="flex items-center gap-6">
                  <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
                  <a href="#" className="hover:text-foreground transition-colors">Términos</a>
                  <a href="#" className="hover:text-foreground transition-colors">Soporte</a>
                </div>
              </div>
            </footer>
          </ScrollReveal>
        </main>
      </div>
    </FinanceProvider>
  )
}
