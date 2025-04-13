export function variableNameRules(options: {
    existingNames: string[]
    originalName?: string
    mode: 'create' | 'edit'
  }): ((v: string) => boolean | string)[] {
    
    const { existingNames, originalName = '', mode } = options
  
    return [
      (v: string) => !!v || 'Le nom de la variable est requis',
      (v: string) =>
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(v) ||
        'Le nom de variable doit être en camelCase ou snake_case.',
      (v: string) => {
        const alreadyExists = existingNames.includes(v)
        const isEdit = mode === 'edit'
        const isSameAsOriginal = v === originalName

        return !alreadyExists || (isEdit && isSameAsOriginal) || 'Ce nom est déjà utilisé.'
      },
    ]
}

export const labelRules = () => [
  (v: string) => !!v || 'Le label est requis',
  (v: string) => v.length <= 30 || 'Le label doit faire au maximum 30 caractères',
]

export const typeRules = () => [
  (v: string) => !!v || 'Le type est requis',
  (v: string) => ['string', 'number', 'date', 'boolean'].includes(v) || 'Type invalide',
]

export const requiredBooleanRules = () => [
  (v: boolean) => typeof v === 'boolean' || 'Valeur attendue : true ou false',
]

export const requiredRule = (field: string) => (v: string) => !!v || `${field} est requis`


  