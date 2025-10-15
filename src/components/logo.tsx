import * as React from 'react';
import { Handshake } from 'lucide-react';

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <Handshake
      className={className}
      {...props}
    />
  );
}
    