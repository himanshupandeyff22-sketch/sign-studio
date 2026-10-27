# Additive vocabulary import report — 12 October 2026

Latest: the subsequent everyday batch added **50 unique inspection assets**
and **74 candidate concepts**, resulting in 122 concepts, 141 aliases,
122 inflections and 78 motions, with zero reviewed enabled signs. Nine
conflicting placeholder entries and five static files were excluded. Repeat
import added nothing. Separate topic metadata updates also repeated without
changes. See [EVERYDAY_EXPANSION.md](EVERYDAY_EXPANSION.md) and the immutable
`asl-everyday-20261012-*` / `asl-topic-metadata-20261012-*` reports. The tables
below preserve the earlier two-batch history.

Runtime source of truth: `web/vocabulary-manifest.json`. `docs/sign-asset-manifest.json` remains the historical four-clip review snapshot. No original motion file was replaced. New files have immutable content-addressed paths. Human review and default activation were never inferred from load success.

| Stage | Candidate concepts | English aliases | Inflections | Recorded assets | Approved enabled signs |
| --- | ---: | ---: | ---: | ---: | ---: |
| Original project | No concept architecture | Existing literal registry mappings | No reviewed inflection mappings | 4 | 0 |
| Canonical seed / first batch baseline | 23 | 41 | 14 | 4 | 0 |
| First import | 23 | 41 | 14 | 9 | 0 |
| Conversation expansion | 48 | 66 | 49 | 28 | 0 |

Aliases and inflections are **candidate meaning forms**, not approved ASL synonyms or grammatical morphology. Only identified, dated review records can merge a verified alias. The separate 938-entry archive catalog consists of source filenames/provenance, not 938 verified words, concepts or animations. CRC/size in that index is not SHA256 deduplication; downloaded assets receive full hash/content checks before import.

| Outcome | First batch | Conversation batch | Meaning |
| --- | ---: | ---: | --- |
| Added unique motion assets | 5 | 19 | Inspection only; all 24 pending technical completion and human ASL review |
| Merged | 0 | 0 | No unreviewed synonym was merged or approval invented |
| Skipped | 1 | 0 | Existing HELP already registered; same file retained |
| Conflicting | 1 | 4 | LIKE reused FRIEND's static payload; GOOD/COME/STOP reused another placeholder payload; LEARN reused NAME's placeholder payload |
| Rejected | 2 | 2 | FRIEND/ME and NEED/NAME had no animation tracks |
| Pending alias proposals | 1 | 0 | “help out” has no existing ASL equivalence approval |

First additions: FAMILY, WATER, REMEMBER, PLEASE, YOU. Conversation additions: DRINK, WANT, WHERE, WHO, WHEN, WHY, HOW, BAD, HAPPY, SAD, WORK, SCHOOL, HOME, MOTHER, SISTER, KNOW, UNDERSTAND, GO, SORRY. None is enabled for automatic text translation. The four old explicit research previews and six procedural illustrations remain available with their warnings.

Dry-run reports were saved before either commit in `docs/import-reports/`. Each batch was then dry-run and committed again: **zero new assets, zero merges, zero concepts and zero discovery records** on the repeat commit. Existing runtime hashes and the manifest were unchanged. Rejected/conflicting candidates remain listed instead of being silently replaced or relabelled.

The importer checks source GLB SHA256, canonical language/concept/sense, stable ID, source provenance across previous imports, normalized motion content, explicit variant ID/label, safe asset path, inverse-bind/finger tracks and retarget diagnostics. Motion identity ignores JSON/track order, metadata/filename and equivalent quaternion sign. It conservatively flags different normalized motions for the same variant. Alternate rig encodings are not proven equivalent by this fingerprint; uncertain equivalence requires review.

Distinct ASL variants must be linked to the same canonical concept with a new labelled variant after review, not overwrite the old clip. English homonyms remain separate concepts. Variant labels currently describe source captures and do not claim regional identification.

Reports are immutable, the import lock is exclusive, stale dry-runs are rejected, and assets use exclusive writes. Current importer accepts only the independently verified 3D-LEX ASL source/license combination; another source needs its own artifact-specific verification adapter. Automatic internet scraping or license guessing is deliberately absent.

## Repeatable commands

Run from the repository root. The shipped assets run without the private download cache. To repeat the importer locally, first fetch the required public samples into the specified ignored cache directories; original HELP cache is also required by the first batch.

```sh
node scripts/asl-archive.mjs --remote --output=concept-batch-20261012 --sample=water,family,remember,please,you,like,me,friend
node scripts/asl-archive.mjs --remote --output=conversation-batch-20261012 --sample=drink,want,need,where,who,when,why,how,good,bad,happy,sad,work,school,home,mother,sister,name,know,understand,learn,go,come,stop,sorry
node scripts/import-asl-motion.mjs --batch=imports/asl-conversation-20261012.json --report=docs/import-reports/new-dry-run.json
node scripts/import-asl-motion.mjs --batch=imports/asl-conversation-20261012.json --commit --plan=docs/import-reports/new-dry-run.json --report=docs/import-reports/new-commit.json
```

Use fresh report names: prior evidence is preserved. Inspect the dry-run before commit. A changed batch/library requires a fresh dry-run. `seed-vocabulary.mjs` is a bootstrap helper that skips an existing manifest; do not remove the live manifest to reseed it. Future additions go through batch proposals and the canonical importer.
