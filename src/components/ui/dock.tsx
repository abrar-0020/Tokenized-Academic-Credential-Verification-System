import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DockItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
};

export default function Dock({ items, className }: { items: DockItem[]; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {items.map((item) => (
        <Button
          key={item.label}
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg"
          onClick={item.onClick}
        >
          <item.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
