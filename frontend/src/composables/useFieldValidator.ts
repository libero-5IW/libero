import {ref, type Ref} from 'vue';
import {z, ZodError, ZodObject} from "zod";

export function useFieldValidator<TSchema extends ZodObject<any>>(fieldSchema: TSchema) {
    type FieldValue = z.infer<TSchema>
    const value = ref(null);
    const valid = ref(false);
    const errors = ref<ZodError<FieldValue>['errors'] | null>(null);

    const setValue = (newValue: any) => {
        value.value = newValue;
    }

    const validate = () => {
        try {
            fieldSchema.parse(value.value)
            valid.value = true;
        } catch(error){
            if (error instanceof ZodError) {
                valid.value = false;
                errors.value = error.errors;
              }
        }
    }

    const isValid = () => {
        return valid.value;
    }

    const getErrors = () => {
        if (!errors.value || !Array.isArray(errors.value)) {
            return [];
        }
        return errors.value.map((error: any) => {
            return error.message;
        });
    }

    return {
        setValue,
        validate,
        isValid,
        getErrors,
    };
}
