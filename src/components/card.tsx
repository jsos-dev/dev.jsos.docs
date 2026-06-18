import { Card as CardPrimitive } from 'fumadocs-ui/components/card';
import {
  Rocket,
  Code,
  FileText,
  Package,
  Plug,
  LayoutDashboard,
  Building2,
  BookOpen,
  Zap,
} from 'lucide-react';
import type { ComponentProps } from 'react';

const iconMap: Record<string, React.ComponentType> = {
  Rocket,
  Code,
  FileText,
  Package,
  Plug,
  LayoutDashboard,
  Building2,
  BookOpen,
  Zap,
};

export function Card({ icon, ...props }: ComponentProps<typeof CardPrimitive>) {
  if (typeof icon === 'string') {
    const LucideIcon = iconMap[icon];
    if (LucideIcon) {
      return <CardPrimitive icon={<LucideIcon />} {...props} />;
    }
  }
  return <CardPrimitive icon={icon} {...props} />;
}
