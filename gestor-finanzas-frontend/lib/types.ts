export type Category =
    | 'salary'
    | 'freelance'
    | 'investments'
    | 'food'
    | 'transport'
    | 'entertainment'
    | 'utilities'
    | 'shopping'
    | 'health'
    | 'education'
    | 'other';

export const categoryLabels: Record<Category, string> = {
  salary: 'Salario',
  freelance: 'Freelance',
  investments: 'Inversiones',
  food: 'Alimentación',
  transport: 'Transporte',
  entertainment: 'Entretenimiento',
  utilities: 'Servicios',
  shopping: 'Compras',
  health: 'Salud',
  education: 'Educación',
  other: 'Otros'
};