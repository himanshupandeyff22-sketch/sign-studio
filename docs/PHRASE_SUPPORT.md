# Why words play but phrases do not

The current application is a vocabulary preview player. It does not yet produce
complete ASL sentences. This is a data/grammar limitation, not a failure to
accept multi-sentence input.

There are now 78 motion files and 122 candidate concepts. Research mode enables only
the four original, explicitly unverified previews. The other 74 recordings
remain inspection-only. Validated mode has zero approved signs. The only
candidate request-help template is pending and has no complete motion sequence.

| Input in Research | Actual result | Missing requirement |
| --- | --- | --- |
| I need help. | HELP preview only | Speaker/need coverage and an approved complete phrase plan |
| I want water. | No playback | WANT/WATER target motions await review; complete phrase plan missing |
| I need assistance. | HELP meaning candidate recognised; no playback | ASL alias equivalence and complete phrase plan need review |
| I do not want help. | Whole negative clause held | Reviewed negative phrase; positive HELP cannot replace it |
| Hi, How are you? | Hello illustration only in Demo; no Research phrase playback | Complete greeting construction, appropriate HOW/YOU variants, transitions and nonmanuals need review |

The new **Phrase support** panel reports each input segment separately:
available previews, terms not played, imported motions awaiting review and
missing/pending phrase templates. The API exposes the same information in
`phraseReadiness`. A word match never sets `completeTranslation: true`.
That flag requires the actual reviewed-template playback path and its approved
clips. Camera/manual asset inspection receives no phrase-translation claim.

The user's exact greeting was tested. Capitalized question words now stay in
meaning resolution rather than being mistaken for possible proper names.
The panel retains the original question mark. Existing name-hint protection,
negation holds and all motion approval gates remain unchanged.

The [ASLU HOW reference](https://www.lifeprint.com/asl101/pages-signs/h/how.htm)
describes the greeting construction and distinguishes friendly from serious
wellbeing inquiries through nonmanuals. This is reference evidence, not approval
of the project's generic HOW capture. A concrete pending proposal is saved in
`imports/phrase-proposals/greeting-wellbeing-review.json`. It contains no enabled
motion sequence or copied reference media and is not a runtime import batch.
It must not silently substitute the existing manner-question sense for the
complete greeting.

## Practical next implementation

Build a small phrase pack first, rather than treat a larger filename list as a
general translator. Select common complete intents such as requesting help,
requesting water, introducing oneself and asking a location. For each one:

1. Identify the intended meaning, participants, tense, negation and question type.
2. Obtain permitted complete phrase motion or an ASL-reviewed sentence template
   using reviewed constituent clips. Record variant and exact source/license.
3. Preserve facial/body features, signing location, direction, handshape,
   transitions and contact after retargeting to Aarav.
4. Have a fluent signer or qualified interpreter review the exact rendered
   phrase, its English mapping and variants. Record the reviewer/date/findings.
5. Add it through the existing canonical importer/template/review architecture.
   Deduplicate; keep uncertain additions pending; test positive, negative,
   ambiguous and paraphrased examples before enabling it.

Only then broaden sentence planning and vocabulary coverage. An English synonym
match, an LLM-generated gloss list, larger recognition dataset or a sequence of
isolated word clips cannot approve a phrase or supply its grammatical features.
Current templates deliberately remain pending rather than invent those motions.

Verification: project check and the full **51-test** suite passed, including
four new phrase-readiness tests and a 500-word/200-segment input. Browser
verification of the exact greeting showed the partial-phrase explanation on
360×800 mobile with no horizontal overflow. No console errors were captured.
Screenshot: `docs/screenshots/phrase-support-mobile.jpg`. This diagnostic and
reference research do not imply new ASL approval or working sentence translation.
