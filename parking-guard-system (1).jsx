import { useState, useEffect, useMemo } from "react";

const REGISTERED_PLATES = [
  "กข 1234", "กข 5678", "ขค 9999", "คง 1111", "งจ 2222",
  "จฉ 3333", "ฉช 4444", "ชซ 5555", "ABC 123", "XYZ 999"
];

const MOCK_RECORDS = (() => {
  const plates = ["กข 1234", "ขค 9999", "ZZZ 001", "งจ 2222", "AAA 555", "กข 1234", "ZZZ 001", "BBB 999", "คง 1111", "ZZZ 001", "AAA 555", "กข 1234"];
  const now = new Date();
  return plates.map((plate, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(i * 4.5));
    const dateStr = d.toISOString().slice(0, 10);
    const registered = REGISTERED_PLATES.includes(plate);
    return {
      id: i + 1,
      plate,
      date: dateStr,
      time: `${8 + (i % 10)}:${i % 2 === 0 ? "00" : "30"}`,
      registered,
      timestamp: d.getTime(),
      dateDisplay: d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }),
    };
  });
})();

const mockSendLine = async (message) => {
  await new Promise(r => setTimeout(r, 800));
  return { ok: true };
};

const getNowStr = () => new Date().toTimeString().slice(0, 5);

const MONTH_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export default function ParkingSystem() {
  const [plate, setPlate] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(getNowStr());
  const [records, setRecords] = useState(MOCK_RECORDS);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState("entry");
  const [recordTab, setRecordTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    const interval = setInterval(() => setTime(getNowStr()), 30000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const normalizePlate = (p) => p.trim().toUpperCase().replace(/\s+/g, " ");
  const isRegistered = (p) => REGISTERED_PLATES.some(r => normalizePlate(r) === normalizePlate(p));

  const handleSubmit = async () => {
    if (!plate.trim()) { showToast("กรุณากรอกทะเบียนรถ", "error"); return; }
    const norm = normalizePlate(plate);
    const registered = isRegistered(norm);
    const record = {
      id: Date.now(), plate: norm, date, time, registered,
      timestamp: new Date(`${date}T${time}`).getTime(),
      dateDisplay: new Date(date).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }),
    };
    setRecords(prev => [record, ...prev]);
    if (!registered) {
      setLoading(true);
      await mockSendLine(`🚨 พบรถไม่ได้ลงทะเบียน!\n🚗 ทะเบียน: ${norm}\n📅 วันที่: ${record.dateDisplay}\n🕐 เวลา: ${time} น.`);
      setLoading(false);
      showToast(`แจ้งเตือน LINE — ${norm}`, "warn");
    } else {
      showToast(`บันทึกสำเร็จ — ${norm}`, "success");
    }
    setPlate("");
  };

  // ── Dashboard stats ──────────────────────────────────────────
  const unregisteredCount = records.filter(r => !r.registered).length;

  const monthlyData = useMemo(() => {
    const map = {};
    records.forEach(r => {
      const key = r.date.slice(0, 7); // "YYYY-MM"
      if (!map[key]) map[key] = { total: 0, unregistered: 0 };
      map[key].total++;
      if (!r.registered) map[key].unregistered++;
    });
    const sorted = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
    return sorted.map(([key, v]) => {
      const [yr, mo] = key.split("-");
      return { key, label: `${MONTH_TH[+mo - 1]} ${+yr + 543}`, ...v };
    });
  }, [records]);

  const maxMonthly = useMemo(() => Math.max(...monthlyData.map(m => m.total), 1), [monthlyData]);

  const duplicatePlates = useMemo(() => {
    const count = {};
    records.forEach(r => { count[r.plate] = (count[r.plate] || 0) + 1; });
    return Object.entries(count)
      .filter(([, c]) => c > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([plate, count]) => ({
        plate,
        count,
        registered: isRegistered(plate),
        lastSeen: records.find(r => r.plate === plate)?.dateDisplay || "-",
      }));
  }, [records]);

  const monthRecords = useMemo(() =>
    records.filter(r => r.date.startsWith(selectedMonth)),
    [records, selectedMonth]
  );

  const filteredRecords = records.filter(r =>
    r.plate.includes(normalizePlate(search)) ||
    r.dateDisplay.includes(search) ||
    r.time.includes(search)
  );

  const availableMonths = useMemo(() => {
    const s = new Set(records.map(r => r.date.slice(0, 7)));
    return [...s].sort().reverse();
  }, [records]);

  return (
    <div style={{ minHeight: "100vh", background: "#080d1a", fontFamily: "'IBM Plex Sans Thai','IBM Plex Sans',sans-serif", color: "#e2e8f0" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#080d1a}::-webkit-scrollbar-thumb{background:#1e2d4a;border-radius:3px}
        .inp{width:100%;background:#0c1422;border:1.5px solid #1a2840;border-radius:10px;padding:13px 16px;color:#e2e8f0;font-size:15px;font-family:inherit;outline:none;transition:border-color .2s,box-shadow .2s}
        .inp:focus{border-color:#3b7eff;box-shadow:0 0 0 3px rgba(59,126,255,.15)}
        .inp::placeholder{color:#2e4060}
        .btn-primary{width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#3b7eff,#6c3bff);color:#fff;font-size:16px;font-weight:600;font-family:inherit;cursor:pointer;transition:opacity .2s,transform .1s;letter-spacing:.02em}
        .btn-primary:hover{opacity:.88}.btn-primary:active{transform:scale(.98)}.btn-primary:disabled{opacity:.5;cursor:not-allowed}
        .tab-btn{flex:1;padding:10px 4px;border:none;background:transparent;color:#4a6488;font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap}
        .tab-btn.active{color:#3b7eff;border-bottom-color:#3b7eff}
        .sub-tab-btn{padding:7px 14px;border-radius:8px;border:1px solid #1a2840;background:transparent;color:#4a6488;font-size:12px;font-weight:500;font-family:inherit;cursor:pointer;transition:all .2s}
        .sub-tab-btn.active{background:#1a2840;color:#e2e8f0;border-color:#2a3a60}
        .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;font-family:'IBM Plex Mono',monospace;letter-spacing:.04em}
        .badge-ok{background:#0a2016;color:#34d399;border:1px solid #065f46}
        .badge-warn{background:#220e03;color:#fb923c;border:1px solid #7c2d12}
        .badge-dup{background:#1a1030;color:#a78bfa;border:1px solid #5b21b6}
        .record-card{background:#0c1422;border:1px solid #162030;border-radius:12px;padding:13px 15px;display:flex;align-items:center;gap:12px;transition:border-color .2s;animation:slideIn .3s ease}
        .record-card:hover{border-color:#253550}
        .record-card.unregistered{border-left:3px solid #ef4444}
        .record-card.registered{border-left:3px solid #22c55e}
        .stat-card{flex:1;background:#0c1422;border:1px solid #162030;border-radius:14px;padding:16px;text-align:center}
        .plate-display{font-family:'IBM Plex Mono',monospace;font-size:16px;font-weight:600;color:#f1f5ff;letter-spacing:.08em;background:#0f1e36;padding:3px 9px;border-radius:6px;border:1px solid #1a2d4a}
        .loading-spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;display:inline-block;animation:spin .7s linear infinite}
        @keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes barGrow{from{width:0}to{width:var(--w)}}
        .dup-card{background:#0c1422;border:1px solid #162030;border-radius:12px;padding:13px 15px;animation:slideIn .3s ease}
        .dup-card.highlight{border-color:#5b21b633;background:#0f0c1e}
        .month-bar-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #0f1828}
        .month-bar-row:last-child{border-bottom:none}
        .section-title{font-size:11px;font-weight:700;color:#3b6eff;letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:6px}
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed",top:20,right:20,zIndex:9999,background:toast.type==="error"?"#200a0a":toast.type==="warn"?"#1e1005":"#081a10",border:`1px solid ${toast.type==="error"?"#7f1d1d":toast.type==="warn"?"#78350f":"#064e3b"}`,color:toast.type==="error"?"#fca5a5":toast.type==="warn"?"#fdba74":"#6ee7b7",padding:"12px 18px",borderRadius:"12px",fontSize:"13px",fontWeight:500,maxWidth:"300px",boxShadow:"0 8px 30px rgba(0,0,0,.6)",animation:"toastIn .3s ease",lineHeight:1.5 }}>
          {toast.type==="warn"?"📤 ":toast.type==="error"?"❌ ":"✅ "}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background:"linear-gradient(180deg,#0d1628,#080d1a)",borderBottom:"1px solid #141f36",padding:"18px 16px 0" }}>
        <div style={{ maxWidth:500,margin:"0 auto" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
            <div style={{ width:40,height:40,borderRadius:"11px",background:"linear-gradient(135deg,#3b7eff22,#6c3bff22)",border:"1px solid #3b7eff44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>🏢</div>
            <div>
              <div style={{ fontSize:17,fontWeight:700,color:"#f1f5ff" }}>ระบบบันทึกข้อมูลรถ</div>
              <div style={{ fontSize:11,color:"#3b7eff" }}>PARKING SECURITY SYSTEM</div>
            </div>
          </div>
          <div style={{ display:"flex",gap:8,margin:"14px 0 0" }}>
            <div className="stat-card">
              <div style={{ fontSize:22,fontWeight:700,color:"#f1f5ff" }}>{records.length}</div>
              <div style={{ fontSize:10,color:"#3a5070",marginTop:2 }}>รถทั้งหมด</div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize:22,fontWeight:700,color:"#22c55e" }}>{records.length - unregisteredCount}</div>
              <div style={{ fontSize:10,color:"#3a5070",marginTop:2 }}>ลงทะเบียน</div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize:22,fontWeight:700,color:"#ef4444" }}>{unregisteredCount}</div>
              <div style={{ fontSize:10,color:"#3a5070",marginTop:2 }}>ไม่ลงทะเบียน</div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize:22,fontWeight:700,color:"#a78bfa" }}>{duplicatePlates.length}</div>
              <div style={{ fontSize:10,color:"#3a5070",marginTop:2 }}>ทะเบียนซ้ำ</div>
            </div>
          </div>
          <div style={{ display:"flex",borderBottom:"1px solid #141f36",marginTop:14 }}>
            <button className={`tab-btn ${tab==="entry"?"active":""}`} onClick={()=>setTab("entry")}>🚗 บันทึกรถเข้า</button>
            <button className={`tab-btn ${tab==="records"?"active":""}`} onClick={()=>setTab("records")}>📊 ประวัติ & Dashboard</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:500,margin:"0 auto",padding:"18px 16px" }}>

        {/* ── ENTRY TAB ── */}
        {tab === "entry" && (
          <div style={{ display:"flex",flexDirection:"column",gap:15 }}>
            <div>
              <label style={{ fontSize:11,color:"#4a6488",fontWeight:600,letterSpacing:".06em",display:"block",marginBottom:7 }}>📅 วันที่</label>
              <input type="date" className="inp" value={date} onChange={e=>setDate(e.target.value)} style={{ colorScheme:"dark" }} />
            </div>
            <div>
              <label style={{ fontSize:11,color:"#4a6488",fontWeight:600,letterSpacing:".06em",display:"block",marginBottom:7 }}>🕐 เวลา</label>
              <input type="time" className="inp" value={time} onChange={e=>setTime(e.target.value)} style={{ colorScheme:"dark" }} />
            </div>
            <div>
              <label style={{ fontSize:11,color:"#4a6488",fontWeight:600,letterSpacing:".06em",display:"block",marginBottom:7 }}>🚗 ทะเบียนรถ</label>
              <input className="inp" placeholder="เช่น กข 1234 / ABC 123" value={plate} onChange={e=>setPlate(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} style={{ fontSize:18,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:".08em" }} />
              {plate.trim() && (
                <div style={{ marginTop:7,display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ fontSize:11,color:"#4a6488" }}>สถานะ:</span>
                  {isRegistered(normalizePlate(plate))
                    ? <span className="badge badge-ok">✓ ลงทะเบียนแล้ว</span>
                    : <span className="badge badge-warn">⚠ ไม่ได้ลงทะเบียน</span>}
                  {duplicatePlates.find(d=>d.plate===normalizePlate(plate)) && (
                    <span className="badge badge-dup">🔁 เคยเข้ามาแล้ว</span>
                  )}
                </div>
              )}
            </div>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? <><span className="loading-spinner" style={{ marginRight:8 }} />กำลังแจ้ง LINE...</> : "✔ บันทึกและตรวจสอบ"}
            </button>
            <div style={{ background:"#0c1422",border:"1px solid #162030",borderRadius:12,padding:"13px 15px",fontSize:12,color:"#3a5878",lineHeight:1.7 }}>
              <div style={{ color:"#3b7eff",fontWeight:600,marginBottom:5,fontSize:11 }}>ℹ️ วิธีใช้งาน</div>
              กรอกวันที่ เวลา และทะเบียนรถ แล้วกด <strong style={{ color:"#6a9acc" }}>บันทึก</strong>
            </div>
          </div>
        )}

        {/* ── RECORDS TAB ── */}
        {tab === "records" && (
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>

            {/* Sub-tabs */}
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              {[["dashboard","📊 Dashboard"],["monthly","📅 รายเดือน"],["duplicates","🔁 ทะเบียนซ้ำ"],["list","📋 รายการ"]].map(([key,label])=>(
                <button key={key} className={`sub-tab-btn ${recordTab===key?"active":""}`} onClick={()=>setRecordTab(key)}>{label}</button>
              ))}
            </div>

            {/* ─ DASHBOARD ─ */}
            {recordTab === "dashboard" && (
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>

                {/* Quick stats row */}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                  {[
                    { label:"รถเข้าเดือนนี้",value:monthlyData.at(-1)?.total??0,color:"#60a5fa" },
                    { label:"แจ้งเตือน LINE",value:unregisteredCount,color:"#f87171" },
                    { label:"ทะเบียนไม่ซ้ำ",value:new Set(records.map(r=>r.plate)).size,color:"#34d399" },
                    { label:"ทะเบียนเข้าซ้ำ",value:duplicatePlates.length,color:"#a78bfa" },
                  ].map(s=>(
                    <div key={s.label} style={{ background:"#0c1422",border:"1px solid #162030",borderRadius:12,padding:"14px 16px" }}>
                      <div style={{ fontSize:26,fontWeight:700,color:s.color }}>{s.value}</div>
                      <div style={{ fontSize:11,color:"#3a5070",marginTop:3 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Monthly bar chart */}
                <div style={{ background:"#0c1422",border:"1px solid #162030",borderRadius:14,padding:"16px" }}>
                  <div className="section-title">📊 รถเข้ารายเดือน</div>
                  {monthlyData.length === 0
                    ? <div style={{ color:"#2e4060",fontSize:13,textAlign:"center",padding:"20px 0" }}>ยังไม่มีข้อมูล</div>
                    : monthlyData.map(m => (
                      <div key={m.key} className="month-bar-row">
                        <div style={{ width:72,fontSize:11,color:"#4a6488",flexShrink:0 }}>{m.label}</div>
                        <div style={{ flex:1,display:"flex",flexDirection:"column",gap:3 }}>
                          <div style={{ height:10,background:"#0f1828",borderRadius:5,overflow:"hidden" }}>
                            <div style={{ height:"100%",width:`${(m.total/maxMonthly)*100}%`,background:"linear-gradient(90deg,#3b7eff,#6c3bff)",borderRadius:5,transition:"width .6s ease" }} />
                          </div>
                          <div style={{ height:6,background:"#0f1828",borderRadius:5,overflow:"hidden" }}>
                            <div style={{ height:"100%",width:`${(m.unregistered/maxMonthly)*100}%`,background:"linear-gradient(90deg,#ef4444,#dc2626)",borderRadius:5,transition:"width .6s ease" }} />
                          </div>
                        </div>
                        <div style={{ width:30,fontSize:12,fontWeight:600,color:"#c8d8f0",textAlign:"right",flexShrink:0 }}>{m.total}</div>
                      </div>
                    ))
                  }
                  <div style={{ display:"flex",gap:16,marginTop:12 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#4a6488" }}><div style={{ width:12,height:6,borderRadius:3,background:"linear-gradient(90deg,#3b7eff,#6c3bff)" }}/> รวม</div>
                    <div style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#4a6488" }}><div style={{ width:12,height:6,borderRadius:3,background:"linear-gradient(90deg,#ef4444,#dc2626)" }}/> ไม่ลงทะเบียน</div>
                  </div>
                </div>

                {/* Top duplicate plates preview */}
                {duplicatePlates.length > 0 && (
                  <div style={{ background:"#0c1422",border:"1px solid #162030",borderRadius:14,padding:"16px" }}>
                    <div className="section-title">🔁 ทะเบียนเข้าบ่อย (Top 3)</div>
                    {duplicatePlates.slice(0,3).map((d,i)=>(
                      <div key={d.plate} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<2?"1px solid #0f1828":"none" }}>
                        <div style={{ width:22,height:22,borderRadius:"50%",background:"#111e36",border:"1px solid #1e3050",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#a78bfa" }}>{i+1}</div>
                        <span className="plate-display" style={{ fontSize:14 }}>{d.plate}</span>
                        <span className={`badge ${d.registered?"badge-ok":"badge-warn"}`} style={{ fontSize:10 }}>{d.registered?"ลงทะเบียน":"ไม่ลงทะเบียน"}</span>
                        <div style={{ marginLeft:"auto",fontSize:13,fontWeight:700,color:"#a78bfa" }}>{d.count}x</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─ MONTHLY ─ */}
            {recordTab === "monthly" && (
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                <div>
                  <label style={{ fontSize:11,color:"#4a6488",fontWeight:600,letterSpacing:".06em",display:"block",marginBottom:7 }}>เลือกเดือน</label>
                  <select className="inp" value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)} style={{ colorScheme:"dark",cursor:"pointer" }}>
                    {availableMonths.map(m => {
                      const [yr,mo] = m.split("-");
                      return <option key={m} value={m}>{MONTH_TH[+mo-1]} {+yr+543}</option>;
                    })}
                    {availableMonths.length === 0 && <option value={selectedMonth}>ไม่มีข้อมูล</option>}
                  </select>
                </div>

                {/* Month summary */}
                {(() => {
                  const total = monthRecords.length;
                  const unreg = monthRecords.filter(r=>!r.registered).length;
                  const [yr,mo] = selectedMonth.split("-");
                  return (
                    <div style={{ background:"#0c1422",border:"1px solid #162030",borderRadius:14,padding:"16px" }}>
                      <div className="section-title">📅 {MONTH_TH[+mo-1]} {+yr+543}</div>
                      <div style={{ display:"flex",gap:10 }}>
                        <div style={{ flex:1,textAlign:"center" }}>
                          <div style={{ fontSize:28,fontWeight:700,color:"#60a5fa" }}>{total}</div>
                          <div style={{ fontSize:10,color:"#3a5070" }}>รถทั้งหมด</div>
                        </div>
                        <div style={{ flex:1,textAlign:"center" }}>
                          <div style={{ fontSize:28,fontWeight:700,color:"#34d399" }}>{total-unreg}</div>
                          <div style={{ fontSize:10,color:"#3a5070" }}>ลงทะเบียน</div>
                        </div>
                        <div style={{ flex:1,textAlign:"center" }}>
                          <div style={{ fontSize:28,fontWeight:700,color:"#f87171" }}>{unreg}</div>
                          <div style={{ fontSize:10,color:"#3a5070" }}>ไม่ลงทะเบียน</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Records of selected month */}
                {monthRecords.length === 0
                  ? <div style={{ textAlign:"center",color:"#2e4060",padding:"30px 0",fontSize:13 }}>ไม่มีข้อมูลในเดือนนี้</div>
                  : monthRecords.map(r => (
                    <div key={r.id} className={`record-card ${r.registered?"registered":"unregistered"}`}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5 }}>
                          <span className="plate-display">{r.plate}</span>
                          <span className={`badge ${r.registered?"badge-ok":"badge-warn"}`} style={{ fontSize:10 }}>
                            {r.registered?"✓ ลงทะเบียน":"⚠ ไม่ลงทะเบียน"}
                          </span>
                        </div>
                        <div style={{ fontSize:11,color:"#3a5878",display:"flex",gap:12 }}>
                          <span>📅 {r.dateDisplay}</span><span>🕐 {r.time} น.</span>
                        </div>
                      </div>
                      {!r.registered && <div style={{ fontSize:18 }}>📤</div>}
                    </div>
                  ))
                }
              </div>
            )}

            {/* ─ DUPLICATES ─ */}
            {recordTab === "duplicates" && (
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                <div style={{ background:"#0f0c1e",border:"1px solid #2a1a5e",borderRadius:12,padding:"12px 14px",fontSize:12,color:"#7c6aaa",lineHeight:1.6 }}>
                  🔁 ทะเบียนที่ปรากฏในระบบมากกว่า 1 ครั้ง เรียงตามความถี่สูงสุด
                </div>

                {duplicatePlates.length === 0
                  ? <div style={{ textAlign:"center",color:"#2e4060",padding:"30px 0",fontSize:13 }}>ยังไม่มีทะเบียนซ้ำ</div>
                  : duplicatePlates.map((d, i) => (
                    <div key={d.plate} className={`dup-card ${!d.registered?"highlight":""}`}>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div style={{ width:28,height:28,borderRadius:"50%",background:"#111e36",border:"1px solid #1e3050",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#a78bfa",flexShrink:0 }}>{i+1}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5 }}>
                            <span className="plate-display" style={{ fontSize:16 }}>{d.plate}</span>
                            <span className={`badge ${d.registered?"badge-ok":"badge-warn"}`} style={{ fontSize:10 }}>
                              {d.registered?"✓ ลงทะเบียน":"⚠ ไม่ลงทะเบียน"}
                            </span>
                          </div>
                          <div style={{ fontSize:11,color:"#3a5878" }}>ล่าสุด: {d.lastSeen}</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:24,fontWeight:700,color:"#a78bfa",lineHeight:1 }}>{d.count}</div>
                          <div style={{ fontSize:10,color:"#5a4a88" }}>ครั้ง</div>
                        </div>
                      </div>
                      {/* frequency bar */}
                      <div style={{ marginTop:10,height:4,background:"#111e36",borderRadius:2,overflow:"hidden" }}>
                        <div style={{ height:"100%",width:`${(d.count/duplicatePlates[0].count)*100}%`,background:"linear-gradient(90deg,#7c3aed,#a78bfa)",borderRadius:2 }} />
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* ─ LIST ─ */}
            {recordTab === "list" && (
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                <input className="inp" placeholder="🔍 ค้นหาทะเบียน / วันที่ / เวลา" value={search} onChange={e=>setSearch(e.target.value.toUpperCase())} />
                {filteredRecords.length === 0
                  ? <div style={{ textAlign:"center",color:"#2e4060",padding:"30px 0",fontSize:13 }}>ไม่พบข้อมูล</div>
                  : filteredRecords.map(r => (
                    <div key={r.id} className={`record-card ${r.registered?"registered":"unregistered"}`}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5 }}>
                          <span className="plate-display">{r.plate}</span>
                          <span className={`badge ${r.registered?"badge-ok":"badge-warn"}`} style={{ fontSize:10 }}>
                            {r.registered?"✓ ลงทะเบียน":"⚠ ไม่ลงทะเบียน"}
                          </span>
                          {duplicatePlates.find(d=>d.plate===r.plate) && (
                            <span className="badge badge-dup" style={{ fontSize:10 }}>🔁</span>
                          )}
                        </div>
                        <div style={{ fontSize:11,color:"#3a5878",display:"flex",gap:12 }}>
                          <span>📅 {r.dateDisplay}</span><span>🕐 {r.time} น.</span>
                        </div>
                      </div>
                      {!r.registered && <div style={{ fontSize:18 }}>📤</div>}
                    </div>
                  ))
                }
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
