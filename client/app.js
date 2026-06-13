const { useState, useEffect } = React;

function api(path, opts={}){
  const token = localStorage.getItem('token');
  const headers = opts.headers || {};
  if (token) headers['Authorization'] = 'Bearer '+token;
  return fetch('/api'+path, {...opts, headers}).then(r=>r.json());
}

function Login({onLogin}){
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  async function submit(e){
    e.preventDefault();
    const res = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
    const data = await res.json();
    if (data.token){ localStorage.setItem('token',data.token); onLogin(data.user); }
    else alert(data.error||'Login failed');
  }
  return (
    <div className="row justify-content-center">
      <div className="col-md-4">
        <h3>Login SIS</h3>
        <form onSubmit={submit}>
          <div className="mb-2"><input className="form-control" placeholder="username" value={username} onChange={e=>setUsername(e.target.value)}/></div>
          <div className="mb-2"><input type="password" className="form-control" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)}/></div>
          <button className="btn btn-primary">Login</button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({user}){
  const [students,setStudents]=useState([]);
  useEffect(()=>{ api('/students').then(d=>setStudents(d || [])); },[]);
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Dashboard - {user.name || user.username}</h4>
        <div>
          <button className="btn btn-secondary me-2" onClick={()=>{localStorage.removeItem('token'); location.reload();}}>Logout</button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="card mb-3"><div className="card-body">
            <h5 className="card-title">Siswa</h5>
            <p className="card-text">Total: {students.length}</p>
            <a href="#students" className="btn btn-sm btn-outline-primary">Kelola</a>
          </div></div>
        </div>
        <div className="col-md-8">
          <div id="students" className="card"><div className="card-body">
            <h5>Daftar Siswa</h5>
            <StudentList students={students} refresh={()=>api('/students').then(d=>setStudents(d||[]))} />
          </div></div>
        </div>
      </div>
    </div>
  );
}

function StudentList({students, refresh}){
  const [form, setForm] = useState({nisn:'',name:'',kelas:'',jurusan:''});
  async function add(e){
    e.preventDefault();
    const res = await fetch('/api/students',{method:'POST',headers:{'Content-Type':'application/json', 'Authorization':'Bearer '+localStorage.getItem('token')},body:JSON.stringify(form)});
    const d = await res.json();
    if (d.id){ setForm({nisn:'',name:'',kelas:'',jurusan:''}); refresh(); }
    else alert(d.error||'Gagal');
  }
  return (
    <div>
      <form onSubmit={add} className="row g-2 mb-3">
        <div className="col-md-2"><input className="form-control" placeholder="NISN" value={form.nisn} onChange={e=>setForm({...form,nisn:e.target.value})}/></div>
        <div className="col-md-4"><input className="form-control" placeholder="Nama" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
        <div className="col-md-2"><input className="form-control" placeholder="Kelas" value={form.kelas} onChange={e=>setForm({...form,kelas:e.target.value})}/></div>
        <div className="col-md-2"><input className="form-control" placeholder="Jurusan" value={form.jurusan} onChange={e=>setForm({...form,jurusan:e.target.value})}/></div>
        <div className="col-md-2"><button className="btn btn-success w-100">Tambah</button></div>
      </form>

      <table className="table table-sm">
        <thead><tr><th>#</th><th>NISN</th><th>Nama</th><th>Kelas</th><th>Jurusan</th></tr></thead>
        <tbody>
          {students.map((s,i)=>(<tr key={s.id}><td>{i+1}</td><td>{s.nisn}</td><td>{s.name}</td><td>{s.kelas}</td><td>{s.jurusan}</td></tr>))}
        </tbody>
      </table>
    </div>
  );
}

function App(){
  const [user,setUser]=useState(null);
  useEffect(()=>{
    const token = localStorage.getItem('token');
    if (!token) return;
    // try to fetch profile via users list (simple)
    // decode basic info from token by calling protected endpoint
    fetch('/api/users',{headers:{'Authorization':'Bearer '+token}}).then(async r=>{
      if (r.ok){
        const users = await r.json();
        // set a placeholder user object using first user if token valid
        setUser({ username: 'admin', name: 'Administrator' });
      } else {
        localStorage.removeItem('token');
      }
    }).catch(()=>localStorage.removeItem('token'));
  },[]);

  return user ? <Dashboard user={user} /> : <Login onLogin={u=>setUser(u)} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
