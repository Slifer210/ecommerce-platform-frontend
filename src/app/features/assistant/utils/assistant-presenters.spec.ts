import {
  assistantOrderStatusLabel,
  buildAssistantChatRequest,
  coerceAssistantReply,
  normalizeAssistantReply
} from './assistant-presenters';
import { AssistantReply } from '../models/assistant.models';

describe('assistant-presenters', () => {
  it('buildAssistantChatRequest trims the question payload', () => {
    expect(buildAssistantChatRequest('  necesito ayuda  ')).toEqual({
      question: 'necesito ayuda'
    });
  });

  it('normalizeAssistantReply converts nullable collections to arrays', () => {
    const reply: AssistantReply = {
      intent: 'UNKNOWN',
      message: 'No entendi',
      readOnly: true,
      order: null,
      orders: null,
      products: null,
      knowledge: null,
      hints: null
    };

    expect(normalizeAssistantReply(reply)).toEqual({
      ...reply,
      orders: [],
      products: [],
      hints: []
    });
  });

  it('assistantOrderStatusLabel maps known statuses to UI labels', () => {
    expect(assistantOrderStatusLabel('PROCESSING')).toBe('Confirmando pago');
    expect(assistantOrderStatusLabel('UNKNOWN_STATUS')).toBe('UNKNOWN_STATUS');
  });

  it('coerceAssistantReply adapts a plain principal-agent answer', () => {
    expect(coerceAssistantReply({
      answer: 'Tu pedido esta en camino'
    })).toEqual({
      intent: 'HELP',
      message: 'Tu pedido esta en camino',
      readOnly: true,
      order: null,
      orders: null,
      products: null,
      knowledge: null,
      hints: null
    });
  });

  it('coerceAssistantReply keeps python-agent generic answers as UNKNOWN when route is not mappable', () => {
    expect(coerceAssistantReply({
      response: 'Puedo ayudarte con eso.',
      route: 'assistant_router',
      handled_by: 'python-agent',
      confidence: 0.92,
      fallback_used: false,
      sources: ['faq']
    })).toEqual({
      intent: 'UNKNOWN',
      message: 'Puedo ayudarte con eso.',
      readOnly: true,
      order: null,
      orders: null,
      products: null,
      knowledge: null,
      hints: null
    });
  });

  it('coerceAssistantReply maps python-agent routes when they are explicit', () => {
    expect(coerceAssistantReply({
      message: 'Encontre coincidencias para tu busqueda.',
      route: 'product_search',
      handled_by: 'python-agent'
    }).intent).toBe('PRODUCT_SEARCH');
  });
});
