// src/components/ui/Button.jsx

const VARIANT_CLASS = {
  primary: 'primary',
  secondary: '',
  ghost: 'ghost',
};

const SIZE_CLASS = {
  sm: 'sm',
  md: '',
  lg: 'lg',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  block = false,
  className = '',
  type = 'button',
  children,
  ...props
}) {
  const variantClass = VARIANT_CLASS[variant] ?? '';
  const sizeClass = SIZE_CLASS[size] ?? '';
  const blockClass = block ? 'block' : '';

  const classes = ['kbtnBase', variantClass, sizeClass, blockClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
