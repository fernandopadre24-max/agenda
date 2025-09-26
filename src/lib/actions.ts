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
    getEventById
} from './data';
import type { Event, Artista, Contratante } from './types';

const eventFormSchema = z.object({
  draft: z.string().optional(),
  contratante: z.string().min(1, 'O nome do contratante é obrigatório.'),
  artista: z.string().min(1, 'O nome do artista é obrigatório.'),
  date: z.coerce.date({ required_error: 'A data do evento é obrigatória.' }),
  hora: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM).'),
  entrada: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM).'),
  saida: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM).'),
  financeType: z.enum(['receber', 'pagar', 'nenhum']).default('nenhum'),
  valor: z.coerce.number().optional(),
  status: z.enum(['pendente', 'concluido']).optional(),
}).refine(data => {
    if (data.financeType !== 'nenhum') {
        return data.valor !== undefined && data.status !== undefined;
    }
    return true;
}, {
    message: 'Valor e status são obrigatórios para transações financeiras.',
    path: ['valor'],
});


const contratanteFormSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    email: z.string().email('Formato de e-mail inválido.').optional().or(z.literal('')),
    phone: z.string().optional(),
});

const artistaFormSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    email: z.string().email('Formato de e-mail inválido.').optional().or(z.literal('')),
    phone: z.string().optional(),
    serviceType: z.string().optional(),
});


export type EventFormValues = z.infer<typeof eventFormSchema>;
export type ContratanteFormValues = z.infer<typeof contratanteFormSchema>;
export type ArtistaFormValues = z.infer<typeof artistaFormSchema>;


export type ActionResponse = {
    success: boolean;
    message: string;
    redirectPath?: string;
    data?: Artista | Contratante;
    errors?: { [key: string]: string[] | undefined; };
}

const createEventFromForm = (data: EventFormValues): Omit<Event, 'id'> => {
    const event: Omit<Event, 'id'> = {
        date: data.date,
        hora: data.hora,
        contratante: data.contratante,
        artista: data.artista,
        entrada: data.entrada,
        saida: data.saida,
    };

    if (data.financeType === 'receber' && data.valor !== undefined && data.status) {
        event.receber = { valor: data.valor, status: data.status === 'concluido' ? 'recebido' : 'pendente' };
    }
    if (data.financeType === 'pagar' && data.valor !== undefined && data.status) {
        event.pagar = { valor: data.valor, status: data.status === 'concluido' ? 'pago' : 'pendente' };
    }
    return event;
}

export async function createEventAction(data: EventFormValues): Promise<ActionResponse> {
  const validatedFields = eventFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Por favor, corrija os erros abaixo.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const newEvent = createEventFromForm(validatedFields.data);
    await dbAddEvent(newEvent);
    revalidatePath('/');
    revalidatePath('/events/new');
    return { success: true, message: 'Evento criado com sucesso!', redirectPath: '/' };
  } catch (e) {
    return { success: false, message: 'Ocorreu um erro ao criar o evento.' };
  }
}

export async function updateEventAction(id: string, data: EventFormValues): Promise<ActionResponse> {
    const validatedFields = eventFormSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Por favor, corrija os erros abaixo.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    try {
        const eventUpdate = createEventFromForm(validatedFields.data);
        await dbUpdateEvent(id, eventUpdate);
    } catch (e) {
        return { success: false, message: 'Ocorreu um erro ao atualizar o evento.' };
    }

    revalidatePath('/');
    revalidatePath(`/events/${id}`);
    revalidatePath('/events/new');
    revalidatePath(`/events/${id}/edit`);
    return { success: true, message: 'Evento atualizado com sucesso!', redirectPath: `/events/${id}` };
}


export async function deleteEventAction(id: string): Promise<ActionResponse> {
    try {
        await dbDeleteEvent(id);
        revalidatePath('/');
        revalidatePath('/events/new');
        return { success: true, message: 'Evento deletado com sucesso.', redirectPath: '/' };
    } catch (e) {
        return { success: false, message: 'Ocorreu um erro ao deletar o evento.' };
    }
}

export async function createContratanteAction(data: ContratanteFormValues): Promise<ActionResponse> {
    const validatedFields = contratanteFormSchema.safeParse(data);
    if(!validatedFields.success) {
        return {
            success: false,
            message: 'Por favor, corrija os erros abaixo.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    let newContratante;
    try {
        newContratante = await dbAddContratante(validatedFields.data);
    } catch (e) {
        return { success: false, message: 'Ocorreu um erro ao criar o contratante.' };
    }
    revalidatePath('/contratantes');
    revalidatePath('/events/new');
    return { success: true, message: 'Contratante criado com sucesso.', data: newContratante };
}

export async function updateContratanteAction(id: string, data: ContratanteFormValues): Promise<ActionResponse> {
    const validatedFields = contratanteFormSchema.safeParse(data);
    if(!validatedFields.success) {
        return {
            success: false,
            message: 'Por favor, corrija os erros abaixo.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    try {
        await dbUpdateContratante(id, validatedFields.data);
    } catch (e) {
        return { success: false, message: 'Ocorreu um erro ao atualizar o contratante.' };
    }
    revalidatePath('/contratantes');
    revalidatePath(`/contratantes/[id]/edit`, 'page');
    revalidatePath('/events/new');
    return { success: true, message: 'Contratante atualizado com sucesso.', redirectPath: '/contratantes' };
}

export async function deleteContratanteAction(id: string): Promise<ActionResponse> {
    try {
        const events = await getEvents();
        const contratantes = await dbGetContratantes();
        const contratante = contratantes.find(c => c.id === id);

        if (contratante) {
            const isAssociated = events.some(event => event.contratante === contratante.name);
            if (isAssociated) {
                return {
                    success: false,
                    message: 'Este contratante está associado a um ou mais eventos e não pode ser excluído.',
                };
            }
        }
        
        await dbDeleteContratante(id);
    } catch (e) {
        return { success: false, message: 'Ocorreu um erro ao deletar o contratante.' };
    }
    revalidatePath('/contratantes');
    revalidatePath('/events/new');
    return { success: true, message: 'Contratante deletado com sucesso.' };
}

export async function createArtistaAction(data: ArtistaFormValues): Promise<ActionResponse> {
    const validatedFields = artistaFormSchema.safeParse(data);
    if(!validatedFields.success) {
        return {
            success: false,
            message: 'Por favor, corrija os erros abaixo.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    let newArtista;
    try {
        newArtista = await dbAddArtista(validatedFields.data);
    } catch (e) {
        return { success: false, message: 'Ocorreu um erro ao criar o artista.' };
    }
    revalidatePath('/artistas');
    revalidatePath('/events/new');
    return { success: true, message: 'Artista criado com sucesso.', data: newArtista };
}

export async function updateArtistaAction(id: string, data: ArtistaFormValues): Promise<ActionResponse> {
    const validatedFields = artistaFormSchema.safeParse(data);
    if(!validatedFields.success) {
        return {
            success: false,
            message: 'Por favor, corrija os erros abaixo.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    try {
        await dbUpdateArtista(id, validatedFields.data);
    } catch (e) {
        return { success: false, message: 'Ocorreu um erro ao atualizar o artista.' };
    }
    revalidatePath('/artistas');
    revalidatePath(`/artistas/[id]/edit`, 'page');
    revalidatePath('/events/new');
    return { success: true, message: 'Artista atualizado com sucesso.', redirectPath: '/artistas'};
}

export async function deleteArtistaAction(id: string): Promise<ActionResponse> {
    try {
        const events = await getEvents();
        const artistas = await dbGetArtistas();
        const artista = artistas.find(a => a.id === id);

        if (artista) {
            const isAssociated = events.some(event => event.artista === artista.name);
            if (isAssociated) {
                return {
                    success: false,
                    message: 'Este artista está associado a um ou mais eventos e não pode ser excluído.',
                };
            }
        }
        await dbDeleteArtista(id);
    } catch (e) {
        return { success: false, message: 'Ocorreu um erro ao deletar o artista.' };
    }
    revalidatePath('/artistas');
    revalidatePath('/events/new');
    return { success: true, message: 'Artista deletado com sucesso.' };
}

export async function updateEventStatusAction(eventId: string, type: 'pagar' | 'receber'): Promise<ActionResponse> {
    try {
        const event = await getEventById(eventId);
        if (!event) {
            return { success: false, message: 'Evento não encontrado.' };
        }

        const updateData: Partial<Omit<Event, 'id'>> = {};
        if (type === 'pagar' && event.pagar) {
            updateData.pagar = { ...event.pagar, status: 'pago' };
        } else if (type === 'receber' && event.receber) {
            updateData.receber = { ...event.receber, status: 'recebido' };
        } else {
            return { success: false, message: 'Tipo de atualização inválida para este evento.' };
        }

        await dbUpdateEvent(eventId, updateData);

        revalidatePath('/');
        revalidatePath('/financeiro');
        revalidatePath(`/events/${eventId}`);
        
        return { success: true, message: 'Status do evento atualizado com sucesso!' };

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
        return { success: false, message: `Ocorreu um erro ao atualizar o status: ${errorMessage}` };
    }
}
