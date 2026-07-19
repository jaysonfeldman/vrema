import ProjectsOverview from '@/components/ProjectsOverview';
import WeeklyProjectHours from '@/components/WeeklyProjectHours';
import DateRangeSelect from '@/components/DateRangeSelect';

export default function Projects() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
          <p className="text-sm text-muted-foreground">All projects tracked from your calendar</p>
        </div>
        <DateRangeSelect />
      </div>

      <WeeklyProjectHours />
      <ProjectsOverview title="All projects" />
    </div>
  );
}
