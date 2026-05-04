'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, CreditCard, BarChart3 } from 'lucide-react'

const actions = [
  { icon: Upload, label: 'Transferir', color: 'oklch(0.65 0.20 145)' },
  { icon: FileText, label: 'Facturas', color: 'oklch(0.55 0.22 280)' },
  { icon: CreditCard, label: 'Tarjetas', color: 'oklch(0.60 0.18 200)' },
  { icon: BarChart3, label: 'Reportes', color: 'oklch(0.75 0.18 80)' },
]

export function QuickActions() {
  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {actions.map((action, index) => {
                const Icon = action.icon
                return (
                    <motion.div
                        key={action.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Button
                          variant="outline"
                          className="h-auto w-full flex-col gap-2 py-4 border-border/50 hover:bg-accent/50"
                      >
                        <Icon className="h-5 w-5" style={{ color: action.color }} />
                        <span className="text-sm font-medium">{action.label}</span>
                      </Button>
                    </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
  )
}