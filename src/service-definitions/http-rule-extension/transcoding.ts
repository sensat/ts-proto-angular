
import { HttpRule } from "./http";

export const getHttpTranscodingParameters = (
  rule: HttpRule | undefined,
  defaultPath: string
): {method: string; path: string; body: string} => {
  if (rule?.post) return {method: 'POST', path: rule.post, body: rule.body};
  if (rule?.get) return {method: 'GET', path: rule.get, body: rule.body};
  if (rule?.patch) return {method: 'PATCH', path: rule.patch, body: rule.body};
  if (rule?.delete)
    return {method: 'DELETE', path: rule.delete, body: rule.body};
  if (rule?.put) return {method: 'PUT', path: rule.put, body: rule.body};
  return {method: 'POST', path: defaultPath, body: '*'};
}
