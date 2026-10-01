import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
const characters = [
  { text: '一', meaning: 'yī · một', strokes: ['M40 100 L160 100'], tips: ['Nét ngang: từ trái sang phải.'] },
  { text: '二', meaning: 'èr · hai', strokes: ['M55 65 L145 65','M35 135 L165 135'], tips: ['Ngang trên: trái sang phải.','Ngang dưới: trái sang phải, dài hơn nét trên.'] },
  { text: '三', meaning: 'sān · ba', strokes: ['M45 45 L155 45','M60 95 L140 95','M30 150 L170 150'], tips: ['Ngang trên.','Ngang giữa ngắn hơn.','Ngang dưới dài nhất.'] },
  { text: '十', meaning: 'shí · mười', strokes: ['M35 80 L165 80','M100 30 L100 175'], tips: ['Ngang: trái sang phải.','Sổ: trên xuống dưới, đi qua nét ngang.'] },
  { text: '人', meaning: 'rén · người', strokes: ['M105 30 Q95 110 35 170','M100 75 Q120 140 170 170'], tips: ['Phẩy: từ trên xuống trái.','Mác: từ chỗ giao xuống phải.'] },
]
export function StrokePractice() {
  const [index,setIndex]=useState(0),[step,setStep]=useState(1),[paths,setPaths]=useState<string[]>([]),[show,setShow]=useState(true)
  const drawing=useRef(false)
  const selected=characters[index]
  function point(e:PointerEvent<SVGSVGElement>) {const rect=e.currentTarget.getBoundingClientRect();return `${Math.max(0,Math.min(200,(e.clientX-rect.left)/rect.width*200)).toFixed(1)} ${Math.max(0,Math.min(200,(e.clientY-rect.top)/rect.height*200)).toFixed(1)}`}
  return <section id="strokes" className="pronunciation-panel" aria-label="Luyện nét chữ Hán"><h2>Luyện nét chữ Hán</h2><p>Chọn chữ, xem lần lượt thứ tự nét rồi dùng chuột hoặc ngón tay viết theo. Đây là bài tự luyện, chưa chấm chữ và chưa lưu bản viết.</p><label>Chữ cần luyện <select value={index} onChange={e=>{setIndex(Number(e.target.value));setStep(1);setPaths([]);drawing.current=false}}>{characters.map((c,i)=><option key={c.text} value={i}>{c.text} · {c.meaning}</option>)}</select></label><p>Nét {step}/{selected.strokes.length}: {selected.tips[step-1]}</p>
    <svg viewBox="0 0 200 200" role="img" aria-label={`Ô tập viết chữ ${selected.text}`} style={{display:'block',width:'min(100%, 340px)',border:'1px solid #bbb',background:'#fff',touchAction:'none'}} onPointerDown={e=>{if(e.button!==0)return;const position=point(e);e.currentTarget.setPointerCapture(e.pointerId);drawing.current=true;setPaths(p=>[...p,`M${position}`])}} onPointerMove={e=>{if(!drawing.current)return;const position=point(e);setPaths(p=>p.map((path,i)=>i===p.length-1?`${path} L${position}`:path))}} onPointerUp={()=>{drawing.current=false}} onPointerCancel={()=>{drawing.current=false}} onLostPointerCapture={()=>{drawing.current=false}}>
      <path d="M0 100 H200 M100 0 V200 M0 0 L200 200 M200 0 L0 200" stroke="#ddd" strokeDasharray="3 4" fill="none" />
      {show && selected.strokes.slice(0,step).map((path,i)=><path key={i} d={path} stroke={i===step-1?'#df9a82':'#d7ded9'} strokeWidth="9" fill="none" strokeLinecap="round" />)}
      {paths.map((path,i)=><path key={i} d={path} stroke="#214d40" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
    </svg><p><button disabled={step===1} onClick={()=>setStep(step-1)}>Nét trước</button> <button disabled={step===selected.strokes.length} onClick={()=>setStep(step+1)}>Nét tiếp theo</button> <button onClick={()=>setShow(!show)}>{show?'Ẩn mẫu':'Hiện mẫu'}</button> <button disabled={!paths.length} onClick={()=>setPaths(p=>p.slice(0,-1))}>Bỏ nét vừa viết</button> <button onClick={()=>setPaths([])}>Xóa bản viết</button></p><p>Có thể luyện trên giấy theo hướng dẫn thứ tự nét ở trên nếu không dùng chuột hoặc cảm ứng.</p>
  </section>
}
