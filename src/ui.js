export function el(tag,attrs={},...children){let n=document.createElement(tag);for(const [k,v]of Object.entries(attrs)){if(k.startsWith('on'))n.addEventListener(k.slice(2),v);else if(k==='class')n.className=v;else if(k==='checked')n.checked=Boolean(v);else if(k==='value')n.value=v;else if(v!==false&&v!=null)n.setAttribute(k,String(v));}for(const c of children.flat(Infinity)){if(c!=null)n.append(c instanceof Node?c:document.createTextNode(String(c)));}return n;}
export const button=(text,action,cls='action')=>el('button',{type:'button',class:cls,onclick:action},text);
export const card=(...children)=>el('article',{class:'card'},children);
export const muted=t=>el('p',{class:'muted'},t);
export const money=c=>'¥'+(c/100).toFixed(2);
export const number=(t,unit='')=>el('div',{class:'number'},t,unit?el('small',{},' '+unit):null);
export const empty=t=>el('div',{class:'empty'},t);
export const intro=(title,subtitle)=>el('div',{class:'intro'},muted(subtitle),el('h1',{},title));
export function field(label,{name,type='text',value='',...attrs}={}){let input=el(type==='textarea'?'textarea':'input',{name,id:'field-'+name,...(type==='textarea'?{}:{type}),...attrs});input.value=value??'';return el('label',{class:'field',for:'field-'+name},label,input);}
export function selectField(label,name,options,value){const sel=el('select',{name,id:'field-'+name},options.map(o=>el('option',{value:o.value??o},o.label??o)));if(value!==undefined)sel.value=value;return el('label',{class:'field',for:'field-'+name},label,sel);}
export const row=(left,right,extra)=>el('div',{class:'row'},el('div',{},left),extra,right);
export async function download(text,name,type){const {isNative,nativeExport}=await import('./native.js');if(isNative())return nativeExport(text,name);const url=URL.createObjectURL(new Blob([text],{type})),a=el('a',{href:url,download:name});a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}
