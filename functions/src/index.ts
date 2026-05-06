import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { initializeApp } from 'firebase-admin/app';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { QuoteEmail } from './emails/QuoteEmail';

initializeApp();

interface SendPayload {
  leadId: string;
  name: string;
  email: string;
  phone: string;
  zip?: string;
  estimate: {
    low: number;
    high: number;
    systemSizeKw: number;
    panelCount: number;
    annualSavings: number;
    paybackYears: number;
    incentiveDollars: number;
    breakdown: { label: string; amount: number }[];
  };
}

export const sendQuoteEmail = onCall<SendPayload>({ cors: true }, async (req) => {
  const data = req.data;
  if (!data?.email || !data?.estimate) {
    throw new HttpsError('invalid-argument', 'Missing email or estimate');
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.QUOTE_FROM_EMAIL ?? "QuoteNest Demo <onboarding@resend.dev>";

  const html = await render(QuoteEmail({ ...data }));
  const subject = `Thanks for trying the Let's Build My App QuoteNest demo — your estimate inside`;

  if (!apiKey) {
    logger.warn('[sendQuoteEmail] RESEND_API_KEY not set — logging email preview to console.');
    logger.info('Email preview', { to: data.email, subject, htmlLength: html.length });
    return { delivered: false, mocked: true, subject };
  }

  try {
    const resend = new Resend(apiKey);
    const sent = await resend.emails.send({
      from: fromEmail,
      to: data.email,
      subject,
      html,
    });
    logger.info('[sendQuoteEmail] sent', sent);
    return { delivered: true, id: sent.data?.id ?? null };
  } catch (e: any) {
    logger.error('[sendQuoteEmail] failed', e);
    throw new HttpsError('internal', e?.message ?? 'send failed');
  }
});
