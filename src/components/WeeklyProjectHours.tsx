import { useProjectStats } from '@/hooks/useProjectStats';
import { formatHours } from '@/lib/eventStats';

export default function WeeklyProjectHours() {
  const { weeklySummaries } = useProjectStats();

  if (weeklySummaries.every((week) => week.totalHours === 0)) {
    return null;
  }

  const projectNames = Array.from(
    new Set(weeklySummaries.flatMap((week) => week.projects.map((project) => project.name)))
  );

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-medium">Weekly time by project</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Hours tracked from calendar events named like <code className="text-zinc-700">mx#design user flows</code>
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-left">
              <th className="px-4 py-3 font-medium text-zinc-600">Project</th>
              {weeklySummaries.map((week) => (
                <th key={week.weekLabel} className="px-4 py-3 font-medium text-zinc-600 text-right">
                  {week.weekLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projectNames.map((projectName) => (
              <tr key={projectName} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 font-medium">{projectName}</td>
                {weeklySummaries.map((week) => {
                  const project = week.projects.find((entry) => entry.name === projectName);
                  return (
                    <td key={`${projectName}-${week.weekLabel}`} className="px-4 py-3 text-right font-mono text-zinc-700">
                      {project ? formatHours(project.hours) : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="bg-zinc-50 font-medium">
              <td className="px-4 py-3">Total</td>
              {weeklySummaries.map((week) => (
                <td key={`total-${week.weekLabel}`} className="px-4 py-3 text-right font-mono">
                  {formatHours(week.totalHours)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
