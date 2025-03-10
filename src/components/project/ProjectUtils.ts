export function getProjectTag(projectName: string): string | null {
  // Use a simpler approach to generate a tag from the first word or acronym
  const name = projectName.trim();
  
  if (!name) return null;
  
  // Get first two characters of the project name for a tag
  if (name.length <= 3) return name.toUpperCase();
  
  // Check if it's an acronym (all caps)
  if (name === name.toUpperCase() && name.length <= 5) return name;
  
  // Otherwise, get first 2-3 characters
  return name.substring(0, 3).toUpperCase();
}
