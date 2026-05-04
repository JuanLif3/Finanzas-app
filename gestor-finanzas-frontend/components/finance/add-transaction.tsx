'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function AddTransaction() {
  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Nueva Transacción</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Transacción
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Formulario de transacción - Próximamente
            </p>
          </CardContent>
        </Card>
      </motion.div>
  )
}