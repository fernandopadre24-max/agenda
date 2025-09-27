'use server';

import type { Event, Contratante, Artista, Transaction } from './types';

// --- In-Memory Database ---
let memoryDB = {
  events: [
     { id: '1', date: new Date('2024-08-15T22:00:00.000Z'), hora: '22:00', contratante: 'Casamento Joana & Miguel', artista: 'Banda Sinfonia', entrada: '21:00', saida: '02:00', cidade: 'São Paulo', local: 'Buffet Felicidade', status: 'pendente', receber: { valor: 3500, status: 'pendente' } },
     { id: '2', date: new Date('2024-08-20T19:00:00.000Z'), hora: '19:00', contratante: 'Empresa XYZ', artista: 'DJ Anima', entrada: '18:30', saida: '23:00', cidade: 'Rio de Janeiro', local: 'Espaço Corporativo', status: 'pendente', receber: { valor: 2000, status: 'recebido' } },
     { id: '3', date: new Date('2024-09-01T15:00:00.000Z'), hora: '15:00', contratante: 'Aniversário de 50 anos', artista: 'Voz e Violão MPB', entrada: '14:00', saida: '18:00', cidade: 'Belo Horizonte', local: 'Chácara Paraíso', status: 'realizado', receber: { valor: 1200, status: 'recebido' } }
  ] as Event[],
  contratantes: [
    { id: '1', name: 'Casamento Joana & Miguel', category: 'Casamento' },
    { id: '2', name: 'Empresa XYZ', category: 'Corporativo' },
    { id: '3', name: 'Aniversário de 50 anos', category: 'Aniversário' }
  ] as Contratante[],
  artistas: [
    { id: '1', name: 'Banda Sinfonia', serviceType: 'Banda' },
    { id: '2', name: 'DJ Anima', serviceType: 'DJ' },
    { id: '3', name: 'Voz e Violão MPB', serviceType: 'Músico' }
  ] as Artista[],
  transactions: [] as Transaction[],
};
let nextId = 4;


// --- Event Functions ---
export async function getEvents(): Promise<Event[]> {
  return [...memoryDB.events].sort((a, b) => a.date.getTime() - b.date.getTime());
}

export async function getEventById(id: string): Promise<Event | undefined> {
  return memoryDB.events.find(e => e.id === id);
}

export async function addEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
  const newId = (nextId++).toString();
  const newEvent: Event = { ...eventData, id: newId };
  memoryDB.events.push(newEvent);
  return newEvent;
}

export async function updateEvent(id: string, eventData: Partial<Omit<Event, 'id'>>): Promise<Event | undefined> {
    const eventIndex = memoryDB.events.findIndex(e => e.id === id);
    if (eventIndex === -1) return undefined;
    
    const updatedEvent = { ...memoryDB.events[eventIndex], ...eventData };
    memoryDB.events[eventIndex] = updatedEvent;
    
    return updatedEvent;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const initialLength = memoryDB.events.length;
  memoryDB.events = memoryDB.events.filter(e => e.id !== id);
  return memoryDB.events.length < initialLength;
}

// --- Contratante Functions ---
export async function getContratantes(): Promise<Contratante[]> {
  return [...memoryDB.contratantes].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getContratanteById(id: string): Promise<Contratante | undefined> {
    return memoryDB.contratantes.find(c => c.id === id);
}

export async function addContratante(contratanteData: Omit<Contratante, 'id'>): Promise<Contratante> {
  const newId = (nextId++).toString();
  const newContratante: Contratante = { ...contratanteData, id: newId };
  memoryDB.contratantes.push(newContratante);
  return newContratante;
}

export async function updateContratante(id: string, contratanteData: Partial<Omit<Contratante, 'id'>>): Promise<Contratante | undefined> {
    const index = memoryDB.contratantes.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    memoryDB.contratantes[index] = { ...memoryDB.contratantes[index], ...contratanteData };
    return memoryDB.contratantes[index];
}

export async function deleteContratante(id: string): Promise<boolean> {
    const initialLength = memoryDB.contratantes.length;
    memoryDB.contratantes = memoryDB.contratantes.filter(c => c.id !== id);
    return memoryDB.contratantes.length < initialLength;
}


// --- Artista Functions ---
export async function getArtistas(): Promise<Artista[]> {
  return [...memoryDB.artistas].sort((a,b) => a.name.localeCompare(b.name));
}

export async function getArtistaById(id: string): Promise<Artista | undefined> {
    return memoryDB.artistas.find(a => a.id === id);
}

export async function addArtista(artistaData: Omit<Artista, 'id'>): Promise<Artista> {
  const newId = (nextId++).toString();
  const newArtista: Artista = { ...artistaData, id: newId };
  memoryDB.artistas.push(newArtista);
  return newArtista;
}

export async function updateArtista(id: string, artistaData: Partial<Omit<Artista, 'id'>>): Promise<Artista | undefined> {
    const index = memoryDB.artistas.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    memoryDB.artistas[index] = { ...memoryDB.artistas[index], ...artistaData };
    return memoryDB.artistas[index];
}

export async function deleteArtista(id: string): Promise<boolean> {
    const initialLength = memoryDB.artistas.length;
    memoryDB.artistas = memoryDB.artistas.filter(a => a.id !== id);
    return memoryDB.artistas.length < initialLength;
}


// --- Transaction Functions ---
export async function getTransactions(): Promise<Transaction[]> {
    return [...memoryDB.transactions].sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function addTransaction(transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
    const newId = `trans-${nextId++}`;
    const newTransaction: Transaction = { ...transactionData, id: newId };
    memoryDB.transactions.push(newTransaction);
    return newTransaction;
}

export async function updateTransaction(id: string, transactionData: Partial<Omit<Transaction, 'id'>>): Promise<Transaction | undefined> {
    const index = memoryDB.transactions.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    memoryDB.transactions[index] = { ...memoryDB.transactions[index], ...transactionData };
    return memoryDB.transactions[index];
}

export async function deleteTransaction(id: string): Promise<boolean> {
    const initialLength = memoryDB.transactions.length;
    memoryDB.transactions = memoryDB.transactions.filter(t => t.id !== id);
    return memoryDB.transactions.length < initialLength;
}
