import { Link, type LinkProps } from 'react-router'
import { Button, type ButtonProps } from '~/components/ui/button'
import type { RefObject } from 'react'

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonProps['variant']
  disabled?: ButtonProps['disabled']
  linkRef?: RefObject<HTMLAnchorElement>
}

export default function ButtonLink({
  variant = 'ghost',
  disabled = false,
  linkRef,
  className,
  ...rest
}: ButtonLinkProps) {
  if (disabled) {
    return (
      <Button asChild variant={variant} disabled={disabled} className={className}>
        <span {...rest} />
      </Button>
    )
  }
  return (
    <Button asChild variant={variant} disabled={disabled} className={className}>
      <Link {...rest} ref={linkRef} />
    </Button>
  )
}
