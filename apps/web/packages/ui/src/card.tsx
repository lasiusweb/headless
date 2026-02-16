'use client';

import { 
  Card as ChakraCard, 
  CardProps as ChakraCardProps,
  Heading,
  Text,
} from '@chakra-ui/react';

export interface CardProps extends ChakraCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function Card({ title, description, children, ...props }: CardProps) {
  return (
    <ChakraCard {...props}>
      {(title || description) && (
        <ChakraCard.Header>
          {title && <Heading size="md">{title}</Heading>}
          {description && <Text color="gray.600">{description}</Text>}
        </ChakraCard.Header>
      )}
      <ChakraCard.Body>{children}</ChakraCard.Body>
    </ChakraCard>
  );
}
