import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const Schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^\+?[\d\s().-]{7,}$/, 'Please enter a valid phone'),
  consent: z.literal(true, { message: 'Required to send your estimate' }),
});

export type ContactFormValues = z.infer<typeof Schema>;

export function ContactStep({ onSubmit, isSubmitting }: { onSubmit: (v: ContactFormValues) => void; isSubmitting: boolean; }) {
  const { register, handleSubmit, formState: { errors } } = useForm<ContactFormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { name: '', email: '', phone: '', consent: undefined as unknown as true },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div>
        <label className="label">Your name</label>
        <input className="input" placeholder="Jamie Rivera" {...register('name')} />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <div>
        <label className="label">Email</label>
        <input className="input" type="email" placeholder="jamie@example.com" {...register('email')} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <label className="label">Phone</label>
        <input className="input" type="tel" placeholder="(555) 555-1234" {...register('phone')} />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
      </div>
      <label className="flex items-start gap-3 rounded-2xl border-2 border-ink-900/20 bg-white/60 p-3 text-sm">
        <input type="checkbox" className="mt-1 h-5 w-5 rounded border-2 border-ink-900" {...register('consent')} />
        <span>
          I agree to receive my estimate by email and one follow-up SMS. No spam, ever.
        </span>
      </label>
      {errors.consent && <p className="-mt-2 text-xs text-red-600">{errors.consent.message}</p>}
      <button type="submit" disabled={isSubmitting} className="btn-accent text-lg">
        {isSubmitting ? 'Crunching the numbers…' : 'Show me my estimate ✨'}
      </button>
    </form>
  );
}
