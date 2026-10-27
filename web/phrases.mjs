export const languages = {
  en: {label:'English',name:'Alex',locale:'en-US',color:'#568a73',hair:'#423930',style:0,phrases:['Hello','Thank you','Yes','No','Help','I love you']},
  hi: {label:'हिन्दी · Hindi',name:'Aarav',locale:'hi-IN',color:'#c98d4f',hair:'#292c2b',style:1,phrases:['नमस्ते','धन्यवाद','हाँ','नहीं','मदद','मैं तुमसे प्यार करता हूँ']},
  es: {label:'Español · Spanish',name:'Leo',locale:'es-ES',color:'#628baf',hair:'#5c4431',style:2,phrases:['Hola','Gracias','Sí','No','Ayuda','Te quiero']},
  fr: {label:'Français · French',name:'Camille',locale:'fr-FR',color:'#a282af',hair:'#693f2e',style:3,phrases:['Bonjour','Merci','Oui','Non','Aide','Je t’aime']},
  bn: {label:'বাংলা · Bengali',name:'Riya',locale:'bn-IN',color:'#bd717b',hair:'#292c2b',style:4,phrases:['নমস্কার','ধন্যবাদ','হ্যাঁ','না','সাহায্য','আমি তোমাকে ভালোবাসি']},
  ta: {label:'தமிழ் · Tamil',name:'Kavin',locale:'ta-IN',color:'#559796',hair:'#292c2b',style:5,phrases:['வணக்கம்','நன்றி','ஆம்','இல்லை','உதவி','நான் உன்னை காதலிக்கிறேன்']}
};
export const gestures = ['hello','thanks','yes','no','help','love'];
export function normalize(text) { return text.normalize('NFC').trim().toLocaleLowerCase().replace(/[.!?।]+$/u,'').trim().replace(/[’']/g,"'").replace(/\s+/gu,' '); }
export function resolvePhrase(text, language) {
  if (!languages[language]) return null;
  const value = normalize(text);
  if (!value) return null;
  const index = languages[language].phrases.findIndex(p => normalize(p) === value);
  if (index >= 0) return gestures[index];
  const aliases = { hi: {namaste:'hello',dhanyavad:'thanks',haan:'yes',nahi:'no',madad:'help'}, en:{hi:'hello',thanks:'thanks','i love you':'love'}, fr:{salut:'hello'} };
  const entries=aliases[language];
  return entries&&Object.hasOwn(entries,value)?entries[value]:null;
}
export const cameraGestures = {Open_Palm:'hello',Thumb_Up:'yes',Thumb_Down:'no',Victory:'hello',ILoveYou:'love'};
