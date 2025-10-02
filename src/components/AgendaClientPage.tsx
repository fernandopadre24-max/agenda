'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Artista, Contratante, Event } from '@/lib/types';
import { isSameDay } from 'date-fns';
import { Card } from './ui/card';
import { Calendar } from '@/components/ui/calendar';
import { EventList } from './EventList';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function AgendaClientPage({
  initialEvents = [],
  initialArtistas = [],
  initialContratantes = [],
}: {
  initialEvents: Event[];
  initialArtistas: Artista[];
  initialContratantes: Contratante[];
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedArtista, setSelectedArtista] = useState('all');
  const [selectedContratante, setSelectedContratante] = useState('all');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayedEvents = useMemo(() => {
    if (!isMounted) return [];

    let filteredEvents = initialEvents;

    if (selectedDate) {
      filteredEvents = filteredEvents.filter(e =>
        isSameDay(new Date(e.date), selectedDate)
      );
    }

    if (selectedArtista !== 'all') {
      filteredEvents = filteredEvents.filter(
        e => e.artista === selectedArtista
      );
    }

    if (selectedContratante !== 'all') {
      filteredEvents = filteredEvents.filter(
        e => e.contratante === selectedContratante
      );
    }

    if (!selectedDate && selectedArtista === 'all' && selectedContratante === 'all') {
        const now = new Date();
        now.setUTCHours(0,0,0,0);
        return initialEvents.filter(e => new Date(e.date) >= now);
    }


    return filteredEvents;
  }, [
    initialEvents,
    isMounted,
    selectedDate,
    selectedArtista,
    selectedContratante,
  ]);

  const eventDates = useMemo(() => {
    return initialEvents.map(event => new Date(event.date));
  }, [initialEvents]);

  const resetFilters = () => {
    setSelectedDate(undefined);
    setSelectedArtista('all');
    setSelectedContratante('all');
  }

  if (!isMounted) {
    return null;
  }

  const hasActiveFilters = selectedDate || selectedArtista !== 'all' || selectedContratante !== 'all';

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
      
      <div className="grid grid-cols-2 gap-2">
        <Select value={selectedArtista} onValueChange={setSelectedArtista}>
            <SelectTrigger>
                <SelectValue placeholder="Filtrar por artista" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos os Artistas</SelectItem>
                {initialArtistas.map(a => <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>)}
            </SelectContent>
        </Select>
            <Select value={selectedContratante} onValueChange={setSelectedContratante}>
            <SelectTrigger>
                <SelectValue placeholder="Filtrar por contratante" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos os Contratantes</SelectItem>
                {initialContratantes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-headline">
                {selectedDate ? `Eventos em ${selectedDate.toLocaleDateString('pt-BR', {day: '2-digit', month: 'long'})}` : 'Eventos Filtrados'}
            </h2>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="mr-2 h-4 w-4" />
                Limpar filtros
            </Button>
        </div>
      )}

      <EventList events={displayedEvents} artistas={initialArtistas} contratantes={initialContratantes} />
    </div>
  );
}
