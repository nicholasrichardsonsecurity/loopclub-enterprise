import { formatBrazilianPhone } from '../helpers/phone.helper';

export interface CustomerListResult {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  internalCode: string | null;
  status: string;
  source: string;
  joinedAt: Date;
  lastAttendedAt: Date | null;
  notes: string | null;
}

export interface CustomerDetailResult extends CustomerListResult {
  birthDate?: string | null;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Formata Customer + CompanyCustomer para item de listagem (sem birthDate).
 */
export function toCustomerListItem(data: {
  id: string;
  customer: { name: string; phoneE164: string; emailNormalized: string | null };
  internalCode: string | null;
  status: string;
  source: string;
  joinedAt: Date;
  lastAttendedAt: Date | null;
  notes: string | null;
}): CustomerListResult {
  return {
    id: data.id,
    name: data.customer.name,
    phone: formatBrazilianPhone(data.customer.phoneE164),
    email: data.customer.emailNormalized,
    internalCode: data.internalCode,
    status: data.status,
    source: data.source,
    joinedAt: data.joinedAt,
    lastAttendedAt: data.lastAttendedAt,
    notes: data.notes,
  };
}

/**
 * Formata resposta de detalhe incluindo birthDate (apenas para company_owner).
 */
export function toCustomerDetailItem(data: {
  id: string;
  customer: { name: string; phoneE164: string; emailNormalized: string | null; birthDate: Date | null };
  internalCode: string | null;
  status: string;
  source: string;
  joinedAt: Date;
  lastAttendedAt: Date | null;
  notes: string | null;
}): CustomerDetailResult {
  return {
    id: data.id,
    name: data.customer.name,
    phone: formatBrazilianPhone(data.customer.phoneE164),
    email: data.customer.emailNormalized,
    internalCode: data.internalCode,
    status: data.status,
    source: data.source,
    joinedAt: data.joinedAt,
    lastAttendedAt: data.lastAttendedAt,
    notes: data.notes,
    birthDate: data.customer.birthDate
      ? data.customer.birthDate.toISOString().split('T')[0]
      : null,
  };
}