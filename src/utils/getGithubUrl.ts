export function getGithubUrl(): string {
  return import.meta.env.PUBLIC_GITHUB_URL || 'https://github.com/penpenguin';
}
