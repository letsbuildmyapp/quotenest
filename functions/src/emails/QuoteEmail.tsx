import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Button, Hr, Row, Column,
} from '@react-email/components';
import * as React from 'react';

interface Props {
  name: string;
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

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export function QuoteEmail({ name, estimate }: Props) {
  const first = name.split(' ')[0] || 'there';
  return (
    <Html>
      <Head />
      <Preview>Thanks for trying the Let's Build My App QuoteNest demo — here's your estimate ☀️</Preview>
      <Body style={{ backgroundColor: '#fff9f1', fontFamily: 'Inter, -apple-system, sans-serif', color: '#15151b', margin: 0, padding: '24px 0' }}>
        <Container style={{ maxWidth: 560, background: '#fff', border: '2px solid #15151b', borderRadius: 24, padding: 28 }}>
          <Section>
            <Text style={{ fontWeight: 700, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', color: '#fb7c14', margin: 0 }}>
              QuoteNest · Demo
            </Text>
            <Heading style={{ fontSize: 32, lineHeight: 1.1, margin: '8px 0 0' }}>
              Hey {first} — thanks for trying the demo
            </Heading>
            <Text style={{ color: '#5d5d6d', marginTop: 12, lineHeight: 1.55 }}>
              You just used <strong>QuoteNest</strong>, a portfolio piece by{' '}
              <a href="https://letsbuildmyapp.com" style={{ color: '#5f17d9', fontWeight: 600 }}>letsbuildmyapp.com</a>{' '}
              — an app development agency that builds custom SaaS, marketplaces, and lead engines for businesses like yours.
              Below are the numbers QuoteNest generated from your answers. They're illustrative (we used national averages,
              not your local sun hours or utility rates), but the engine, conditional logic, and lead pipeline are real.
            </Text>
          </Section>
          <Section style={{ background: '#ffefd2', border: '2px solid #15151b', borderRadius: 16, padding: 20, marginTop: 16 }}>
            <Text style={{ margin: 0, fontWeight: 600, color: '#5d5d6d', fontSize: 12, textTransform: 'uppercase' }}>Installed cost (after 30% federal credit)</Text>
            <Text style={{ margin: '6px 0 0', fontSize: 36, fontWeight: 700 }}>
              {fmt(estimate.low)} – {fmt(estimate.high)}
            </Text>
          </Section>
          <Section style={{ marginTop: 16 }}>
            <Row>
              <Column><Stat label="System size" value={`${estimate.systemSizeKw} kW`} /></Column>
              <Column><Stat label="Panels" value={`${estimate.panelCount}`} /></Column>
            </Row>
            <Row>
              <Column><Stat label="Annual savings" value={fmt(estimate.annualSavings)} /></Column>
              <Column><Stat label="Payback" value={`${estimate.paybackYears} yrs`} /></Column>
            </Row>
          </Section>
          <Hr style={{ borderColor: '#e7e7ea', marginTop: 20 }} />
          <Section>
            <Text style={{ fontWeight: 600, marginBottom: 8 }}>Cost breakdown</Text>
            {estimate.breakdown.map((row) => (
              <Row key={row.label}>
                <Column><Text style={{ margin: '4px 0', color: '#5d5d6d' }}>{row.label}</Text></Column>
                <Column align="right">
                  <Text style={{ margin: '4px 0', fontWeight: 600, color: row.amount < 0 ? '#5f17d9' : '#15151b' }}>
                    {row.amount < 0 ? '−' : ''}{fmt(Math.abs(row.amount))}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>
          <Section style={{ marginTop: 24, textAlign: 'center' }}>
            <Button
              href="https://letsbuildmyapp.com"
              style={{ background: '#15151b', color: '#fff9f1', padding: '14px 22px', borderRadius: 14, fontWeight: 700, textDecoration: 'none' }}
            >
              See more demos at letsbuildmyapp.com →
            </Button>
          </Section>
          <Hr style={{ borderColor: '#e7e7ea', marginTop: 24 }} />
          <Section>
            <Text style={{ color: '#5d5d6d', fontSize: 13, lineHeight: 1.55, margin: 0 }}>
              <strong>Want a custom version of this for your business?</strong> Lead-qualification quizzes, dynamic
              pricing engines, CRM pipelines, and email/SMS automation — that's our default stack. Reply to this email
              or visit{' '}
              <a href="https://letsbuildmyapp.com" style={{ color: '#5f17d9', fontWeight: 600 }}>letsbuildmyapp.com</a>{' '}
              to start a project.
            </Text>
          </Section>
          <Text style={{ color: '#a9a9b5', fontSize: 11, textAlign: 'center', marginTop: 24 }}>
            QuoteNest · A portfolio demo by letsbuildmyapp.com · This is a demo email, not a real solar quote.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#f6f6f7', border: '1px solid #e7e7ea', borderRadius: 12, padding: 12, margin: 4 }}>
      <Text style={{ margin: 0, fontSize: 11, color: '#7d7d8d', textTransform: 'uppercase' }}>{label}</Text>
      <Text style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700 }}>{value}</Text>
    </div>
  );
}
