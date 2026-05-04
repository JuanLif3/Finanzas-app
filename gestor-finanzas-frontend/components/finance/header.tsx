'use client'

import { motion } from 'framer-motion'
import { Wallet, Bell, Settings, LayoutDashboard, CreditCard, Tags, Receipt, Target, PiggyBank } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Cuentas', icon: CreditCard, href: '/accounts' },
    { name: 'Categorías', icon: Tags, href: '/categories' },
    { name: 'Gastos', icon: Receipt, href: '/payments' },
    { name: 'Presupuestos', icon: Target, href: '/budgets' },
    { name: 'Metas', icon: PiggyBank, href: '/goals' },
  ]

  return (
      <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">FinanceFlow</span>
          </motion.div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item, i) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                  <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                  >
                    <Link href={item.href}>
                      <Button
                          variant={isActive ? 'secondary' : 'ghost'}
                          size="sm"
                          className="text-sm font-medium gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  </motion.div>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                3
              </span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground">
                JD
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>
  )
}