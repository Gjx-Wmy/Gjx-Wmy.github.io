export const isNative=()=>Boolean(globalThis.Capacitor?.isNativePlatform?.());
let plugins;
async function bridge(){if(!plugins){const {registerPlugin}=await import('./vendor/capacitor-core.js');plugins={Filesystem:registerPlugin('Filesystem'),Share:registerPlugin('Share')};}return plugins;}
export async function nativeExport(text,name){const {Filesystem,Share}=await bridge();const file=await Filesystem.writeFile({path:name,data:text,directory:'CACHE',encoding:'utf8'});await Share.share({title:'日日记录备份',text:'请保存这份备份；结构化文件不包含照片。',files:[file.uri],dialogTitle:'保存或分享备份'});}
export async function nativeSharePhoto(blob,name){const {Filesystem,Share}=await bridge(),bytes=new Uint8Array(await blob.arrayBuffer());let raw='';for(let i=0;i<bytes.length;i+=8192)raw+=String.fromCharCode(...bytes.subarray(i,i+8192));const file=await Filesystem.writeFile({path:name,data:btoa(raw),directory:'CACHE'});await Share.share({title:'日日记录照片',files:[file.uri],dialogTitle:'保存或分享照片'});}
