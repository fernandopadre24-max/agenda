// src/ai/flows/smart-search.ts
'use server';
/**
 * @fileOverview A smart search flow for events using natural language.
 *
 * - smartSearch - A function that handles the event search process using natural language.
 * - SmartSearchInput - The input type for the smartSearch function.
 * - SmartSearchOutput - The return type for the smartSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartSearchInputSchema = z.object({
  query: z.string().describe('The natural language search query.'),
});
export type SmartSearchInput = z.infer<typeof SmartSearchInputSchema>;

const SmartSearchOutputSchema = z.object({
  eventDescription: z
    .string()
    .describe(
      'A concise description of the events that match the search query.'
    ),
  relevantEvents: z
    .array(z.string())
    .describe(
      'An array of event names or identifiers that are most relevant to the search query.'
    ),
});
export type SmartSearchOutput = z.infer<typeof SmartSearchOutputSchema>;

export async function smartSearch(input: SmartSearchInput): Promise<SmartSearchOutput> {
  return smartSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartSearchPrompt',
  input: {schema: SmartSearchInputSchema},
  output: {schema: SmartSearchOutputSchema},
  prompt: `You are an AI assistant designed to help users find events based on their natural language search queries.

Given the user's query: "{{{query}}}", your task is to:

1.  Understand the intent behind the query.
2.  Identify relevant events that match the query.
3.  Provide a concise description of the matching events.
4.  List the names or identifiers of the most relevant events.

Description of matching events:

Relevant Events:`, // The output should populate
});

const smartSearchFlow = ai.defineFlow(
  {
    name: 'smartSearchFlow',
    inputSchema: SmartSearchInputSchema,
    outputSchema: SmartSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
