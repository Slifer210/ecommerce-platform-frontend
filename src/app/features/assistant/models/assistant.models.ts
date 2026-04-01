export type AssistantIntent =
  | 'ORDER_STATUS'
  | 'LIST_ORDERS'
  | 'PRODUCT_SEARCH'
  | 'HELP'
  | 'UNKNOWN';

export interface AssistantChatRequest {
  question: string;
}

export interface AssistantOrderStatusView {
  orderId: string;
  status: string;
  total: number;
  createdAt: string;
  paidAt: string | null;
  itemsCount: number;
  lastStatusChange: string | null;
}

export interface AssistantOrderView {
  orderId: string;
  status: string;
  total: number;
  createdAt: string;
  itemsCount: number;
}

export interface AssistantProductView {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number | null;
  mainImageUrl: string | null;
}

export interface AssistantKnowledgeAnswer {
  title: string;
  answer: string;
  available: boolean;
}

export interface AssistantReply {
  intent: AssistantIntent;
  message: string;
  readOnly: boolean;
  order: AssistantOrderStatusView | null;
  orders: AssistantOrderView[] | null;
  products: AssistantProductView[] | null;
  knowledge: AssistantKnowledgeAnswer | null;
  hints: string[] | null;
}

export interface AssistantReplyViewModel
  extends Omit<AssistantReply, 'orders' | 'products' | 'hints'> {
  orders: AssistantOrderView[];
  products: AssistantProductView[];
  hints: string[];
}

export interface AssistantConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
  reply?: AssistantReplyViewModel;
}
