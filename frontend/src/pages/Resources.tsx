import { SAFETY_RESOURCES, OFFICIAL_REPORTING_LINKS } from '../data/content';
import { Card } from '../components/ui';

export default function ResourcesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Safety Resources</h1>
      <p className="text-sm text-gray-500 dark:text-brand-300 mb-6">
        Practical guidance to help you stay safe. SheShield provides information and support — it is not a replacement for emergency services or professional help.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {SAFETY_RESOURCES.map((r) => (
          <Card key={r.title} className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{r.icon}</span>
              <h2 className="font-bold text-gray-900 dark:text-white">{r.title}</h2>
            </div>
            <ul className="space-y-2">
              {r.items.map((i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-brand-300">
                  <span className="text-brand-600 mt-0.5">•</span>{i}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-3">🔗 Official Reporting Channels</h2>
        <p className="text-sm text-gray-500 dark:text-brand-300 mb-4">
          Use these official links to report abusive accounts or content directly to the platform.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {OFFICIAL_REPORTING_LINKS.map((l) => (
            <a
              key={l.name}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-brand-50 dark:bg-brand-800/50 text-brand-700 dark:text-brand-200 hover:bg-brand-100 transition-colors"
            >
              <span className="font-medium">{l.name}</span>
              <span>↗</span>
            </a>
          ))}
        </div>
      </Card>

      <Card className="mt-6 p-6 border-red-200 dark:border-red-900">
        <h2 className="font-bold text-gray-900 dark:text-white mb-2">🚨 In a real emergency</h2>
        <p className="text-sm text-gray-600 dark:text-brand-300">
          Call <a href="tel:1122" className="font-bold text-red-600">1122</a> (Rescue),{' '}
          <a href="tel:15" className="font-bold text-red-600">15</a> (Police), or use the SheShield SOS system.
          If you are in immediate danger, call emergency services first.
        </p>
      </Card>
    </div>
  );
}
