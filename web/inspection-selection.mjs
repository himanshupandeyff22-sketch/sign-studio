export const inspectionSelectionLimit=100;

// Preserve queue order and selections from other filters. A bulk action is
// atomic: never claim 'all' while silently adding only part of the shown list.
export function selectShownMotions(selection,shown,checked){
  const current=[...new Set(selection)],visible=[...new Set(shown)];
  const next=checked?[...new Set([...current,...visible])]:current.filter(id=>!visible.includes(id));
  return next.length>inspectionSelectionLimit?{ids:current,limited:true}:{ids:next,limited:false};
}
