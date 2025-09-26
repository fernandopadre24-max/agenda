import type { Event, Contratante, Artista } from './types';
import { LocalStorage } from 'node-localstorage';

// Polyfill for localStorage on the server side
const localStorage = typeof window !== 'undefined' ? window.localStorage : new LocalStorage('./scratch');

const ARTISTAS_KEY = 'artistas';
const CONTRATANTES_KEY = 'contratantes';
const EVENTS_KEY = 'events';

// Helper functions to get and set data from localStorage
function getData<T>(key: string): T[] {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error(`Error reading from localStorage key "${key}":`, error);
        return [];
    }
}

function setData<T>(key: string, data: T[]): void {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error writing to localStorage key "${key}":`, error);
    }
}


// Event functions
export async function getEvents(): Promise<Event[]> {
  const events = getData<Event>(EVENTS_KEY).map(e => ({...e, date: new Date(e.date)}));
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const events = await getEvents();
  return events.find(event => event.id === id);
}

export async function addEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
  const events = await getEvents();
  const newEvent: Event = {
    id: String(Date.now()),
    ...eventData,
  };
  events.push(newEvent);
  setData(EVENTS_KEY, events);
  return newEvent;
}

export async function updateEvent(id: string, eventData: Partial<Omit<Event, 'id'>>): Promise<Event | undefined> {
    const events = await getEvents();
    const eventIndex = events.findIndex(event => event.id === id);
    if(eventIndex === -1) return undefined;

    const updatedEvent = { ...events[eventIndex], ...eventData, id };
    events[eventIndex] = updatedEvent;
    setData(EVENTS_KEY, events);
    return updatedEvent;
}


export async function deleteEvent(id: string): Promise<boolean> {
  let events = await getEvents();
  const initialLength = events.length;
  events = events.filter(event => event.id !== id);
  setData(EVENTS_KEY, events);
  return events.length < initialLength;
}

// Contratante functions
export async function getContratantes(): Promise<Contratante[]> {
  return getData<Contratante>(CONTRATANTES_KEY).sort((a,b) => a.name.localeCompare(b.name));
}

export async function getContratanteById(id: string): Promise<Contratante | undefined> {
    const contratantes = await getContratantes();
    return contratantes.find(c => c.id === id);
}

export async function addContratante(contratanteData: Omit<Contratante, 'id' | 'responsibleName'> & { responsibleName?: string }): Promise<Contratante> {
  const contratantes = await getContratantes();
  const newContratante: Contratante = {
    id: String(Date.now() + Math.random()),
    ...contratanteData,
  };
  contratantes.push(newContratante);
  setData(CONTRATANTES_KEY, contratantes);
  return newContratante;
}

export async function updateContratante(id: string, contratanteData: Partial<Omit<Contratante, 'id'>>): Promise<Contratante | undefined> {
    const contratantes = await getContratantes();
    const contratanteIndex = contratantes.findIndex(c => c.id === id);
    if (contratanteIndex === -1) return undefined;

    const updatedContratante = { ...contratantes[contratanteIndex], ...contratanteData, id };
    contratantes[contratanteIndex] = updatedContratante;
    setData(CONTRATANTES_KEY, contratantes);
    return updatedContratante;
}

export async function deleteContratante(id: string): Promise<boolean> {
    let contratantes = await getContratantes();
    const initialLength = contratantes.length;
    contratantes = contratantes.filter(c => c.id !== id);
    setData(CONTRATANTES_KEY, contratantes);
    return contratantes.length < initialLength;
}


// Artista functions
export async function getArtistas(): Promise<Artista[]> {
  return getData<Artista>(ARTISTAS_KEY).sort((a,b) => a.name.localeCompare(b.name));
}

export async function getArtistaById(id: string): Promise<Artista | undefined> {
    const artistas = await getArtistas();
    return artistas.find(a => a.id === id);
}

export async function addArtista(artistaData: Omit<Artista, 'id'>): Promise<Artista> {
  const artistas = await getArtistas();
  const newArtista: Artista = {
    id: String(Date.now() + Math.random()),
    ...artistaData,
  };
  artistas.push(newArtista);
  setData(ARTISTAS_KEY, artistas);
  return newArtista;
}

export async function updateArtista(id: string, artistaData: Partial<Omit<Artista, 'id'>>): Promise<Artista | undefined> {
    const artistas = await getArtistas();
    const artistaIndex = artistas.findIndex(a => a.id === id);
    if (artistaIndex === -1) return undefined;
    
    const updatedArtista = { ...artistas[artistaIndex], ...artistaData, id };
    artistas[artistaIndex] = updatedArtista;
    setData(ARTISTAS_KEY, artistas);
    return updatedArtista;
}

export async function deleteArtista(id: string): Promise<boolean> {
    let artistas = await getArtistas();
    const initialLength = artistas.length;
    artistas = artistas.filter(a => a.id !== id);
    setData(ARTISTAS_KEY, artistas);
    return artistas.length < initialLength;
}
