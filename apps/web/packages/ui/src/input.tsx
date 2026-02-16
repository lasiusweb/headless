'use client';

import { Input as ChakraInput, InputProps as ChakraInputProps, Field } from '@chakra-ui/react';

export interface InputProps extends ChakraInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, ...props }: InputProps) {
  if (label) {
    return (
      <Field label={label} invalid={!!error} errorText={error} helperText={helperText}>
        <ChakraInput {...props} />
      </Field>
    );
  }
  
  return <ChakraInput {...props} />;
}
