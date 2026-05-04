'use client'

import { motion } from 'framer-motion'
import { Target, Car, Plane, Home } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useFinance } from '@/lib/finance-context'

const iconMap: Record<string, React.ElementType> = {
  Target: Target,
  Car: Car,
  Plane: Plane,
  Home: Home,
};

export function GoalsCard() {
  const { goals, loading } = useFinance()

  if (loading) {
    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Cargando metas...</CardTitle>
          </CardHeader>
        </Card>
    )
  }

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Metas de Ahorro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {goals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay metas de ahorro. ¡Crea una!
                </p>
            ) : (
                goals.map((goal, index) => {
                  const percentage = Math.round((goal.current / goal.target) * 100);
                  const Icon = iconMap[goal.icon] || Target;

                  return (
                      <motion.div
                          key={goal.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                                className="flex h-8 w-8 items-center justify-center rounded-lg"
                                style={{ backgroundColor: `${goal.color}20` }}
                            >
                              <Icon className="h-4 w-4" style={{ color: goal.color }} />
                            </div>
                            <span className="font-medium">{goal.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                      €{goal.current.toLocaleString()} / €{goal.target.toLocaleString()}
                    </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <p className="text-right text-xs text-muted-foreground">{percentage}% completado</p>
                      </motion.div>
                  );
                })
            )}
          </CardContent>
        </Card>
      </motion.div>
  );
}