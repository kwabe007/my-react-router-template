import { type FormScope, useField } from '@rvf/react-router'

interface FieldErrorProps<ScopeType> {
  scope: FormScope<ScopeType>
}

export default function FieldError<ScopeType>({ scope }: FieldErrorProps<ScopeType>) {
  const field = useField(scope)

  if (!field.error()) {
    return null
  }

  return <div className="text-red-600 text-sm">{field.error()}</div>
}
