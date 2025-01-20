import { type FormScope, useField } from '@rvf/react-router'
import { Input } from '~/components/ui/input'

interface RVFInputProps<ScopeType> extends React.ComponentProps<'input'> {
  scope: FormScope<ScopeType>
}

export default function RVFInput<ScopeType>({ scope, ...rest }: RVFInputProps<ScopeType>) {
  const field = useField(scope)

  return <Input {...field.getInputProps()} {...rest} />
}
