import { useEffect, useState } from 'react';
import { Button, Card } from '../components/ui';

const QUESTIONS = [
  {
    id: 'q1',
    required: true,
    title: 'What is your age group?',
    type: 'radio',
    options: ['Under 15', '15–17', '18–20', '21+'],
  },
  {
    id: 'q2',
    required: true,
    title: 'How often do you use social media or messaging apps?',
    type: 'radio',
    options: ['Less than 1 hour/day', '1–2 hours/day', '2–4 hours/day', '4+ hours/day'],
  },
  {
    id: 'q3',
    required: true,
    title: 'Which platforms do you use most?',
    type: 'checkbox',
    options: ['Instagram', 'WhatsApp', 'TikTok', 'Facebook', 'Snapchat', 'Other'],
  },
  {
    id: 'q4',
    required: true,
    title: 'Have you ever received a suspicious or unwanted message online?',
    type: 'radio',
    options: ['Yes', 'No', 'Not sure'],
  },
  {
    id: 'q5',
    required: true,
    title: 'Which online problems do you think young people face most often?',
    type: 'checkbox',
    options: ['Fake accounts / impersonation', 'Scams or fake offers', 'Unwanted messages', 'Cyberbullying', 'Threatening or abusive messages', 'Edited/misused photos', 'Hacked accounts', 'Privacy/data misuse', 'Other'],
  },
  {
    id: 'q6',
    required: true,
    title: 'If you received a suspicious message, would you know what to do?',
    type: 'radio',
    options: ['Definitely', 'Probably', 'Not sure', 'Probably not', 'No'],
  },
  {
    id: 'q7',
    required: true,
    title: 'Do you know how to properly report an abusive or suspicious account on social media?',
    type: 'radio',
    options: ['Yes', 'Somewhat', 'No'],
  },
  {
    id: 'q8',
    required: true,
    title: 'Do you know what information should NOT be shared online?',
    type: 'radio',
    options: ['Yes, clearly', 'Somewhat', 'Not really'],
  },
  {
    id: 'q9',
    required: true,
    title: 'If you faced an online safety problem, whom would you most likely ask for help?',
    type: 'radio',
    options: ['Parent/guardian', 'Friend', 'Teacher', 'Older sibling/relative', 'Official platform support', 'Nobody', 'Other'],
  },
  {
    id: 'q10',
    required: true,
    title: 'What makes people hesitate to report online problems?',
    type: 'checkbox',
    options: ['Fear of being judged', 'Not knowing where to report', 'Fear that the situation may get worse', 'Embarrassment', 'Lack of evidence/knowledge', 'Not trusting the reporting process', 'Thinking "it\'s not serious enough"', 'Other'],
  },
  {
    id: 'q11',
    required: true,
    title: 'Which features would be most useful in a digital-safety platform like SheShield?',
    type: 'checkbox',
    max: 5,
    options: ['Step-by-step help', 'Scam/suspicious-message awareness checker', 'Reporting guidance', 'Evidence-preservation guidance', 'Trusted-contact feature', 'Privacy & security tips', 'Cyber-safety learning resources', 'List of official support/reporting channels', 'Anonymous support information'],
  },
  {
    id: 'q12',
    required: true,
    title: 'How comfortable would you be using a platform that does NOT require your name or phone number?',
    type: 'radio',
    options: ['Very comfortable', 'Comfortable', 'Neutral', 'Uncomfortable', 'Very uncomfortable'],
  },
  {
    id: 'q13',
    required: true,
    title: 'In your opinion, what is ONE digital-safety problem that young people face today but people don\'t talk about enough?',
    type: 'textarea',
    placeholder: 'Type your answer here...',
  },
  {
    id: 'q14',
    required: true,
    title: 'Would you use SheShield if it provided simple, private guidance when you face an online safety problem?',
    type: 'radio',
    options: ['Definitely yes', 'Probably yes', 'Maybe', 'Probably not', 'No'],
  },
  {
    id: 'q15',
    required: true,
    title: 'What would make SheShield more useful or trustworthy to you?',
    type: 'textarea',
    placeholder: 'Type your answer here...',
  },
];

export default function SurveyPage() {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  function setValue(qid: string, value: string, checked: boolean, type: string, max?: number) {
    setAnswers((prev) => {
      const current = prev[qid];
      if (type === 'checkbox') {
        if (checked) {
          const list = Array.isArray(current) ? [...current] : [];
          if (max && list.length >= max) {
            alert(`You can choose up to ${max}.`);
            return prev;
          }
          list.push(value);
          return { ...prev, [qid]: list };
        }
        const list = Array.isArray(current) ? current.filter((v) => v !== value) : [];
        return { ...prev, [qid]: list };
      }
      return { ...prev, [qid]: value };
    });
    setErrors((prev) => ({ ...prev, [qid]: false }));
  }

  function validate(): boolean {
    const next: Record<string, boolean> = {};
    let ok = true;
    for (const q of QUESTIONS) {
      const a = answers[q.id];
      const empty = Array.isArray(a) ? !a || a.length === 0 : !a || a.trim() === '';
      if (q.required && empty) {
        next[q.id] = true;
        ok = false;
      }
    }
    setErrors(next);
    return ok;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      const first = QUESTIONS.find((q) => errors[q.id] ?? (Array.isArray(answers[q.id]) ? !answers[q.id]?.length : !answers[q.id]?.toString().trim()));
      if (first) document.getElementById(first.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    // Simulate submission (anonymous survey -> logged for review)
    console.log('Survey responses:', answers);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Digital Safety & Awareness Survey</h1>
        <p className="mt-2 text-gray-500 dark:text-brand-300">Help us understand the challenges young people face online. Your responses are anonymous.</p>
      </div>

      {submitted ? (
        <Card className="p-10 text-center border-2 border-green-500">
          <div className="text-5xl mb-3">✓</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h2>
          <p className="text-gray-500 dark:text-brand-300">Your responses have been recorded. Your feedback will help us build a safer digital world.</p>
          <Button className="mt-6" onClick={() => { setSubmitted(false); setAnswers({}); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Take the survey again</Button>
        </Card>
      ) : (
        <>
          <Card className="p-6 mb-8">
            <p className="text-sm text-gray-500 dark:text-brand-300">
              We are conducting this anonymous survey to understand the digital safety challenges faced by young people, especially girls. Your responses will help us design a safer and more useful digital-support system.
            </p>
            <p className="mt-2 text-sm text-accent-600 font-semibold">⚠ Please do not share your name, phone number, passwords, screenshots, or other private information.</p>
          </Card>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {QUESTIONS.map((q) => (
              <div key={q.id} id={q.id} className={`scroll-mt-24 ${errors[q.id] ? 'ring-2 ring-red-400 rounded-2xl' : ''}`}>
                <Card className={`p-6 ${errors[q.id] ? 'border-red-300' : ''}`}>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="bg-brand-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {q.id.replace('q', '')}
                    </span>
                    <h3 className={`font-bold text-gray-900 dark:text-white text-base ${q.required ? 'after:content-["*"] after:text-accent-500 after:ml-0.5' : ''}`}>
                      {q.title}
                    </h3>
                  </div>

                  {errors[q.id] && <p className="text-xs text-red-600 mb-3">Please answer this question.</p>}

                  {q.type === 'radio' && (
                    <div className="flex flex-col gap-2">
                      {q.options!.map((opt) => (
                        <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-brand-100 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-800/40 cursor-pointer">
                          <input type="radio" name={q.id} value={opt} onChange={(e) => setValue(q.id, opt, e.target.checked, 'radio')} className="accent-brand-600 w-5 h-5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-brand-200">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'checkbox' && (
                    <div className="grid sm:grid-cols-2 gap-2">
                      {q.options!.map((opt) => (
                        <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-brand-100 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-800/40 cursor-pointer">
                          <input type="checkbox" value={opt} onChange={(e) => setValue(q.id, opt, e.target.checked, 'checkbox', q.max)} className="accent-brand-600 w-5 h-5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-brand-200">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'textarea' && (
                    <textarea
                      rows={4}
                      placeholder={q.placeholder}
                      onChange={(e) => setValue(q.id, e.target.value, true, 'textarea')}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-brand-700 bg-white dark:bg-brand-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  )}

                  {errors[q.id] && <p className="mt-2 text-xs text-red-600">This question is required.</p>}
                </Card>
              </div>
            ))}

            <div className="text-center pt-4">
              <Button type="submit" size="lg" className="px-10">Submit Survey</Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
