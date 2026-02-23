import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Event } from '@/types';

interface KpiCardsProps {
  events: Event[];
}

export function KpiCards({ events }: KpiCardsProps) {
  const cards = [
    { label: 'Total Events', value: events.length },
    { label: 'Categories', value: new Set(events.map(e => e.category)).size },
    { label: 'Cities', value: new Set(events.map(e => e.city)).size },
    { label: 'Sources', value: new Set(events.map(e => e.source)).size },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="pb-2">
            <CardDescription>{card.label}</CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl">{card.value}</CardTitle>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
