'use client';

import { MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HometownSelectorProps {
  hometown: string;
  onHometownChange: (hometown: string) => void;
  availableCities: string[];
  isGeocoding?: boolean;
}

export function HometownSelector({ 
  hometown, 
  onHometownChange, 
  availableCities, 
  isGeocoding = false 
}: HometownSelectorProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/50 backdrop-blur-sm border border-border">
      <MapPin className="h-4 w-4 text-primary" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Home:</span>
        <Select 
          value={hometown} 
          onValueChange={onHometownChange}
          disabled={isGeocoding}
        >
          <SelectTrigger className="h-7 w-40 text-sm bg-background/50 border-none focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableCities.map(city => (
              <SelectItem key={city} value={city} className="capitalize">
                {city.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
