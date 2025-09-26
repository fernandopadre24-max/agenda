'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Event } from '@/lib/types';
import { isSameDay } from 'date-fns';
import { Card } from './ui/card';
import { Calendar } from '@/components/ui/calendar';
import { EventList } from './EventList';
import { Button } from './ui/button';
import { X } from 'lucide-react';

export function AgendaClientPage({ initialEvents }: { initialEvents: Event[] }) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayedEvents = useMemo(() => {
    if (!isMounted) return [];
    
    if (selectedDate) {
        return initialEvents.filter(e => isSameDay(new Date(e.date), selectedDate));
    }

    // Return all upcoming events by default if no date is selected
    const now = new Date();
    now.setHours(0,0,0,0);
    return initialEvents.filter(e => new Date(e.date) >= now);

  }, [initialEvents, isMounted, selectedDate]);

  const eventDates = useMemo(() => {
    return initialEvents.map(event => new Date(event.date));
  }, [initialEvents]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card className="p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={{ event: eventDates }}
          modifiersClassNames={{
            event: 'bg-primary/20 rounded-full',
            selected: 'bg-primary text-primary-foreground',
          }}
          className="w-full"
        />
      </Card>

      {selectedDate && (
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-headline">
                Eventos em {selectedDate.toLocaleDateString('pt-BR', {day: '2-digit', month: 'long'})}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)}>
                <X className="mr-2 h-4 w-4" />
                Limpar
            </Button>
        </div>
      )}

      <EventList events={displayedEvents} />
    </div>
  );
}
