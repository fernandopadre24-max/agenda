import type { Event, Contratante, Artista } from './types';

let contratantes: Contratante[] = [
  { id: '1', name: 'Casamento Joana & Miguel', email: 'joana@email.com', phone: '11987654321' },
  { id: '2', name: 'Aniversário de 50 anos do Sr. Roberto', email: 'roberto@email.com', phone: '21987654321' },
  { id: '3', name: 'Evento Corporativo TechCorp', email: 'contato@techcorp.com', phone: '31987654321' },
  { id: '4', name: 'Festa Infantil - Lucas 5 anos', email: 'familia.lucas@email.com', phone: '41987654321' },
  { id: '5', name: 'Bar Acústico', email: 'baracustico@email.com', phone: '51987654321' },
];

let artistas: Artista[] = [
    { id: '1', name: 'Banda Sinfonia', serviceType: 'Banda Completa' },
    { id: '2', name: 'DJ Festa', serviceType: 'DJ' },
    { id: '3', name: 'Palestrante Convidado', serviceType: 'Palestra' },
    { id: '4', name: 'Mágico Ilusionista', serviceType: 'Entretenimento' },
    { id: '5', name: 'Violão e Voz - Ana Júlia', serviceType: 'Música Acústica' },
];

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

// Event functions
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

// Contratante functions
export async function getContratantes(): Promise<Contratante[]> {
  await delay(300);
  return contratantes;
}

export async function getContratanteById(id: string): Promise<Contratante | undefined> {
    await delay(200);
    return contratantes.find(c => c.id === id);
}

export async function addContratante(contratanteData: Omit<Contratante, 'id'>): Promise<Contratante> {
  await delay(300);
  const newContratante: Contratante = {
    id: String(Date.now()),
    ...contratanteData,
  };
  contratantes.push(newContratante);
  return newContratante;
}

export async function updateContratante(id: string, contratanteData: Partial<Contratante>): Promise<Contratante | undefined> {
    await delay(300);
    const contratanteIndex = contratantes.findIndex(c => c.id === id);
    if (contratanteIndex === -1) return undefined;

    contratantes[contratanteIndex] = { ...contratantes[contratanteIndex], ...contratanteData };
    return contratantes[contratanteIndex];
}

export async function deleteContratante(id: string): Promise<boolean> {
    await delay(300);
    const initialLength = contratantes.length;
    contratantes = contratantes.filter(c => c.id !== id);
    return contratantes.length < initialLength;
}


// Artista functions
export async function getArtistas(): Promise<Artista[]> {
  await delay(300);
  return artistas;
}

export async function getArtistaById(id: string): Promise<Artista | undefined> {
    await delay(200);
    return artistas.find(a => a.id === id);
}

export async function addArtista(artistaData: Omit<Artista, 'id'>): Promise<Artista> {
  await delay(300);
  const newArtista: Artista = {
    id: String(Date.now()),
    ...artistaData,
  };
  artistas.push(newArtista);
  return newArtista;
}

export async function updateArtista(id: string, artistaData: Partial<Artista>): Promise<Artista | undefined> {
    await delay(300);
    const artistaIndex = artistas.findIndex(a => a.id === id);
    if (artistaIndex === -1) return undefined;
    
    artistas[artistaIndex] = { ...artistas[artistaIndex], ...artistaData };
    return artistas[artistaIndex];
}

export async function deleteArtista(id: string): Promise<boolean> {
    await delay(300);
    const initialLength = artistas.length;
    artistas = artistas.filter(a => a.id !== id);
    return artistas.length < initialLength;
}
