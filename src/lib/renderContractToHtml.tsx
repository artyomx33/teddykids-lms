import React from 'react';
import { renderToString } from 'react-dom/server';
import ContractTemplate, { ContractParams } from '@/components/ContractTemplate';

export type QueryParams = Record<string, any>;

export function mapQueryToParams(q: QueryParams): ContractParams {
  return {
    firstName: q?.firstName || '',
    lastName: q?.lastName || '',
    birthDate: q?.birthDate || '',
    bsn: q?.bsn || '',
    address: q?.address || '',
    startDate: q?.startDate || '',
    endDate: q?.endDate || '',
    duration: q?.duration || '',
    cityOfEmployment: q?.cityOfEmployment || 'Leiden',
    position: q?.position || '',
    manager: q?.manager || '',
    scale: q?.scale ?? '',
    trede: q?.trede ?? '',
    bruto36h: typeof q?.bruto36h === 'number' ? q.bruto36h : Number(q?.bruto36h || 0),
    hoursPerWeek: typeof q?.hoursPerWeek === 'number' ? q.hoursPerWeek : Number(q?.hoursPerWeek || 0),
    grossMonthly: typeof q?.grossMonthly === 'number' ? q.grossMonthly : Number(q?.grossMonthly || 0),
    reiskostenPerMonth: typeof q?.reiskostenPerMonth === 'number' ? q.reiskostenPerMonth : Number(q?.reiskostenPerMonth || 0),
    notes: q?.notes || '',
  };
}

export function renderContractToHtml(q: QueryParams): string {
  const props = mapQueryToParams(q || {});
  return renderToString(<ContractTemplate {...props} />);
}
