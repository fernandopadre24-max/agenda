'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ListFilter } from 'lucide-react';
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

export function EventDashboard({ initialEvents }: { initialEvents: Event[] }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [displayedEvents, setDisplayedEvents] = useState(initialEvents);
  const [aiResponse, setAiResponse] = useState('');
  const [filter, setFilter] = useState('all');

  const handleSearch = async () => {
    if (!query) {
      setDisplayedEvents(initialEvents);
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
      
      setDisplayedEvents(filtered.length > 0 ? filtered : []);
    } catch (error) {
      console.error("Search failed:", error);
      setAiResponse('Ocorreu um erro na busca. Tente novamente.');
      setDisplayedEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    const now = new Date();
    if (value === 'past') {
      setDisplayedEvents(initialEvents.filter(e => e.date < now));
    } else if (value === 'upcoming') {
      setDisplayedEvents(initialEvents.filter(e => e.date >= now));
    } else {
      setDisplayedEvents(initialEvents);
    }
  };

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
            <DropdownMenuRadioGroup value={filter} onValueChange={handleFilterChange}>
              <DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="upcoming">Próximos</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="past">Passados</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {aiResponse && <p className="text-sm text-muted-foreground italic px-1">"{aiResponse}"</p>}
      <EventList events={displayedEvents} />
    </div>
  );
}
