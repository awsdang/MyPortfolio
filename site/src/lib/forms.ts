export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The Google Forms behind Write to Aws and Report a bug; responses land in each form's Responses tab.
 * Ids come from the form's public page (the `entry.*` names in its FB_PUBLIC_LOAD_DATA_).
 */
const FORMS = {
  contact: {
    id: "1FAIpQLSdIoDcilIUFA-qLJooKhfSGvB7BNUT_FVT6SUc3XEcgMgq5EQ",
    fields: { email: "entry.186354244", subject: "entry.471930018", message: "entry.1058274475", page: "entry.181373919" },
  },
  bug: {
    id: "1FAIpQLSfICvo_MPzaKyLZvk2Ok83sF9S3J27reODKasCacMMyKEn8OQ",
    fields: { email: "entry.1044723174", message: "entry.1693264513", device: "entry.1724091333" },
  },
} as const;

type FormName = keyof typeof FORMS;

export type Sent = { ok: true } | { ok: false; error: string; offline?: boolean };

/** Posts the answers to one of the forms. `offline` = worth offering email instead. */
export async function sendForm<F extends FormName>(form: F, values: Record<keyof (typeof FORMS)[F]["fields"], string>): Promise<Sent> {
  const { id, fields } = FORMS[form];
  const body = new URLSearchParams();
  for (const [key, entry] of Object.entries(fields)) body.append(entry, values[key as keyof typeof values] ?? "");
  try {
    // Google sends no CORS headers, so the reply is opaque: getting it there counts as sent
    await fetch(`https://docs.google.com/forms/d/e/${id}/formResponse`, { method: "POST", mode: "no-cors", body });
    return { ok: true };
  } catch {
    return { ok: false, error: "Your message couldn't be sent. Check your connection or use the email link.", offline: true };
  }
}
