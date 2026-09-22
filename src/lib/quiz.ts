/**
 * Where the quiz outcome is kept for the rest of the session. It rides along
 * to the checkout so a sale can be traced back to the pattern the buyer
 * reported, which is the whole point of asking.
 */
export const QUIZ_SEGMENT_KEY = "hp_seg";

export const QUIZ_SEGMENTS = ["coffee", "time", "relapse", "focus"] as const;
export type QuizSegment = (typeof QUIZ_SEGMENTS)[number];

export type QuizAnswers = Record<string, string>;

export function isQuizSegment(value: string): value is QuizSegment {
  return (QUIZ_SEGMENTS as readonly string[]).includes(value);
}

/**
 * Picks which of the four diagnoses to show.
 *
 * Order matters and is deliberate. Someone who has tried and quit before is
 * told that first, because for them the missing piece is follow-through, not
 * information — telling them about coffee again repeats what already failed.
 * Lack of time comes next, since a routine that does not fit is abandoned
 * whatever the diagnosis. Only then do the symptom-based answers apply.
 */
export function segmentFor(answers: QuizAnswers): QuizSegment {
  const tried = answers.tentativas;
  if (tried === "dias" || tried === "semanas") return "relapse";

  if (answers.tempo === "menos5" || answers.atrapalha === "tempo") return "time";

  const coffee = answers.cafe;
  if (coffee === "2-3" || coffee === "4+" || answers.atrapalha === "doce") return "coffee";

  if (answers.atrapalha === "foco" || answers.acordar === "cansado") return "focus";

  // Everything else is the mildest complaint, and energy is what they named.
  return answers.atrapalha === "energia" ? "coffee" : "focus";
}

/** Only ids and values defined by the quiz are kept, so nothing arbitrary is stored. */
export function sanitizeAnswers(raw: unknown, allowed: { id: string; options: { value: string }[] }[]): QuizAnswers {
  if (!raw || typeof raw !== "object") return {};
  const input = raw as Record<string, unknown>;
  const out: QuizAnswers = {};
  for (const question of allowed) {
    const value = input[question.id];
    if (typeof value === "string" && question.options.some((o) => o.value === value)) {
      out[question.id] = value;
    }
  }
  return out;
}
