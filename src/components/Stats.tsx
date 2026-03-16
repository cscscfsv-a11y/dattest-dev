import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { staggerItem } from '@/lib/motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  color?: 'primary' | 'success' | 'warning' | 'accent';
  subtitle?: string;
}

const colorMap = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  accent: 'bg-accent/20 text-accent-foreground',
};

export function StatCard({ title, value, icon: Icon, trend, color = 'primary', subtitle }: StatCardProps) {
  return (
    <motion.div variants={staggerItem}>
      <Card className="border-border/60 hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
              <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
              {trend && (
                <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium',
                  trend.value >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {trend.value >= 0
                    ? <TrendingUp className="w-3.5 h-3.5" />
                    : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{Math.abs(trend.value)}% {trend.label}</span>
                </div>
              )}
            </div>
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', colorMap[color])}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
