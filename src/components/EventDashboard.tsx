'use client';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ListFilter, Calendar as CalendarIcon, X } from 'lucide-react';
import { smartSearch } from '@/ai/flows/smart-search';
import { EventList } from './EventList';
import type { Event, Artista, Contratante } from '@/lib/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function EventDashboard({ 
  initialEvents,
  artistas,
  contratantes
}: { 
  initialEvents: Event[],
  artistas: Artista[],
  contratantes: Contratante[]
}) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState(initialEvents);
  const [aiResponse, setAiResponse] = useState('');
  const [filter, setFilter] = useState('upcoming');
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedArtista, setSelectedArtista] = useState('all');
  const [selectedContratante, setSelectedContratante] = useState('all');

  useEffect(() => {
    setIsMounted(true);
    setEvents(initialEvents);
  }, [initialEvents]);

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
      filteredEvents = filteredEvents.filter(e => new Date(e.date) < now);
    }
    if (filter === 'upcoming') {
      filteredEvents = filteredEvents.filter(e => new Date(e.date) >= now);
    }

    if (selectedDate) {
        filteredEvents = filteredEvents.filter(e => isSameDay(new Date(e.date), selectedDate));
    }

    if (selectedArtista !== 'all') {
        filteredEvents = filteredEvents.filter(e => e.artista === selectedArtista);
    }

    if (selectedContratante !== 'all') {
        filteredEvents = filteredEvents.filter(e => e.contratante === selectedContratante);
    }

    return filteredEvents;
  }, [filter, events, isMounted, selectedDate, selectedArtista, selectedContratante]);

  const eventDates = useMemo(() => {
    return initialEvents.map(event => new Date(event.date));
  }, [initialEvents]);

   const resetFilters = () => {
      setSelectedDate(undefined);
      setSelectedArtista('all');
      setSelectedContratante('all');
      setQuery('');
      setEvents(initialEvents);
      setAiResponse('');
   }

  return (
    <div className="space-y-4">
        <div className="space-y-2">
            <div className="flex w-full items-center space-x-2">
                <Input 
                type="text" 
                placeholder="Busca inteligente de eventos..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-card flex-1"
                />
                <Button onClick={handleSearch} disabled={isLoading} variant="default">
                {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                <span className="sr-only">Buscar</span>
                </Button>
            </div>
            <div className="flex w-full items-center gap-2">
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                    <ListFilter className="mr-2 h-4 w-4" />
                    {filter === 'all' ? 'Todos' : filter === 'upcoming' ? 'Próximos' : 'Passados'}
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
                <Button variant="outline" size="sm" onClick={() => setShowCalendar(!showCalendar)} className="flex-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? selectedDate.toLocaleDateString('pt-BR') : 'Data'}
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Select value={selectedArtista} onValueChange={setSelectedArtista}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filtrar por artista" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Artistas</SelectItem>
                        {artistas?.map(a => <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={selectedContratante} onValueChange={setSelectedContratante}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filtrar por contratante" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Contratantes</SelectItem>
                        {contratantes?.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>

       {showCalendar && (
         <Card className="p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
                setSelectedDate(date);
                setShowCalendar(false);
            }}
            modifiers={{ event: eventDates }}
            modifiersClassNames={{
              event: 'bg-primary/20 rounded-full',
              selected: 'bg-primary text-primary-foreground',
            }}
            className="w-full"
          />
         </Card>
      )}

      {(selectedDate || selectedArtista !== 'all' || selectedContratante !== 'all') && (
          <div className="flex justify-start">
             <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="mr-2 h-4 w-4" />
                Limpar filtros
            </Button>
          </div>
      )}

      {aiResponse && <p className="text-sm text-muted-foreground italic px-1">"{aiResponse}"</p>}
      <EventList 
        events={displayedEvents} 
        artistas={artistas}
        contratantes={contratantes}
      />
    </div>
  );
}
