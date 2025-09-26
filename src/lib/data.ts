import type { Event, Contratante, Artista } from './types';

let contratantes: Contratante[] = [];

let artistas: Artista[] = [];

let events: Event[] = [];

// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Event functions
export async function getEvents(): Promise<Event[]> {
  await delay(100);
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export async function getEventById(id: string): Promise<Event | undefined> {
  await delay(100);
  return events.find(event => event.id === id);
}

export async function addEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
  await delay(100);
  const newEvent: Event = {
    id: String(Date.now()),
    ...eventData,
  };
  events.push(newEvent);
  return newEvent;
}

export async function updateEvent(id: string, eventData: Partial<Event>): Promise<Event | undefined> {
    await delay(100);
    const eventIndex = events.findIndex(event => event.id === id);
    if(eventIndex === -1) return undefined;

    events[eventIndex] = { ...events[eventIndex], ...eventData };
    return events[eventIndex];
}


export async function deleteEvent(id: string): Promise<boolean> {
  await delay(100);
  const initialLength = events.length;
  events = events.filter(event => event.id !== id);
  return events.length < initialLength;
}

// Contratante functions
export async function getContratantes(): Promise<Contratante[]> {
  await delay(100);
  return contratantes;
}

export async function getContratanteById(id: string): Promise<Contratante | undefined> {
    await delay(100);
    return contratantes.find(c => c.id === id);
}

export async function addContratante(contratanteData: Omit<Contratante, 'id'>): Promise<Contratante> {
  await delay(100);
  const newContratante: Contratante = {
    id: String(Date.now() + Math.random()),
    ...contratanteData,
  };
  contratantes.push(newContratante);
  return newContratante;
}

export async function updateContratante(id: string, contratanteData: Partial<Contratante>): Promise<Contratante | undefined> {
    await delay(100);
    const contratanteIndex = contratantes.findIndex(c => c.id === id);
    if (contratanteIndex === -1) return undefined;

    contratantes[contratanteIndex] = { ...contratantes[contratanteIndex], ...contratanteData };
    return contratantes[contratanteIndex];
}

export async function deleteContratante(id: string): Promise<boolean> {
    await delay(100);
    const initialLength = contratantes.length;
    contratantes = contratantes.filter(c => c.id !== id);
    return contratantes.length < initialLength;
}


// Artista functions
export async function getArtistas(): Promise<Artista[]> {
  await delay(100);
  return artistas;
}

export async function getArtistaById(id: string): Promise<Artista | undefined> {
    await delay(100);
    return artistas.find(a => a.id === id);
}

export async function addArtista(artistaData: Omit<Artista, 'id'>): Promise<Artista> {
  await delay(100);
  const newArtista: Artista = {
    id: String(Date.now() + Math.random()),
    ...artistaData,
  };
  artistas.push(newArtista);
  return newArtista;
}

export async function updateArtista(id: string, artistaData: Partial<Artista>): Promise<Artista | undefined> {
    await delay(100);
    const artistaIndex = artistas.findIndex(a => a.id === id);
    if (artistaIndex === -1) return undefined;
    
    artistas[artistaIndex] = { ...artistas[artistaIndex], ...artistaData };
    return artistas[artistaIndex];
}

export async function deleteArtista(id: string): Promise<boolean> {
    await delay(100);
    const initialLength = artistas.length;
    artistas = artistas.filter(a => a.id !== id);
    return artistas.length < initialLength;
}
