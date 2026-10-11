export const uid=()=>globalThis.crypto.randomUUID();
export const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export function validDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)throw Error('日期无效');return value;}
export function createState(){return {schemaVersion:1,revision:0,settings:{name:'我的生活',allergies:'',foodBudgetCents:2000,categoryBudgetCents:0,wake:'07:00',sleep:'23:00',mode:'日常生活',workHours:'',notifications:false,transition:'先稳定现有时间，再逐步提前；保持足够睡眠。'},accounts:[],transactions:[],reserves:[],records:[],tasks:[],adviceTasks:[],loan:{amountCents:null,date:'',status:'未开始还款'}};}
const text=(v,max=5000)=>typeof v==='string'&&v.length<=max;
const cents=v=>Number.isSafeInteger(v)&&v>=0;
export function validateState(s){
 if(!s||s.schemaVersion!==1)throw Error('不支持的备份版本');
 if(!Number.isSafeInteger(s.revision)||s.revision<0)throw Error('存储版本号无效');
 for(const k of ['accounts','transactions','reserves','records','tasks','adviceTasks']){if(!Array.isArray(s[k])||s[k].length>100000)throw Error('数据集合无效：'+k);let ids=new Set();for(const x of s[k]){if(!x||!text(x.id,100)||!x.id||ids.has(x.id))throw Error('记录 ID 无效或重复');ids.add(x.id);}}
 const set=s.settings;if(!set||!text(set.allergies,500)||!text(set.transition,2000)||!text(set.workHours,500)||!text(set.mode,60)||!/^\d{2}:\d{2}$/.test(set.wake)||!/^\d{2}:\d{2}$/.test(set.sleep)||[set.wake,set.sleep].some(t=>Number(t.slice(0,2))>23||Number(t.slice(3))>59)||!cents(set.foodBudgetCents)||!cents(set.categoryBudgetCents)||typeof set.notifications!=='boolean')throw Error('设置无效');
 if(!s.loan||!(s.loan.amountCents===null||cents(s.loan.amountCents))||!text(s.loan.status,100)||!text(s.loan.date,10))throw Error('贷款信息无效');if(s.loan.date)validDate(s.loan.date);
 for(const a of s.accounts)if(!text(a.name,100)||!Number.isSafeInteger(a.openingCents))throw Error('账户无效');
 for(const r of s.reserves){if(!text(r.name,100)||!cents(r.amountCents)||!cents(r.paidCents)||r.paidCents>r.amountCents)throw Error('预留无效');if(r.dueDate)validDate(r.dueDate);}
 for(const t of s.transactions){validDate(t.date);if(!['income','expense','transfer','refund'].includes(t.type)||!cents(t.amountCents)||t.amountCents<=0||!s.accounts.some(a=>a.id===t.accountId)||!text(t.name,200)||!t.name.trim()||!text(t.category,100)||!text(t.necessity,100)||!text(t.createdAt,50)||!Number.isFinite(Date.parse(t.createdAt)))throw Error('交易无效');if(t.type==='transfer'&&(!s.accounts.some(a=>a.id===t.targetAccountId)||t.accountId===t.targetAccountId))throw Error('转账无效');if(t.type==='refund'&&!s.transactions.some(a=>a.id===t.originalId&&a.type==='expense'))throw Error('退款关联无效');if(t.reserveId&&(t.type!=='expense'||!s.reserves.some(r=>r.id===t.reserveId)||!cents(t.releasedCents)||t.releasedCents>t.amountCents))throw Error('预留支付关联无效');}
 for(const t of s.transactions.filter(t=>t.type==='expense'))if(s.transactions.filter(x=>x.type==='refund'&&x.originalId===t.id).reduce((n,x)=>n+x.amountCents,0)>t.amountCents)throw Error('合计退款超过原消费，请处理冲突');
 for(const r of s.records){validDate(r.date);const v=r.values;if(!['meal','exercise','sleep','body','skin','journal'].includes(r.type)||!v||typeof v!=='object'||Array.isArray(v))throw Error('生活记录无效');if(v.note!==undefined&&!text(v.note,3000))throw Error('备注无效');if(r.photoId!==undefined&&!text(r.photoId,100))throw Error('照片引用无效');
 if(r.type==='body'&&(!Number.isFinite(v.weight)||v.weight<20||v.weight>300||typeof v.measured!=='boolean'||(v.waist!==undefined&&(!Number.isFinite(v.waist)||v.waist<30||v.waist>300))))throw Error('体重或腰围无效');
 if(r.type==='exercise'&&(!text(v.name,100)||!Number.isFinite(v.minutes)||v.minutes<=0||v.minutes>1440||!text(v.feeling,500)||!text(v.place,50)))throw Error('运动记录无效');
 if(r.type==='sleep'){const h=(Date.parse(v.end)-Date.parse(v.start))/3600000;if(!text(v.start,50)||!text(v.end,50)||!Number.isFinite(h)||h<=0||h>24)throw Error('睡眠时间无效');}
 if(r.type==='meal'&&(!text(v.name,200)||!text(v.meal,30)||!text(v.portion,200)||!text(v.provider,100)||(v.calories!==undefined&&(!Number.isFinite(v.calories)||v.calories<0||v.calories>20000||!text(v.source,300)||!v.source.trim()))))throw Error('餐食记录无效');
 if(['skin','journal'].includes(r.type)&&(!text(v.text,5000)||!v.text.trim()))throw Error('文字记录无效');}
 for(const t of s.tasks){validDate(t.date);if(!text(t.taskId,100)||!['pending','completed','skipped'].includes(t.status)||(t.snoozeUntil&&!Number.isFinite(Date.parse(t.snoozeUntil))))throw Error('任务无效');}for(const a of s.adviceTasks)if(!text(a.adviceId,100)||typeof a.active!=='boolean')throw Error('建议任务无效');
 return s;
}
