'use client';
import * as React from 'react';
import { cn, getInitials } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export function Avatar({ src, name = '', size = 'md', className, ...props }: AvatarProps) {
  const [errored, setErrored] = React.useState(false);
  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full bg-primary/10 font-semibold text-primary',
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {src && !errored ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          onError={() => setErrored(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}
