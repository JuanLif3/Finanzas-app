'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface RefreshContextType {
    refreshBudgets: boolean
    triggerBudgetsRefresh: () => void
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined)

export function RefreshProvider({ children }: { children: React.ReactNode }) {
    const [refreshBudgets, setRefreshBudgets] = useState(false)

    const triggerBudgetsRefresh = useCallback(() => {
        setRefreshBudgets(prev => !prev) // Toggle para forzar actualización
    }, [])

    return (
        <RefreshContext.Provider value={{ refreshBudgets, triggerBudgetsRefresh }}>
    {children}
    </RefreshContext.Provider>
)
}

export function useRefresh() {
    const context = useContext(RefreshContext)
    if (!context) {
        throw new Error('useRefresh must be used within RefreshProvider')
    }
    return context
}