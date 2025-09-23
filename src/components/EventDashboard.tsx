'use client';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ListFilter, Calendar as CalendarIcon, X } from 'lucide-react';
import { smartSearch } from '@/ai/flows/smart-search';
import { EventList } from './EventList';
import type { Event } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import { isSameDay } from 'date-fns';
import { Card } from './ui/card';

export function EventDashboard({ initialEvents }: { initialEvents: Event[] }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState(initialEvents);
  const [aiResponse, setAiResponse] = useState('');
  const [filter, setFilter] = useState('upcoming');
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearch = async () => {
    if (!query) {
      setEvents(initialEvents);
      setAiResponse('');
      return;
    }
    setIsLoading(true);
    setAiResponse('');
    try {
      const result = await smartSearch({ query });
      if (result.eventDescription) {
        setAiResponse(result.eventDescription);
      }
      
      const filtered = initialEvents.filter(event => 
        result.relevantEvents.some(relevant => 
          event.artista.toLowerCase().includes(relevant.toLowerCase()) || 
          event.contratante.toLowerCase().includes(relevant.toLowerCase())
        )
      );
      
      setEvents(filtered.length > 0 ? filtered : []);
    } catch (error) {
      console.error("Search failed:", error);
      setAiResponse('Ocorreu um erro na busca. Tente novamente.');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const displayedEvents = useMemo(() => {
    if (!isMounted) return [];
    
    let filteredEvents = events;
    
    const now = new Date();
    now.setHours(0,0,0,0);
    
    if (filter === 'past') {
      filteredEvents = events.filter(e => new Date(e.date) < now);
    }
    if (filter === 'upcoming') {
      filteredEvents = events.filter(e => new Date(e.date) >= now);
    }

    if (selectedDate) {
        return filteredEvents.filter(e => isSameDay(new Date(e.date), selectedDate));
    }

    return filteredEvents;
  }, [filter, events, isMounted, selectedDate]);

  const eventDates = useMemo(() => {
    return initialEvents.map(event => new Date(event.date));
  }, [initialEvents]);

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center space-x-2">
        <Input 
          type="text" 
          placeholder="Busca inteligente de eventos..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="bg-card flex-1"
        />
        <Button onClick={handleSearch} disabled={isLoading} className="bg-primary hover:bg-primary/90">
          {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
          <span className="sr-only">Buscar</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <ListFilter />
              <span className="sr-only">Filtrar</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
              <DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="upcoming">Próximos</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="past">Passados</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
         <Button variant="outline" size="icon" onClick={() => setShowCalendar(!showCalendar)}>
            <CalendarIcon />
            <span className="sr-only">Calendário</span>
        </Button>
      </div>

       {showCalendar && (
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
      )}

      {selectedDate && (
          <div className="flex justify-start">
             <Button variant="outline" size="sm" onClick={() => setSelectedDate(undefined)}>
                <X className="mr-2 h-4 w-4" />
                Limpar seleção
            </Button>
          </div>
      )}

      {aiResponse && <p className="text-sm text-muted-foreground italic px-1">"{aiResponse}"</p>}
      <EventList events={displayedEvents} />
    </div>
  );
}
