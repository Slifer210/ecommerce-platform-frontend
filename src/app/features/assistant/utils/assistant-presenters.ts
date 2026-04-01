import {
  AssistantChatRequest,
  AssistantIntent,
  AssistantReply,
  AssistantReplyViewModel
} from '../models/assistant.models';

export const ASSISTANT_EMPTY_SUGGESTIONS = [
  'Cual es el estado de mi ultimo pedido',
  'Muestrame mis ultimas ordenes',
  'Busca auriculares inalambricos',
  'Que puedes hacer por mi'
] as const;

const ASSISTANT_INTENTS: AssistantIntent[] = [
  'ORDER_STATUS',
  'LIST_ORDERS',
  'PRODUCT_SEARCH',
  'HELP',
  'UNKNOWN'
];

export function buildAssistantChatRequest(
  question: string
): AssistantChatRequest {
  return {
    question: question.trim()
  };
}

export function normalizeAssistantReply(
  reply: AssistantReply
): AssistantReplyViewModel {
  return {
    ...reply,
    orders: reply.orders ?? [],
    products: reply.products ?? [],
    hints: reply.hints ?? []
  };
}

export function coerceAssistantReply(raw: unknown): AssistantReply {
  const payload = unwrapAssistantPayload(raw);
  const readOnly = payload['readOnly'];
  const order = payload['order'];
  const orders = payload['orders'];
  const products = payload['products'];
  const knowledge = payload['knowledge'];
  const hints = payload['hints'];
  const intent = inferAssistantIntent(payload);

  return {
    intent,
    message: extractAssistantMessage(payload),
    readOnly: typeof readOnly === 'boolean' ? readOnly : true,
    order: isObject(order) ? order as unknown as AssistantReply['order'] : null,
    orders: Array.isArray(orders) ? orders as NonNullable<AssistantReply['orders']> : null,
    products: Array.isArray(products) ? products as NonNullable<AssistantReply['products']> : null,
    knowledge: isObject(knowledge) ? knowledge as unknown as NonNullable<AssistantReply['knowledge']> : null,
    hints: Array.isArray(hints)
      ? hints.filter((hint): hint is string => typeof hint === 'string')
      : null
  };
}

export function assistantOrderStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Pago pendiente';
    case 'PROCESSING':
      return 'Confirmando pago';
    case 'PAID':
      return 'Pagado';
    case 'SHIPPED':
      return 'Enviado';
    case 'COMPLETED':
      return 'Entregado';
    case 'CANCELLED':
      return 'Cancelado';
    default:
      return status;
  }
}

export function assistantOrderStatusTone(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-700';
    case 'PROCESSING':
      return 'bg-sky-50 text-sky-700';
    case 'PAID':
      return 'bg-emerald-50 text-emerald-700';
    case 'SHIPPED':
      return 'bg-blue-50 text-blue-700';
    case 'COMPLETED':
      return 'bg-green-50 text-green-700';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function unwrapAssistantPayload(raw: unknown): Record<string, unknown> {
  if (!isObject(raw)) {
    return {};
  }

  const data = raw['data'];
  if (isObject(data)) {
    return data;
  }

  const reply = raw['reply'];
  if (isObject(reply)) {
    return reply;
  }

  return raw;
}

function inferAssistantIntent(payload: Record<string, unknown>): AssistantIntent {
  const intent = payload['intent'];
  if (typeof intent === 'string' && ASSISTANT_INTENTS.includes(intent as AssistantIntent)) {
    return intent as AssistantIntent;
  }

  if (isObject(payload['order'])) {
    return 'ORDER_STATUS';
  }

  if (Array.isArray(payload['orders'])) {
    return 'LIST_ORDERS';
  }

  if (Array.isArray(payload['products'])) {
    return 'PRODUCT_SEARCH';
  }

  const routeIntent = inferAssistantIntentFromRoute(payload['route']);
  if (routeIntent) {
    return routeIntent;
  }

  if (!hasPythonAgentMetadata(payload) && (isObject(payload['knowledge']) || hasTextField(payload))) {
    return 'HELP';
  }

  return 'UNKNOWN';
}

function extractAssistantMessage(payload: Record<string, unknown>): string {
  const directCandidates = [
    payload['message'],
    payload['answer'],
    payload['response'],
    payload['content'],
    payload['text']
  ];

  for (const candidate of directCandidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }

  const knowledge = payload['knowledge'];
  if (isObject(knowledge) && typeof knowledge['answer'] === 'string' && knowledge['answer'].trim().length > 0) {
    return knowledge['answer'];
  }

  return 'No pude interpretar la respuesta del asistente principal.';
}

function hasTextField(payload: Record<string, unknown>): boolean {
  return ['message', 'answer', 'response', 'content', 'text']
    .some(key => typeof payload[key] === 'string' && (payload[key] as string).trim().length > 0);
}

function inferAssistantIntentFromRoute(route: unknown): AssistantIntent | null {
  if (typeof route !== 'string' || route.trim().length === 0) {
    return null;
  }

  const normalizedRoute = route
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_');

  if (containsAll(normalizedRoute, ['ORDER', 'STATUS'])) {
    return 'ORDER_STATUS';
  }

  if (
    containsAll(normalizedRoute, ['ORDER', 'LIST']) ||
    containsAll(normalizedRoute, ['LIST', 'ORDERS']) ||
    containsAll(normalizedRoute, ['ORDER', 'HISTORY'])
  ) {
    return 'LIST_ORDERS';
  }

  if (
    containsAll(normalizedRoute, ['PRODUCT', 'SEARCH']) ||
    containsAll(normalizedRoute, ['PRODUCT', 'FIND']) ||
    containsAll(normalizedRoute, ['PRODUCT', 'LOOKUP']) ||
    containsAll(normalizedRoute, ['CATALOG', 'SEARCH'])
  ) {
    return 'PRODUCT_SEARCH';
  }

  if (
    normalizedRoute.includes('HELP') ||
    normalizedRoute.includes('KNOWLEDGE') ||
    normalizedRoute.includes('FAQ') ||
    normalizedRoute.includes('SUPPORT')
  ) {
    return 'HELP';
  }

  return null;
}

function hasPythonAgentMetadata(payload: Record<string, unknown>): boolean {
  return (
    typeof payload['route'] === 'string' ||
    typeof payload['handled_by'] === 'string' ||
    typeof payload['confidence'] === 'number' ||
    typeof payload['fallback_used'] === 'boolean' ||
    Array.isArray(payload['sources'])
  );
}

function containsAll(value: string, fragments: string[]): boolean {
  return fragments.every(fragment => value.includes(fragment));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
