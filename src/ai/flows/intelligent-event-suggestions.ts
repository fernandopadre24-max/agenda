'use server';

/**
 * @fileOverview An AI agent that provides intelligent event suggestions based on user input.
 *
 * - getEventSuggestions - A function that takes a partial event description and returns suggested completions.
 * - EventSuggestionInput - The input type for the getEventSuggestions function.
 * - EventSuggestionOutput - The return type for the getEventSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EventSuggestionInputSchema = z.object({
  partialEvent: z
    .string()
    .describe('A partial description of the event for which to provide suggestions.'),
  pastEvents: z
    .string()
    .array()
    .describe('An array of descriptions of past events created by the user.'),
});
export type EventSuggestionInput = z.infer<typeof EventSuggestionInputSchema>;

const EventSuggestionOutputSchema = z.object({
  suggestions: z
    .string()
    .array()
    .describe('An array of suggested event details based on the input and past events.'),
});
export type EventSuggestionOutput = z.infer<typeof EventSuggestionOutputSchema>;

export async function getEventSuggestions(input: EventSuggestionInput): Promise<EventSuggestionOutput> {
  return eventSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'eventSuggestionPrompt',
  input: {schema: EventSuggestionInputSchema},
  output: {schema: EventSuggestionOutputSchema},
  prompt: `You are an intelligent event suggestion assistant. Given a partial event description and a list of past events, you will provide relevant suggestions to complete the event description.

Partial Event Description: {{{partialEvent}}}

Past Events:
{{#each pastEvents}}
- {{{this}}}
{{/each}}

Suggestions:`,
});

const eventSuggestionFlow = ai.defineFlow(
  {
    name: 'eventSuggestionFlow',
    inputSchema: EventSuggestionInputSchema,
    outputSchema: EventSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
