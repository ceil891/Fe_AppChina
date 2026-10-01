const drafts = new Map<string, { text: string; expires: number }>()
const key = (owner: string, record: string) => owner + ':' + record
export function readNoteDraft(owner: string, record: string, now = Date.now()) {
 const value = drafts.get(key(owner, record))
 if (!value || value.expires <= now) { drafts.delete(key(owner, record)); return undefined }
 return value.text
}
export function writeNoteDraft(owner: string, record: string, text: string, now = Date.now()) {
 for (const [id, value] of drafts) if (value.expires <= now) drafts.delete(id)
 drafts.delete(key(owner, record))
 if (drafts.size >= 100) drafts.delete(drafts.keys().next().value!)
 drafts.set(key(owner, record), { text: text.slice(0, 2000), expires: now + 30 * 60 * 1000 })
}
export function removeNoteDraft(owner: string, record: string) { drafts.delete(key(owner, record)) }
export function clearNoteDrafts() { drafts.clear() }
