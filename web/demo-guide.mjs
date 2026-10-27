// Curated routes through the existing, explicitly opt-in research vocabulary.
// These examples never approve an asset or bypass the server's review gate.
const preferred = ['3dlex-help', '3dlex-yes', '3dlex-no', '3dlex-love'];
export function demoExamples(catalog) {
  return preferred.flatMap(id => {
    const entry = catalog?.registry?.find(item => item.id === id);
    if (catalog?.capabilities?.readiness&&!catalog.capabilities.readiness.motionIds.includes(id)) return [];
    if (!entry || entry.signLanguage !== 'ASL' || entry.vocabularyMode !== 'research' || entry.inspectionOnly || !entry.motionUrl || !entry.inputMappings?.[0]) return [];
    const sense = entry.requiresSense ? entry.senseOptions?.[0] : null;
    if (entry.requiresSense && !sense) return [];
    return [{id, text:entry.inputMappings[0], label:id === '3dlex-no' ? 'No · negative answer' : id === '3dlex-love' ? 'Love · affection' : entry.gloss.replace(/^./, letter => letter.toUpperCase()), meaning:entry.meaning.replace(/^Candidate mapping:\s*/, ''), senses:sense ? {[entry.meaningKey]:sense.id} : {}}];
  });
}
