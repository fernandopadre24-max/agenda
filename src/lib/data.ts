import type { Event } from './types';

let events: Event[] = [
  {
    id: '1',
    date: new Date('2024-08-15T22:00:00'),
    hora: '22:00',
    contratante: 'Casamento Joana & Miguel',
    artista: 'Banda Sinfonia',
    entrada: '21:00',
    saida: '02:00',
    receber: { valor: 3500, status: 'pendente' },
  },
  {
    id: '2',
    date: new Date('2024-08-17T19:30:00'),
    hora: '19:30',
    contratante: 'Aniversário de 50 anos do Sr. Roberto',
    artista: 'DJ Festa',
    entrada: '18:30',
    saida: '23:30',
    receber: { valor: 1200, status: 'recebido' },
  },
  {
    id: '3',
    date: new Date('2024-08-22T20:00:00'),
    hora: '20:00',
    contratante: 'Evento Corporativo TechCorp',
    artista: 'Palestrante Convidado',
    entrada: '19:00',
    saida: '21:00',
    pagar: { valor: 800, status: 'pago' },
  },
  {
    id: '4',
    date: new Date('2024-09-01T15:00:00'),
    hora: '15:00',
    contratante: 'Festa Infantil - Lucas 5 anos',
    artista: 'Mágico Ilusionista',
    entrada: '14:30',
    saida: '17:30',
    receber: { valor: 750, status: 'pendente' },
  },
  {
    id: '5',
    date: new Date('2024-09-10T21:00:00'),
    hora: '21:00',
    contratante: 'Bar Acústico',
    artista: 'Violão e Voz - Ana Júlia',
    entrada: '20:00',
    saida: '00:00',
    receber: { valor: 400, status: 'pendente' },
  },
];

// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getEvents(): Promise<Event[]> {
  await delay(500);
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export async function getEventById(id: string): Promise<Event | undefined> {
  await delay(200);
  return events.find(event => event.id === id);
}

export async function addEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
  await delay(300);
  const newEvent: Event = {
    id: String(Date.now()),
    ...eventData,
  };
  events.push(newEvent);
  return newEvent;
}

export async function updateEvent(id: string, eventData: Partial<Event>): Promise<Event | undefined> {
    await delay(300);
    const eventIndex = events.findIndex(event => event.id === id);
    if(eventIndex === -1) return undefined;

    events[eventIndex] = { ...events[eventIndex], ...eventData };
    return events[eventIndex];
}


export async function deleteEvent(id: string): Promise<boolean> {
  await delay(300);
  const initialLength = events.length;
  events = events.filter(event => event.id !== id);
  return events.length < initialLength;
}
