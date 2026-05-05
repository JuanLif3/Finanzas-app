'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Tag, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'

const USER_ID = '1de4024a-a90f-4c8e-bbb5-9da9bfd030f7'

interface Category {
    id: string
    name: string
    color: string
    createdAt: string
}

// Colores predefinidos para las categorías
const colorOptions = [
    '#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33F5',
    '#33FFF5', '#F5FF33', '#FF8333', '#8333FF', '#33FF83',
    '#FF3383', '#83FF33', '#3383FF', '#FF33A8', '#A8FF33',
    '#6B5B95', '#88B04B', '#FF6F61', '#92A8D1', '#F7CAC9'
]

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        color: '#FF5733'
    })

    const fetchCategories = async () => {
        try {
            const response = await api.get(`/categories/user/${USER_ID}`)
            setCategories(response.data)
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setLoading(false)
        }
    }

    const createCategory = async () => {
        try {
            await api.post(`/categories/user/${USER_ID}`, formData)
            setOpen(false)
            resetForm()
            fetchCategories()
        } catch (error) {
            console.error('Error creating category:', error)
        }
    }

    const updateCategory = async () => {
        if (!editingCategory) return
        try {
            await api.put(`/categories/${editingCategory.id}`, formData)
            setEditingCategory(null)
            resetForm()
            fetchCategories()
        } catch (error) {
            console.error('Error updating category:', error)
        }
    }

    const deleteCategory = async (id: string, name: string) => {
        if (confirm(`¿Eliminar la categoría "${name}"?`)) {
            try {
                await api.delete(`/categories/${id}`)
                fetchCategories()
            } catch (error) {
                console.error('Error deleting category:', error)
            }
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            color: '#FF5733'
        })
    }

    const openEditDialog = (category: Category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            color: category.color
        })
        setOpen(true)
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona tus categorías de gastos e ingresos
                    </p>
                </div>

                <Dialog open={open} onOpenChange={(isOpen) => {
                    setOpen(isOpen)
                    if (!isOpen) {
                        setEditingCategory(null)
                        resetForm()
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nueva Categoría
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? 'Editar Categoría' : 'Agregar Nueva Categoría'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <Label>Nombre de la categoría</Label>
                                <Input
                                    placeholder="Ej: Supermercado, Uber, Farmacia"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Color</Label>
                                <div className="flex gap-2 flex-wrap mt-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setFormData({ ...formData, color })}
                                            className={`w-8 h-8 rounded-full transition-all ${
                                                formData.color === color
                                                    ? 'ring-2 ring-white scale-110'
                                                    : 'hover:scale-105'
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <div className="mt-3 flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-lg border"
                                        style={{ backgroundColor: formData.color }}
                                    />
                                    <Input
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        placeholder="#FF5733"
                                        className="w-32"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={editingCategory ? updateCategory : createCategory}
                                className="w-full"
                            >
                                {editingCategory ? 'Actualizar' : 'Crear'} Categoría
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Categories Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-12">
                    <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay categorías creadas</p>
                    <p className="text-sm text-muted-foreground">Crea tu primera categoría para organizar tus gastos</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <AnimatePresence>
                        {categories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                                    <div
                                        className="h-2"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: `${category.color}20` }}
                                                >
                                                    <Tag className="h-4 w-4" style={{ color: category.color }} />
                                                </div>
                                                <CardTitle className="text-lg">{category.name}</CardTitle>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => openEditDialog(category)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => deleteCategory(category.id, category.name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: category.color }}
                                                />
                                                <span className="text-muted-foreground">{category.color}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                        {formatDate(category.createdAt)}
                      </span>
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