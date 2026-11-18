const KEY='fusionArenaSaveV1';
const defaults={completed:{},items:[],wins:0};
export function save(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(defaults)}catch{return {...defaults,completed:{},items:[]}}}
export function writeSave(data){try{localStorage.setItem(KEY,JSON.stringify(data));}catch(err){console.warn('Sauvegarde indisponible',err)}}
