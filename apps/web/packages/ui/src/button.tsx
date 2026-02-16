'use client';

import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';

export interface ButtonProps extends ChakraButtonProps {
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'solid', 
  size = 'md', 
  isLoading = false, 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <ChakraButton
      variant={variant}
      size={size}
      loading={isLoading}
      {...props}
    >
      {children}
    </ChakraButton>
  );
}
