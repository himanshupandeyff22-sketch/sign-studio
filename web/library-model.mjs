// Canonical concepts, source captures and text eligibility are different units.
export function libraryRows(catalog) {
  const ready=new Set(catalog.capabilities.readiness?.motionIds||[]);
  const assets=catalog.registry.filter(a=>a.motionUrl&&a.signLanguage==='ASL');
  const imported=new Set(assets.map(a=>a.source.projectUrl+'#ANIM_GLB/'+a.source.filename));
  const rows=catalog.concepts.map(c=>{
    const captures=assets.filter(a=>a.conceptId===c.id),playable=captures.filter(a=>ready.has(a.id));
    const text=captures.filter(a=>!a.inspectionOnly&&a.inputMappings.length);
    const approved=text.some(a=>a.validated);
    return {id:c.id,label:c.label,definition:c.definition,sense:c.sense,category:c.category||'existing',aliases:[...c.aliases.map(a=>a.text),...(c.inflections||[])],captures,playable,type:playable.length?'avatar':'missing',review:approved?'approved':'pending',textStatus:approved?'Approved mappings':text.length?'Research opt-in only':catalog.capabilities.readiness?.researchConceptIds?.includes(c.id)?'Expanded research opt-in':playable.length?'Inspection only':'Not enabled',sources:c.sources||[]};
  });
  for(const v of catalog.completeExpressions.filter(v=>v.sourceVideoURL&&catalog.capabilities.readiness?.sourceVideoIds.includes(v.id)))rows.push({...v,label:v.text,category:'recordings',type:'video',review:'pending',textStatus:'Separate signer recording',aliases:[],captures:[],playable:[]});
  // Catalogue-only records are a separate discovery filter, never vocabulary.
  for(const s of catalog.sourceCatalog||[])if(!imported.has(s.projectURL+'#'+s.archiveFile))rows.push({...s,label:s.sourceGloss,category:'unclassified',type:'catalogue',review:'pending',textStatus:'Not enabled',aliases:[],captures:[],playable:[]});
  return rows;
}
export function filterLibrary(rows,{search='',category='',type='',review=''}={}){
  const query=search.trim().toLocaleLowerCase();
  return rows.filter(r=>(type?r.type===type:r.type!=='catalogue')&&(!category||r.category===category)&&(!review||(review==='inspection'?r.type==='avatar'&&r.textStatus!=='Research opt-in only'&&r.review!=='approved':r.review===review))&&(!query||[r.label,r.definition,r.sense,...r.aliases].join(' ').toLocaleLowerCase().includes(query)));
}
