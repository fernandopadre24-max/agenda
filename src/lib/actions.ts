'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
    addEvent as dbAddEvent, 
    deleteEvent as dbDeleteEvent, 
    updateEvent as dbUpdateEvent,
    addContratante as dbAddContratante,
    updateContratante as dbUpdateContratante,
    deleteContratante as dbDeleteContratante,
    getContratantes as dbGetContratantes,
    addArtista as dbAddArtista,
    updateArtista as dbUpdateArtista,
    deleteArtista as dbDeleteArtista,
    getArtistas as dbGetArtistas,
    getEvents,
    getEventById,
    addTransaction as dbAddTransaction,
    updateTransaction as dbUpdateTransaction,
    deleteTransaction as dbDeleteTransaction,
} from './data';
import type { Event, ActionResponse } from './types';

const eventFormSchema = z.object({
  contratante: z.string().min(1, 'O nome do contratante é obrigatório.'),
  artista: z.string().min(1, 'O nome do artista é obrigatório.'),
  date: z.coerce.date({ required_error: 'A data do evento é obrigatória.' }),
  hora: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM).'),
  entrada: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM).'),
  saida: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM).'),
  cidade: z.string().min(1, 'A cidade é obrigatória.'),
  local: z.string().min(1, 'O local é obrigatório.'),
  financeType: z.enum(['receber', 'pagar', 'nenhum']).default('nenhum'),
  valor: z.coerce.number().optional(),
  status: z.enum(['pendente', 'concluido']).optional(),
}).refine(data => {
    if (data.financeType !== 'nenhum') {
        return data.valor !== undefined && data.valor > 0 && data.status !== undefined;
    }
    return true;
}, {
    message: 'Valor (maior que zero) e status são obrigatórios para transações financeiras.',
    path: ['valor'],
});

const contratanteFormSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    responsibleName: z.string().optional(),
    email: z.string().email('Formato de e-mail inválido.').optional().or(z.literal('')),
    phone: z.string().optional(),
    category: z.string().optional(),
});

const artistaFormSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    email: z.string().email('Formato de e-mail inválido.').optional().or(z.literal('')),
    phone: z.string().optional(),
    serviceType: z.string().optional(),
});

const transactionFormSchema = z.object({
  description: z.string().min(3, 'A descrição é obrigatória.'),
  value: z.coerce.number().positive('O valor deve ser positivo.'),
  type: z.enum(['receber', 'pagar']),
  date: z.coerce.date(),
});


const buildEventDataObject = (data: z.infer<typeof eventFormSchema>): Omit<Event, 'id'> => {
    const eventData: Omit<Event, 'id' | 'pagar' | 'receber'> & { pagar?: any, receber?: any } = {
        date: data.date,
        hora: data.hora,
        contratante: data.contratante,
        artista: data.artista,
        entrada: data.entrada,
        saida: data.saida,
        cidade: data.cidade,
        local: data.local,
        status: 'pendente',
    };

    if (data.financeType === 'receber' && data.valor && data.status) {
        eventData.receber = { valor: data.valor, status: data.status === 'concluido' ? 'recebido' : 'pendente' };
        eventData.pagar = undefined;
    } else if (data.financeType === 'pagar' && data.valor && data.status) {
        eventData.pagar = { valor: data.valor, status: data.status === 'concluido' ? 'pago' : 'pendente' };
        eventData.receber = undefined;
    } else {
        eventData.pagar = undefined;
        eventData.receber = undefined;
    }

    return eventData as Omit<Event, 'id'>;
}


// Event Actions
export async function createEventAction(data: z.infer<typeof eventFormSchema>): Promise<ActionResponse> {
  const validatedFields = eventFormSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, message: 'Dados inválidos.', errors: validatedFields.error.flatten().fieldErrors };
  }
  try {
    const newEventData = buildEventDataObject(validatedFields.data);
    await dbAddEvent(newEventData);
    revalidatePath('/');
    revalidatePath('/agenda');
    revalidatePath('/financeiro');
    revalidatePath('/transacoes');
    return { success: true, message: 'Evento criado!' };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Falha ao criar evento.';
    console.error('createEventAction Error:', errorMessage, e);
    return { success: false, message: errorMessage };
  }
}

export async function updateEventAction(id: string, data: z.infer<typeof eventFormSchema>): Promise<ActionResponse> {
    const validatedFields = eventFormSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: "Dados inválidos.", errors: validatedFields.error.flatten().fieldErrors };
    }
    try {
        const eventUpdateData = buildEventDataObject(validatedFields.data);
        await dbUpdateEvent(id, eventUpdateData);
        revalidatePath('/');
        revalidatePath('/agenda');
        revalidatePath('/financeiro');
        revalidatePath('/transacoes');
        revalidatePath(`/events/${id}`);
        return { success: true, message: 'Evento atualizado!' };
    } catch (e) {
        return { success: false, message: e instanceof Error ? e.message : 'Falha ao atualizar evento.' };
    }
}


export async function deleteEventAction(id: string): Promise<ActionResponse> {
    try {
        await dbDeleteEvent(id);
        revalidatePath('/');
        revalidatePath('/agenda');
        revalidatePath('/financeiro');
        revalidatePath('/transacoes');
        return { success: true, message: 'Evento deletado.' };
    } catch (e) {
        return { success: false, message: e instanceof Error ? e.message : 'Falha ao deletar evento.' };
    }
}

// Contratante Actions
export async function createContratanteAction(data: z.infer<typeof contratanteFormSchema>): Promise<ActionResponse> {
    const validatedFields = contratanteFormSchema.safeParse(data);
    if(!validatedFields.success) {
        return { success: false, message: 'Dados inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }
    try {
        await dbAddContratante(validatedFields.data);
        revalidatePath('/contratantes');
        revalidatePath('/');
        return { success: true, message: 'Contratante criado!' };
    } catch (e) {
        return { success: false, message: e instanceof Error ? e.message : 'Falha ao criar contratante.' };
    }
}

export async function updateContratanteAction(id: string, data: z.infer<typeof contratanteFormSchema>): Promise<ActionResponse> {
    const validatedFields = contratanteFormSchema.safeParse(data);
    if(!validatedFields.success) {
        return { success: false, message: 'Dados inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }
    try {
        await dbUpdateContratante(id, validatedFields.data);
        revalidatePath('/contratantes');
        revalidatePath('/');
        revalidatePath('/agenda');
        return { success: true, message: 'Contratante atualizado!' };
    } catch (e) {
        return { success: false, message: e instanceof Error ? e.message : 'Falha ao atualizar contratante.' };
    }
}

export async function deleteContratanteAction(id: string): Promise<ActionResponse> {
    try {
        const events = await getEvents();
        const contratantes = await dbGetContratantes();
        const contratante = contratantes.find(c => c.id === id);

        if (contratante && events.some(event => event.contratante === contratante.name)) {
            return { success: false, message: 'Contratante associado a eventos. Não pode ser excluído.'};
        }
        
        await dbDeleteContratante(id);
        revalidatePath('/contratantes');
        revalidatePath('/');
        return { success: true, message: 'Contratante deletado.' };
    } catch (e) {
        return { success: false, message: e instanceof Error ? e.message : 'Falha ao deletar contratante.' };
    }
}


// Artista Actions
export async function createArtistaAction(data: z.infer<typeof artistaFormSchema>): Promise<ActionResponse> {
    const validatedFields = artistaFormSchema.safeParse(data);
    if(!validatedFields.success) {
        return { success: false, message: 'Dados inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }
    try {
        await dbAddArtista(validatedFields.data);
        revalidatePath('/artistas');
        revalidatePath('/');
        return { success: true, message: 'Artista criado!' };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Falha ao criar o artista.';
        return { success: false, message: errorMessage };
    }
}

export async function updateArtistaAction(id: string, data: z.infer<typeof artistaFormSchema>): Promise<ActionResponse> {
    const validatedFields = artistaFormSchema.safeParse(data);
    if(!validatedFields.success) {
        return { success: false, message: 'Dados inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }
    try {
        await dbUpdateArtista(id, validatedFields.data);
        revalidatePath('/artistas');
        revalidatePath('/');
        revalidatePath('/agenda');
        return { success: true, message: 'Artista atualizado!' };
    } catch (e) {
        return { success: false, message: e instanceof Error ? e.message : 'Falha ao atualizar artista.' };
    }
}

export async function deleteArtistaAction(id: string): Promise<ActionResponse> {
    try {
        const events = await getEvents();
        const artistas = await dbGetArtistas();
        const artista = artistas.find(a => a.id === id);

        if (artista && events.some(event => event.artista === artista.name)) {
             return { success: false, message: 'Artista associado a eventos. Não pode ser excluído.' };
        }
        await dbDeleteArtista(id);
        revalidatePath('/artistas');
        revalidatePath('/');
        return { success: true, message: 'Artista deletado.' };
    } catch (e) {
        return { success: false, message: e instanceof Error ? e.message : 'Falha ao deletar artista.' };
    }
}


// Status Update Actions
export async function updateEventStatusAction(eventId: string, type: 'pagar' | 'receber'): Promise<ActionResponse> {
    try {
        const event = await getEventById(eventId);
        if (!event) return { success: false, message: 'Evento não encontrado.' };

        const updateData: Partial<Omit<Event, 'id'>> = {};
        if (type === 'pagar' && event.pagar) {
            updateData.pagar = { ...event.pagar, status: 'pago' };
        } else if (type === 'receber' && event.receber) {
            updateData.receber = { ...event.receber, status: 'recebido' };
        } else {
            return { success: false, message: 'Tipo de atualização inválida.' };
        }
        await dbUpdateEvent(eventId, updateData);
        revalidatePath('/');
        revalidatePath('/agenda');
        revalidatePath('/financeiro');
        revalidatePath('/transacoes');
        revalidatePath(`/events/${eventId}`);
        return { success: true, message: 'Status atualizado!' };
    } catch (e) {
        return { success: false, message: e instanceof Error ? e.message : 'Falha ao atualizar status.' };
    }
}

export async function updateEventCompletionStatusAction(eventId: string): Promise<ActionResponse> {
    try {
        const event = await getEventById(eventId);
        if (!event) return { success: false, message: 'Evento não encontrado.' };
        await dbUpdateEvent(eventId, { status: 'realizado' });
        revalidatePath('/');
        revalidatePath('/agenda');
        revalidatePath('/financeiro');
        revalidatePath('/transacoes');
        revalidatePath(`/events/${eventId}`);
        return { success: true, message: 'Evento marcado como "realizado"!' };
    } catch (e) {
        return { success: false, message: e instanceof Error ? e.message : 'Falha ao atualizar status.' };
    }
}


// Transaction Actions
export async function createTransactionAction(data: z.infer<typeof transactionFormSchema>): Promise<ActionResponse> {
    const validatedFields = transactionFormSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: 'Dados inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }
    try {
        // Transactions are always considered 'concluido' upon manual creation for simplicity
        await dbAddTransaction({ ...validatedFields.data, status: 'concluido' });
        revalidatePath('/financeiro');
        revalidatePath('/transacoes');
        return { success: true, message: 'Transação criada!' };
    } catch (e) {
        return { success: false, message: e instanceof Error ? e.message : 'Falha ao criar transação.' };
    }
}

export async function updateTransactionAction(id: string, data: Partial<z.infer<typeof transactionFormSchema>>): Promise<ActionResponse> {
    const validatedFields = transactionFormSchema.partial().safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: 'Dados inválidos.' };
    }
    try {
        await dbUpdateTransaction(id, validatedFields.data);
        revalidatePath('/financeiro');
        revalidatePath('/transacoes');
        return { success: true, message: 'Transação atualizada.' };
    } catch (e) {
        return { success: false, message: e instanceof Error ? e.message : 'Falha ao atualizar transação.' };
    }
}

export async function deleteTransactionAction(id: string): Promise<ActionResponse> {
    try {
        await dbDeleteTransaction(id);
        revalidatePath('/financeiro');
        revalidatePath('/transacoes');
        return { success: true, message: 'Transação excluída.' };
    } catch (e) {
        return { success: false, message: e instanceof Error ? e.message : 'Falha ao excluir transação.' };
    }
}
