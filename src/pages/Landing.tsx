import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SunHouse, Spark } from '../components/Illustration';

export default function Landing() {
  return (
    <div className="min-h-full">
      <Header />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-10 pb-16 md:px-6 md:pt-20 md:pb-24">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="pill bg-grape-200"
              >
                <Spark className="h-3.5 w-3.5" /> Instant solar quotes
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="display mt-4 text-[2.75rem] sm:text-5xl md:text-7xl font-bold leading-[0.95]"
              >
                Solar that <span className="bg-sun-300 px-2 inline-block -rotate-1 rounded-xl">pencils&nbsp;out</span>, in 90 seconds.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-5 max-w-md text-lg text-ink-600"
              >
                Answer a few friendly questions and we'll generate a real cost estimate, payback timeline, and incentive breakdown for your home — no calls, no pressure.
              </motion.p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/quiz" className="btn-accent text-lg">
                  Start the quote → <span className="text-sm font-medium text-ink-700">90 sec</span>
                </Link>
                <a href="#how" className="btn-ghost">See how it works</a>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-600">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sun-500" /> No credit card</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-grape-500" /> One-time email</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-ink-900" /> Real numbers</div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring' }}
              className="relative"
            >
              <SunHouse className="w-full max-w-md mx-auto rounded-3xl border-2 border-ink-900 shadow-pop" />
              <div className="absolute -top-4 -right-2 rotate-6 rounded-full bg-grape-400 px-4 py-2 text-cream font-display text-xl shadow-pop-sm border-2 border-ink-900">
                ~$2,400/yr saved
              </div>
              <div className="absolute -bottom-4 left-4 -rotate-3 pill bg-white">
                ⚡ 7.2kW system
              </div>
            </motion.div>
          </div>
        </section>

        {/* How */}
        <section id="how" className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
          <h2 className="display text-3xl md:text-5xl font-bold">How it works</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { n: '01', t: 'Take the quiz', d: 'Six to nine quick questions about your home, roof, and goals.', emoji: '📝' },
              { n: '02', t: 'Get your estimate', d: 'Real price range, system size, and federal incentives — instantly.', emoji: '✨' },
              { n: '03', t: 'Talk if you want', d: 'A specialist will follow up only if you opt in. No spam, ever.', emoji: '💬' },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="display text-sm text-ink-400">{s.n}</span>
                  <span className="text-3xl">{s.emoji}</span>
                </div>
                <p className="display mt-3 text-2xl font-bold">{s.t}</p>
                <p className="mt-2 text-ink-600">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
          <div className="card grid gap-6 p-8 md:grid-cols-4 md:p-12">
            {[
              { v: '$2,200', l: 'Avg. annual savings' },
              { v: '7–9 yr', l: 'Typical payback' },
              { v: '30%', l: 'Federal tax credit' },
              { v: '90 sec', l: 'To your estimate' },
            ].map((s) => (
              <div key={s.l}>
                <p className="display text-4xl font-bold">{s.v}</p>
                <p className="text-sm text-ink-600 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-4 pb-20 md:px-6">
          <h2 className="display text-3xl md:text-5xl font-bold">Common questions</h2>
          <div className="mt-6 grid gap-3">
            {[
              { q: 'Is this a real quote?', a: 'It\'s a transparent estimate based on industry-standard cost-per-watt and your inputs. A specialist confirms the final number after a roof inspection.' },
              { q: 'What if I rent?', a: 'Solar requires owning the home. We can keep your info on file in case that changes.' },
              { q: 'Will you spam me?', a: 'No. One email with your estimate and one follow-up. Unsubscribe instantly.' },
              { q: 'Is this real?', a: 'QuoteNest is a portfolio demo built by Lets Build My App to showcase what we ship. The estimate engine is real, the brand is fictional.' },
            ].map((f, i) => (
              <details key={i} className="card p-5 group">
                <summary className="font-semibold cursor-pointer flex items-center justify-between">
                  {f.q}
                  <span className="text-ink-400 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-ink-600">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/quiz" className="btn-accent text-lg">Get my estimate →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
