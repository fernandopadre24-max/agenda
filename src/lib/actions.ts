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
    getEvents
} from './data';
import type { Event } from './types';
import { redirect } from 'next/navigation';

const eventFormSchema = z.object({
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
  } catch (e) {
    return { success: false, message: 'Ocorreu um erro ao criar o evento.' };
  }
  
  revalidatePath('/');
  redirect('/');
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
    redirect(`/events/${id}`);
}


export async function deleteEventAction(id: string) {
    let shouldRedirect = false;
    try {
        await dbDeleteEvent(id);
        revalidatePath('/');
        shouldRedirect = true;
    } catch (e) {
        return { message: 'Ocorreu um erro ao deletar o evento.' };
    }

    if (shouldRedirect) {
        redirect('/');
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
    try {
        await dbAddContratante(validatedFields.data);
    } catch (e) {
        return { success: false, message: 'Ocorreu um erro ao criar o contratante.' };
    }
    revalidatePath('/contratantes');
    redirect('/contratantes');
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
    redirect('/contratantes');
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
    try {
        await dbAddArtista(validatedFields.data);
    } catch (e) {
        return { success: false, message: 'Ocorreu um erro ao criar o artista.' };
    }
    revalidatePath('/artistas');
    redirect('/artistas');
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
    redirect('/artistas');
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
    return { success: true, message: 'Artista deletado com sucesso.' };
}
