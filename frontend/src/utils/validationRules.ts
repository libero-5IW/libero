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

export const EmailRules = (required: boolean = true) => {
  const rules: ((v: string) => boolean | string)[] = [
      (v: string) => v.length <= 50 || "L'email doit contenir au maximum 50 caractères",
      (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "L'email n'est pas valide"
  ];
  if (required) {
      rules.unshift(requiredRule("Email"));
  }
  return rules;
};

export const passwordRules = (options: {
  required?: boolean,
  minLength?: number,
  uppercase?: boolean,
  lowercase?: boolean,
  digit?: boolean,
  specialChar?: boolean
} = {}) => {
  const {
      required = true,
      minLength = 1,
      uppercase = false,
      lowercase = false,
      digit = false,
      specialChar = false
  } = options;

  const rules = [
      (v: string) => v.length >= minLength || `Le mot de passe doit contenir au moins ${minLength} caractères`,
  ];

  if (uppercase) {
      rules.push((v: string) => /[A-Z]/.test(v) || "Le mot de passe doit contenir au moins une lettre majuscule");
  }
  if (lowercase) {
      rules.push((v: string) => /[a-z]/.test(v) || "Le mot de passe doit contenir au moins une lettre minuscule");
  }
  if (digit) {
      rules.push((v: string) => /[0-9]/.test(v) || "Le mot de passe doit contenir au moins un chiffre");
  }
  if (specialChar) {
      rules.push((v: string) => /[^A-Za-z0-9]/.test(v) || "Le mot de passe doit contenir au moins un caractère spécial");
  }

  if (required) {
      rules.unshift(requiredRule("Mot de passe"));
  }

  return rules;
};

export function passwordMatchRule(target: string) {
  return [
      (v: string) => v === target || "Les mots de passe ne correspondent pas",
  ];
}

  