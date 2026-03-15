import { useState, useEffect, useCallback, useMemo } from "react";

// ============================================================
// STORAGE LAYER (swap with Supabase calls)
// ============================================================
const storage = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } },
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  getObj: (key, def = {}) => { try { return JSON.parse(localStorage.getItem(key)) || def; } catch { return def; } },
};

const seed = () => {
  if (storage.get("seeded").length) return;
  const users = [
    { id: "u1", name: "Admin", email: "admin@padel.com", role: "admin", active: true, password: "1234" },
    { id: "u2", name: "María", email: "maria@padel.com", role: "colaborador", active: true, password: "1234" },
  ];
  const products = [
    { id: "p1", name: "Cerveza", category: "Bebidas", price: 800, active: true, emoji: "🍺" },
    { id: "p2", name: "Gaseosa", category: "Bebidas", price: 500, active: true, emoji: "🥤" },
    { id: "p3", name: "Agua", category: "Bebidas", price: 300, active: true, emoji: "💧" },
    { id: "p4", name: "Pancho", category: "Comidas", price: 1200, active: true, emoji: "🌭" },
    { id: "p5", name: "Hamburguesa", category: "Comidas", price: 2500, active: true, emoji: "🍔" },
    { id: "p6", name: "Papas Fritas", category: "Comidas", price: 900, active: true, emoji: "🍟" },
    { id: "p7", name: "Sándwich", category: "Comidas", price: 1500, active: true, emoji: "🥪" },
    { id: "p8", name: "Café", category: "Bebidas", price: 400, active: true, emoji: "☕" },
  ];
  const clients = [
    { id: "c1", name: "Juan Pérez", phone: "1155551234", notes: "", balance: 0, createdAt: new Date().toISOString() },
    { id: "c2", name: "Ana García", phone: "1166662345", notes: "", balance: 0, createdAt: new Date().toISOString() },
  ];
  storage.set("users", users);
  storage.set("products", products);
  storage.set("clients", clients);
  storage.set("sales", []);
  storage.set("payments", []);
  storage.set("expenses", []);
  storage.set("movements", []);
  storage.set("seeded", [true]);
};

const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) => new Date(d).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const uid = () => Math.random().toString(36).slice(2, 10);

// ============================================================
// HOOKS
// ============================================================
const useData = (key, def = []) => {
  const [data, setData] = useState(() => storage.get(key).length ? storage.get(key) : def);
  const save = useCallback((val) => { setData(val); storage.set(key, val); }, [key]);
  return [data, save];
};

// ============================================================
// COMPONENTS
// ============================================================
const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
    <div style={{ background: "#0f1117", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, maxHeight: "92vh", overflow: "auto", padding: "0 0 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 12px", borderBottom: "1px solid #1e2130", position: "sticky", top: 0, background: "#0f1117", zIndex: 1 }}>
        <span style={{ fontWeight: 700, fontSize: 17, color: "#f0f0f0" }}>{title}</span>
        <button onClick={onClose} style={{ background: "#1e2130", border: "none", color: "#aaa", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 12, color: "#7a8099", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>}
    <input {...props} style={{ width: "100%", background: "#1a1d2e", border: "1.5px solid #252840", borderRadius: 10, padding: "11px 14px", color: "#f0f0f0", fontSize: 15, outline: "none", boxSizing: "border-box", ...props.style }} />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 12, color: "#7a8099", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>}
    <select {...props} style={{ width: "100%", background: "#1a1d2e", border: "1.5px solid #252840", borderRadius: 10, padding: "11px 14px", color: "#f0f0f0", fontSize: 15, outline: "none", boxSizing: "border-box" }}>
      {children}
    </select>
  </div>
);

const Btn = ({ children, onClick, variant = "primary", style: s = {}, disabled }) => {
  const variants = {
    primary: { background: "linear-gradient(135deg, #00d4aa, #00a882)", color: "#000", fontWeight: 700 },
    danger: { background: "#ff4757", color: "#fff", fontWeight: 700 },
    ghost: { background: "#1a1d2e", color: "#a0a8c0", fontWeight: 600 },
    orange: { background: "linear-gradient(135deg, #ff9f43, #ff6b35)", color: "#fff", fontWeight: 700 },
    blue: { background: "linear-gradient(135deg, #4facfe, #00f2fe)", color: "#000", fontWeight: 700 },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ border: "none", borderRadius: 12, padding: "12px 20px", fontSize: 15, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, transition: "transform 0.1s, opacity 0.1s", ...variants[variant], ...s }}>
      {children}
    </button>
  );
};

const Badge = ({ children, color = "#00d4aa" }) => (
  <span style={{ background: color + "22", color, borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{children}</span>
);

const StatCard = ({ label, value, sub, color = "#00d4aa", icon }) => (
  <div style={{ background: "#0f1117", border: "1.5px solid #1e2130", borderRadius: 16, padding: "16px", flex: 1, minWidth: 0 }}>
    <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 11, color: "#5a6080", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: "#7a8099", marginTop: 2 }}>{sub}</div>}
  </div>
);

// ============================================================
// LOGIN
// ============================================================
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const handle = () => {
    const users = storage.get("users");
    const u = users.find(u => u.email === email && u.password === pass && u.active);
    if (u) onLogin(u); else setErr("Credenciales inválidas");
  };
  return (
    <div style={{ minHeight: "100vh", background: "#080a12", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>🎾</div>
          <h1 style={{ color: "#f0f0f0", fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: "-0.03em" }}>Cantina Pádel</h1>
          <p style={{ color: "#5a6080", fontSize: 14, marginTop: 6 }}>Sistema de gestión interno</p>
        </div>
        <div style={{ background: "#0f1117", borderRadius: 20, padding: 28, border: "1.5px solid #1e2130" }}>
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
          <Input label="Contraseña" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••" onKeyDown={e => e.key === "Enter" && handle()} />
          {err && <p style={{ color: "#ff4757", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{err}</p>}
          <Btn onClick={handle} style={{ width: "100%", padding: "14px" }}>Ingresar</Btn>
          <p style={{ color: "#3a4060", fontSize: 12, textAlign: "center", marginTop: 16 }}>Demo: admin@padel.com / 1234</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// DASHBOARD
// ============================================================
const Dashboard = ({ user, setScreen }) => {
  const sales = storage.get("sales");
  const payments = storage.get("payments");
  const expenses = storage.get("expenses");
  const clients = storage.get("clients");

  const totalSales = sales.reduce((a, s) => a + s.total, 0);
  const collected = sales.filter(s => s.paid).reduce((a, s) => a + s.total, 0) + payments.reduce((a, p) => a + p.amount, 0);
  const pending = clients.reduce((a, c) => a + (c.balance || 0), 0);
  const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);
  const cash = collected - totalExpenses;
  const profit = collected - totalExpenses;

  const actions = [
    { label: "Nueva Venta", emoji: "🛒", screen: "sales", color: "#00d4aa" },
    { label: "Registrar Pago", emoji: "💰", screen: "payments", color: "#ff9f43" },
    { label: "Gasto", emoji: "📤", screen: "expenses", color: "#ff4757" },
    { label: "Nuevo Cliente", emoji: "👤", screen: "clients", color: "#4facfe" },
  ];

  const recentSales = [...sales].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div>
      <h2 style={{ color: "#f0f0f0", fontSize: 20, fontWeight: 800, margin: "0 0 20px" }}>📊 Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <StatCard label="Ventas totales" value={fmt(totalSales)} icon="🛒" color="#f0f0f0" />
        <StatCard label="Cobrado" value={fmt(collected)} icon="✅" color="#00d4aa" />
        <StatCard label="Pendiente" value={fmt(pending)} icon="⏳" color="#ff9f43" />
        <StatCard label="Gastos" value={fmt(totalExpenses)} icon="📤" color="#ff4757" />
        <StatCard label="Caja actual" value={fmt(cash)} icon="💵" color="#4facfe" />
        <StatCard label="Ganancia" value={fmt(profit)} icon="📈" color={profit >= 0 ? "#00d4aa" : "#ff4757"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
        {actions.map(a => (
          <button key={a.screen} onClick={() => setScreen(a.screen)} style={{ background: a.color + "18", border: "1.5px solid " + a.color + "44", borderRadius: 16, padding: "18px 12px", cursor: "pointer", textAlign: "center", transition: "transform 0.1s" }}>
            <div style={{ fontSize: 30, marginBottom: 6 }}>{a.emoji}</div>
            <div style={{ color: a.color, fontWeight: 700, fontSize: 14 }}>{a.label}</div>
          </button>
        ))}
      </div>

      {recentSales.length > 0 && (
        <div>
          <h3 style={{ color: "#7a8099", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Últimas ventas</h3>
          {recentSales.map(s => (
            <div key={s.id} style={{ background: "#0f1117", border: "1px solid #1e2130", borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#f0f0f0", fontWeight: 600, fontSize: 14 }}>{s.clientName || "Sin cliente"}</div>
                <div style={{ color: "#5a6080", fontSize: 12 }}>{fmtDate(s.createdAt)} · {s.collaboratorName}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#f0f0f0", fontWeight: 700 }}>{fmt(s.total)}</div>
                <Badge color={s.paid ? "#00d4aa" : "#ff9f43"}>{s.paid ? "Cobrado" : "Pendiente"}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// SALES
// ============================================================
const SalesScreen = ({ user }) => {
  const [products] = useData("products");
  const [clients, setClients] = useData("clients");
  const [sales, setSales] = useData("sales");

  const [cart, setCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [paid, setPaid] = useState(true);
  const [payMethod, setPayMethod] = useState("efectivo");
  const [note, setNote] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [success, setSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");

  const activeProducts = products.filter(p => p.active);
  const categories = ["Todos", ...new Set(activeProducts.map(p => p.category))];
  const filteredProducts = activeCategory === "Todos" ? activeProducts : activeProducts.filter(p => p.category === activeCategory);

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).slice(0, 6);
  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0);
      return updated;
    });
  };

  const updatePrice = (id, val) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, price: parseFloat(val) || 0 } : i));
  };

  const createClient = () => {
    if (!newClientName.trim()) return;
    const c = { id: uid(), name: newClientName.trim(), phone: newClientPhone, notes: "", balance: 0, createdAt: new Date().toISOString() };
    setClients([...clients, c]);
    setSelectedClient(c);
    setShowNewClient(false);
    setShowClientSearch(false);
    setNewClientName(""); setNewClientPhone("");
  };

  const submit = () => {
    if (cart.length === 0) return;
    const now = new Date().toISOString();
    const sale = {
      id: uid(), createdAt: now, collaboratorId: user.id, collaboratorName: user.name,
      clientId: selectedClient?.id || null, clientName: selectedClient?.name || "Sin cliente",
      items: cart, total, paid, payMethod: paid ? payMethod : null, note,
    };
    const newSales = [...sales, sale];
    setSales(newSales);

    if (!paid && selectedClient) {
      const updated = clients.map(c => c.id === selectedClient.id ? { ...c, balance: (c.balance || 0) + total } : c);
      setClients(updated);
    }

    setCart([]); setSelectedClient(null); setPaid(true); setNote(""); setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div>
      <h2 style={{ color: "#f0f0f0", fontSize: 20, fontWeight: 800, margin: "0 0 20px" }}>🛒 Nueva Venta</h2>

      {success && <div style={{ background: "#00d4aa22", border: "1.5px solid #00d4aa", borderRadius: 12, padding: 14, marginBottom: 16, color: "#00d4aa", fontWeight: 700, textAlign: "center", fontSize: 16 }}>✅ Venta registrada!</div>}

      {/* Client selector */}
      <div style={{ background: "#0f1117", border: "1.5px solid #1e2130", borderRadius: 14, padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ color: "#7a8099", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Cliente</span>
          {selectedClient && <button onClick={() => setSelectedClient(null)} style={{ background: "none", border: "none", color: "#ff4757", cursor: "pointer", fontSize: 12 }}>Quitar</button>}
        </div>
        {selectedClient
          ? <div style={{ color: "#f0f0f0", fontWeight: 700, fontSize: 16 }}>{selectedClient.name} <span style={{ color: "#ff9f43", fontSize: 13 }}>{selectedClient.balance > 0 ? `Deuda: ${fmt(selectedClient.balance)}` : ""}</span></div>
          : <div>
            <button onClick={() => setShowClientSearch(true)} style={{ background: "#1a1d2e", border: "1.5px dashed #252840", borderRadius: 10, padding: "10px 16px", color: "#7a8099", cursor: "pointer", width: "100%", fontSize: 14, textAlign: "left" }}>
              + Seleccionar cliente
            </button>
          </div>
        }
      </div>

      {/* Product categories */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
        {categories.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)} style={{ background: activeCategory === c ? "#00d4aa" : "#1a1d2e", color: activeCategory === c ? "#000" : "#7a8099", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{c}</button>
        ))}
      </div>

      {/* Product buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {filteredProducts.map(p => {
          const inCart = cart.find(i => i.id === p.id);
          return (
            <button key={p.id} onClick={() => addToCart(p)} style={{ background: inCart ? "#00d4aa18" : "#0f1117", border: inCart ? "1.5px solid #00d4aa" : "1.5px solid #1e2130", borderRadius: 14, padding: "14px 8px", cursor: "pointer", textAlign: "center", transition: "transform 0.1s" }}>
              <div style={{ fontSize: 26, marginBottom: 4 }}>{p.emoji || "🍽️"}</div>
              <div style={{ color: "#f0f0f0", fontWeight: 700, fontSize: 12, lineHeight: 1.2 }}>{p.name}</div>
              <div style={{ color: "#00d4aa", fontSize: 12, marginTop: 3 }}>{fmt(p.price)}</div>
              {inCart && <div style={{ color: "#00d4aa", fontSize: 11, fontWeight: 800, marginTop: 2 }}>×{inCart.qty}</div>}
            </button>
          );
        })}
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div style={{ background: "#0f1117", border: "1.5px solid #1e2130", borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <div style={{ color: "#7a8099", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Pedido</div>
          {cart.map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{item.emoji || "🍽️"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#f0f0f0", fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                <input type="number" value={item.price} onChange={e => updatePrice(item.id, e.target.value)} style={{ background: "#1a1d2e", border: "1px solid #252840", borderRadius: 6, padding: "3px 8px", color: "#00d4aa", fontSize: 13, width: 80 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => updateQty(item.id, -1)} style={{ background: "#1a1d2e", border: "none", color: "#f0f0f0", width: 28, height: 28, borderRadius: 8, cursor: "pointer", fontWeight: 800, fontSize: 16 }}>−</button>
                <span style={{ color: "#f0f0f0", fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} style={{ background: "#00d4aa22", border: "none", color: "#00d4aa", width: 28, height: 28, borderRadius: 8, cursor: "pointer", fontWeight: 800, fontSize: 16 }}>+</button>
              </div>
              <div style={{ color: "#f0f0f0", fontWeight: 700, minWidth: 70, textAlign: "right" }}>{fmt(item.price * item.qty)}</div>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #1e2130", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#7a8099", fontWeight: 700 }}>TOTAL</span>
            <span style={{ color: "#f0f0f0", fontSize: 22, fontWeight: 900 }}>{fmt(total)}</span>
          </div>
        </div>
      )}

      {/* Payment */}
      {cart.length > 0 && (
        <div style={{ background: "#0f1117", border: "1.5px solid #1e2130", borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <button onClick={() => setPaid(true)} style={{ flex: 1, background: paid ? "#00d4aa22" : "#1a1d2e", border: paid ? "2px solid #00d4aa" : "1.5px solid #252840", borderRadius: 12, padding: 12, cursor: "pointer", color: paid ? "#00d4aa" : "#7a8099", fontWeight: 700, fontSize: 14 }}>✅ Paga ahora</button>
            <button onClick={() => setPaid(false)} style={{ flex: 1, background: !paid ? "#ff9f4322" : "#1a1d2e", border: !paid ? "2px solid #ff9f43" : "1.5px solid #252840", borderRadius: 12, padding: 12, cursor: "pointer", color: !paid ? "#ff9f43" : "#7a8099", fontWeight: 700, fontSize: 14 }}>⏳ Paga después</button>
          </div>
          {paid && (
            <Select label="Medio de pago" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
              <option value="efectivo">💵 Efectivo</option>
              <option value="transferencia">📲 Transferencia</option>
              <option value="debito">💳 Débito</option>
              <option value="credito">💳 Crédito</option>
            </Select>
          )}
          <Input label="Observación (opcional)" value={note} onChange={e => setNote(e.target.value)} placeholder="Ej: Mesa 3" />
        </div>
      )}

      {cart.length > 0 && <Btn onClick={submit} style={{ width: "100%", padding: 16, fontSize: 17 }}>Registrar Venta · {fmt(total)}</Btn>}

      {/* Client Search Modal */}
      {showClientSearch && (
        <Modal title="Seleccionar cliente" onClose={() => setShowClientSearch(false)}>
          <Input value={clientSearch} onChange={e => setClientSearch(e.target.value)} placeholder="Buscar cliente..." />
          {filteredClients.map(c => (
            <div key={c.id} onClick={() => { setSelectedClient(c); setShowClientSearch(false); setClientSearch(""); }} style={{ background: "#1a1d2e", borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer" }}>
              <div style={{ color: "#f0f0f0", fontWeight: 600 }}>{c.name}</div>
              <div style={{ color: "#5a6080", fontSize: 12 }}>{c.phone} {c.balance > 0 ? `· Deuda: ${fmt(c.balance)}` : ""}</div>
            </div>
          ))}
          <Btn onClick={() => setShowNewClient(true)} variant="ghost" style={{ width: "100%", marginTop: 8 }}>+ Crear nuevo cliente</Btn>
        </Modal>
      )}

      {showNewClient && (
        <Modal title="Nuevo cliente" onClose={() => setShowNewClient(false)}>
          <Input label="Nombre" value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Nombre completo" />
          <Input label="Teléfono (opcional)" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="11 5555 1234" />
          <Btn onClick={createClient} style={{ width: "100%" }}>Crear cliente</Btn>
        </Modal>
      )}
    </div>
  );
};

// ============================================================
// PAYMENTS
// ============================================================
const PaymentsScreen = ({ user }) => {
  const [clients, setClients] = useData("clients");
  const [payments, setPayments] = useData("payments");
  const [clientSearch, setClientSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("efectivo");
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);

  const filtered = clients.filter(c => c.balance > 0 && c.name.toLowerCase().includes(clientSearch.toLowerCase()));

  const submit = () => {
    if (!selected || !amount) return;
    const amt = parseFloat(amount);
    const p = { id: uid(), createdAt: new Date().toISOString(), clientId: selected.id, clientName: selected.name, amount: amt, method, note, collaboratorId: user.id, collaboratorName: user.name };
    setPayments([...payments, p]);
    const updated = clients.map(c => c.id === selected.id ? { ...c, balance: Math.max(0, (c.balance || 0) - amt) } : c);
    setClients(updated);
    setSelected(null); setAmount(""); setNote(""); setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div>
      <h2 style={{ color: "#f0f0f0", fontSize: 20, fontWeight: 800, margin: "0 0 20px" }}>💰 Registrar Pago</h2>
      {success && <div style={{ background: "#00d4aa22", border: "1.5px solid #00d4aa", borderRadius: 12, padding: 14, marginBottom: 16, color: "#00d4aa", fontWeight: 700, textAlign: "center" }}>✅ Pago registrado!</div>}

      <Input value={clientSearch} onChange={e => setClientSearch(e.target.value)} placeholder="Buscar cliente con deuda..." />

      {!selected && filtered.map(c => (
        <div key={c.id} onClick={() => { setSelected(c); setAmount(c.balance.toString()); }} style={{ background: "#0f1117", border: "1.5px solid #1e2130", borderRadius: 12, padding: "14px", marginBottom: 8, cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ color: "#f0f0f0", fontWeight: 700 }}>{c.name}</div>
            <Badge color="#ff9f43">{fmt(c.balance)}</Badge>
          </div>
          <div style={{ color: "#5a6080", fontSize: 12, marginTop: 3 }}>{c.phone}</div>
        </div>
      ))}

      {selected && (
        <div style={{ background: "#0f1117", border: "1.5px solid #00d4aa44", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ color: "#f0f0f0", fontWeight: 700, fontSize: 16 }}>{selected.name}</div>
              <div style={{ color: "#ff9f43", fontSize: 13 }}>Deuda: {fmt(selected.balance)}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#ff4757", cursor: "pointer", fontSize: 13 }}>Cambiar</button>
          </div>
          <Input label="Monto a pagar" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
          <Select label="Medio de pago" value={method} onChange={e => setMethod(e.target.value)}>
            <option value="efectivo">💵 Efectivo</option>
            <option value="transferencia">📲 Transferencia</option>
            <option value="debito">💳 Débito</option>
            <option value="credito">💳 Crédito</option>
          </Select>
          <Input label="Observación" value={note} onChange={e => setNote(e.target.value)} placeholder="Opcional..." />
          <Btn variant="orange" onClick={submit} style={{ width: "100%", padding: 14, fontSize: 16 }}>Registrar Pago · {fmt(parseFloat(amount) || 0)}</Btn>
        </div>
      )}

      <h3 style={{ color: "#7a8099", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 24, marginBottom: 12 }}>Pagos recientes</h3>
      {[...payments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10).map(p => (
        <div key={p.id} style={{ background: "#0f1117", border: "1px solid #1e2130", borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#f0f0f0", fontWeight: 600 }}>{p.clientName}</div>
            <div style={{ color: "#5a6080", fontSize: 12 }}>{fmtDate(p.createdAt)} · {p.method}</div>
          </div>
          <div style={{ color: "#00d4aa", fontWeight: 800 }}>{fmt(p.amount)}</div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// EXPENSES
// ============================================================
const ExpensesScreen = ({ user }) => {
  const [expenses, setExpenses] = useData("expenses");
  const [type, setType] = useState("Bebidas");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = () => {
    if (!amount || !desc) return;
    const e = { id: uid(), createdAt: new Date().toISOString(), collaboratorId: user.id, collaboratorName: user.name, type, desc, amount: parseFloat(amount), note };
    setExpenses([...expenses, e]);
    setDesc(""); setAmount(""); setNote(""); setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const total = expenses.reduce((a, e) => a + e.amount, 0);

  return (
    <div>
      <h2 style={{ color: "#f0f0f0", fontSize: 20, fontWeight: 800, margin: "0 0 20px" }}>📤 Gastos</h2>
      {success && <div style={{ background: "#ff475722", border: "1.5px solid #ff4757", borderRadius: 12, padding: 14, marginBottom: 16, color: "#ff4757", fontWeight: 700, textAlign: "center" }}>✅ Gasto registrado!</div>}

      <div style={{ background: "#0f1117", border: "1.5px solid #1e2130", borderRadius: 14, padding: 16, marginBottom: 20 }}>
        <Select label="Tipo de gasto" value={type} onChange={e => setType(e.target.value)}>
          <option>Bebidas</option>
          <option>Comidas</option>
          <option>Hielo</option>
          <option>Insumos</option>
          <option>Otros</option>
        </Select>
        <Input label="Descripción" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ej: Compra de cervezas" />
        <Input label="Monto" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
        <Input label="Observación (opcional)" value={note} onChange={e => setNote(e.target.value)} placeholder="..." />
        <Btn variant="danger" onClick={submit} style={{ width: "100%", padding: 14, fontSize: 16 }}>Registrar Gasto</Btn>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ color: "#7a8099", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Total gastos</span>
        <span style={{ color: "#ff4757", fontWeight: 800, fontSize: 18 }}>{fmt(total)}</span>
      </div>

      {[...expenses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(e => (
        <div key={e.id} style={{ background: "#0f1117", border: "1px solid #1e2130", borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#f0f0f0", fontWeight: 600 }}>{e.desc}</div>
            <div style={{ color: "#5a6080", fontSize: 12 }}>{fmtDate(e.createdAt)} · {e.type} · {e.collaboratorName}</div>
          </div>
          <div style={{ color: "#ff4757", fontWeight: 800 }}>{fmt(e.amount)}</div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// CLIENTS
// ============================================================
const ClientsScreen = ({ user }) => {
  const [clients, setClients] = useData("clients");
  const [sales] = useData("sales");
  const [payments] = useData("payments");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const create = () => {
    if (!form.name.trim()) return;
    setClients([...clients, { id: uid(), ...form, balance: 0, createdAt: new Date().toISOString() }]);
    setShowNew(false); setForm({ name: "", phone: "", notes: "" });
  };

  const deleteClient = (id) => { setClients(clients.filter(c => c.id !== id)); setConfirmDelete(null); setShowDetail(null); };

  const detail = showDetail ? clients.find(c => c.id === showDetail) : null;
  const clientSales = detail ? sales.filter(s => s.clientId === detail.id) : [];
  const clientPayments = detail ? payments.filter(p => p.clientId === detail.id) : [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#f0f0f0", fontSize: 20, fontWeight: 800, margin: 0 }}>👥 Clientes</h2>
        <Btn onClick={() => setShowNew(true)} style={{ padding: "8px 16px", fontSize: 14 }}>+ Nuevo</Btn>
      </div>
      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..." />

      {filtered.map(c => (
        <div key={c.id} style={{ background: "#0f1117", border: "1px solid #1e2130", borderRadius: 12, padding: "14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <div onClick={() => setShowDetail(c.id)} style={{ flex: 1, cursor: "pointer" }}>
            <div style={{ color: "#f0f0f0", fontWeight: 700 }}>{c.name}</div>
            <div style={{ color: "#5a6080", fontSize: 12 }}>{c.phone || "Sin teléfono"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {c.balance > 0 ? <Badge color="#ff9f43">Deuda {fmt(c.balance)}</Badge> : <Badge color="#00d4aa">Sin deuda</Badge>}
            <button onClick={() => setConfirmDelete(c)} style={{ background: "#ff475722", border: "none", color: "#ff4757", borderRadius: 8, padding: "6px 8px", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>🗑️</button>
          </div>
        </div>
      ))}

      {showNew && (
        <Modal title="Nuevo cliente" onClose={() => setShowNew(false)}>
          <Input label="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="Teléfono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <Input label="Observaciones" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <Btn onClick={create} style={{ width: "100%" }}>Crear cliente</Btn>
        </Modal>
      )}

      {detail && (
        <Modal title={detail.name} onClose={() => setShowDetail(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            <StatCard label="Consumido" value={fmt(clientSales.reduce((a, s) => a + s.total, 0))} icon="🛒" color="#f0f0f0" />
            <StatCard label="Pagado" value={fmt(clientPayments.reduce((a, p) => a + p.amount, 0))} icon="✅" color="#00d4aa" />
            <StatCard label="Deuda" value={fmt(detail.balance)} icon="⏳" color="#ff9f43" />
          </div>
          <h4 style={{ color: "#7a8099", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Historial de ventas</h4>
          {clientSales.length === 0 && <div style={{ color: "#3a4060", fontSize: 13, marginBottom: 12 }}>Sin ventas registradas.</div>}
          {clientSales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(s => (
            <div key={s.id} style={{ background: "#1a1d2e", borderRadius: 10, padding: "10px 12px", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
              <div style={{ color: "#f0f0f0", fontSize: 14 }}>{fmtDate(s.createdAt)}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge color={s.paid ? "#00d4aa" : "#ff9f43"}>{s.paid ? "Cobrado" : "Pendiente"}</Badge>
                <span style={{ color: "#f0f0f0", fontWeight: 700 }}>{fmt(s.total)}</span>
              </div>
            </div>
          ))}
          <h4 style={{ color: "#7a8099", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 10, marginTop: 16 }}>Pagos recibidos</h4>
          {clientPayments.length === 0 && <div style={{ color: "#3a4060", fontSize: 13, marginBottom: 12 }}>Sin pagos registrados.</div>}
          {clientPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(p => (
            <div key={p.id} style={{ background: "#1a1d2e", borderRadius: 10, padding: "10px 12px", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
              <div style={{ color: "#f0f0f0", fontSize: 14 }}>{fmtDate(p.createdAt)} · {p.method}</div>
              <span style={{ color: "#00d4aa", fontWeight: 700 }}>{fmt(p.amount)}</span>
            </div>
          ))}
          <div style={{ marginTop: 20, borderTop: "1px solid #1e2130", paddingTop: 16 }}>
            <Btn variant="danger" onClick={() => { setShowDetail(null); setConfirmDelete(detail); }} style={{ width: "100%", fontSize: 14 }}>🗑️ Eliminar cliente</Btn>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Eliminar cliente" onClose={() => setConfirmDelete(null)}>
          <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>👤</div>
            <div style={{ color: "#f0f0f0", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{confirmDelete.name}</div>
            {confirmDelete.balance > 0 && (
              <div style={{ background: "#ff9f4322", border: "1px solid #ff9f4344", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
                <div style={{ color: "#ff9f43", fontWeight: 700, fontSize: 13 }}>⚠️ Este cliente tiene una deuda de {fmt(confirmDelete.balance)}</div>
              </div>
            )}
            <div style={{ color: "#7a8099", fontSize: 14, marginBottom: 20 }}>¿Eliminar este cliente? Su historial de ventas y pagos se conservará en los reportes.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="ghost" onClick={() => setConfirmDelete(null)} style={{ flex: 1 }}>Cancelar</Btn>
              <Btn variant="danger" onClick={() => deleteClient(confirmDelete.id)} style={{ flex: 1 }}>Sí, eliminar</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ============================================================
// PRODUCTS
// ============================================================
const ProductsScreen = ({ user }) => {
  const [products, setProducts] = useData("products");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ name: "", category: "Bebidas", price: "", emoji: "", active: true });

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const save = () => {
    if (!form.name || !form.price) return;
    const item = { ...form, price: parseFloat(form.price) };
    if (editing) {
      setProducts(products.map(p => p.id === editing ? { ...p, ...item } : p));
    } else {
      setProducts([...products, { id: uid(), ...item }]);
    }
    setShowNew(false); setEditing(null); setForm({ name: "", category: "Bebidas", price: "", emoji: "", active: true });
  };

  const toggle = (id) => setProducts(products.map(p => p.id === id ? { ...p, active: !p.active } : p));
  const deleteProduct = (id) => { setProducts(products.filter(p => p.id !== id)); setConfirmDelete(null); };
  const startEdit = (p) => { setForm({ name: p.name, category: p.category, price: p.price.toString(), emoji: p.emoji || "", active: p.active }); setEditing(p.id); setShowNew(true); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#f0f0f0", fontSize: 20, fontWeight: 800, margin: 0 }}>🛍️ Productos</h2>
        <Btn onClick={() => { setEditing(null); setForm({ name: "", category: "Bebidas", price: "", emoji: "", active: true }); setShowNew(true); }} style={{ padding: "8px 16px", fontSize: 14 }}>+ Nuevo</Btn>
      </div>
      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." />

      {filtered.map(p => (
        <div key={p.id} style={{ background: "#0f1117", border: "1px solid #1e2130", borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>{p.emoji || "🍽️"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: p.active ? "#f0f0f0" : "#5a6080", fontWeight: 700 }}>{p.name}</div>
            <div style={{ color: "#5a6080", fontSize: 12 }}>{p.category}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#00d4aa", fontWeight: 800 }}>{fmt(p.price)}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <button onClick={() => startEdit(p)} style={{ background: "#1a1d2e", border: "none", color: "#7a8099", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 11 }}>Editar</button>
              <button onClick={() => toggle(p.id)} style={{ background: p.active ? "#ff475722" : "#00d4aa22", border: "none", color: p.active ? "#ff4757" : "#00d4aa", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 11 }}>{p.active ? "Desactivar" : "Activar"}</button>
              <button onClick={() => setConfirmDelete(p)} style={{ background: "#ff475722", border: "none", color: "#ff4757", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 11 }}>🗑️</button>
            </div>
          </div>
        </div>
      ))}

      {showNew && (
        <Modal title={editing ? "Editar producto" : "Nuevo producto"} onClose={() => { setShowNew(false); setEditing(null); }}>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 10, alignItems: "end", marginBottom: 0 }}>
            <Input label="Emoji" value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} placeholder="🍺" />
            <Input label="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <Select label="Categoría" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option>Bebidas</option>
            <option>Comidas</option>
            <option>Snacks</option>
            <option>Otros</option>
          </Select>
          <Input label="Precio" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <Btn onClick={save} style={{ width: "100%" }}>{editing ? "Guardar cambios" : "Crear producto"}</Btn>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Eliminar producto" onClose={() => setConfirmDelete(null)}>
          <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{confirmDelete.emoji || "🍽️"}</div>
            <div style={{ color: "#f0f0f0", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{confirmDelete.name}</div>
            <div style={{ color: "#7a8099", fontSize: 14, marginBottom: 20 }}>¿Estás seguro que querés eliminar este producto? No se borrará del historial de ventas pasadas.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="ghost" onClick={() => setConfirmDelete(null)} style={{ flex: 1 }}>Cancelar</Btn>
              <Btn variant="danger" onClick={() => deleteProduct(confirmDelete.id)} style={{ flex: 1 }}>Sí, eliminar</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ============================================================
// CASH
// ============================================================
const CashScreen = () => {
  const sales = storage.get("sales");
  const payments = storage.get("payments");
  const expenses = storage.get("expenses");
  const clients = storage.get("clients");

  const directSales = sales.filter(s => s.paid).reduce((a, s) => a + s.total, 0);
  const latePayments = payments.reduce((a, p) => a + p.amount, 0);
  const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);
  const totalPending = clients.reduce((a, c) => a + (c.balance || 0), 0);
  const cash = directSales + latePayments - totalExpenses;
  const profit = cash;

  const rows = [
    { label: "Ventas cobradas al momento", value: directSales, color: "#00d4aa", icon: "✅" },
    { label: "Cobros posteriores", value: latePayments, color: "#4facfe", icon: "💰" },
    { label: "Total gastos", value: -totalExpenses, color: "#ff4757", icon: "📤" },
    { label: "Pendiente de clientes", value: totalPending, color: "#ff9f43", icon: "⏳" },
  ];

  return (
    <div>
      <h2 style={{ color: "#f0f0f0", fontSize: 20, fontWeight: 800, margin: "0 0 20px" }}>💵 Caja</h2>
      {rows.map(r => (
        <div key={r.label} style={{ background: "#0f1117", border: "1px solid #1e2130", borderRadius: 12, padding: "14px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#a0a8c0", fontSize: 14 }}>{r.icon} {r.label}</div>
          <div style={{ color: r.color, fontWeight: 800, fontSize: 16 }}>{fmt(r.value)}</div>
        </div>
      ))}
      <div style={{ background: "linear-gradient(135deg, #00d4aa18, #4facfe18)", border: "1.5px solid #00d4aa44", borderRadius: 16, padding: "20px", marginTop: 16, textAlign: "center" }}>
        <div style={{ color: "#7a8099", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>💵 Saldo de Caja</div>
        <div style={{ color: cash >= 0 ? "#00d4aa" : "#ff4757", fontSize: 36, fontWeight: 900 }}>{fmt(cash)}</div>
      </div>
      <div style={{ background: profit >= 0 ? "#00d4aa18" : "#ff475718", border: `1.5px solid ${profit >= 0 ? "#00d4aa44" : "#ff475744"}`, borderRadius: 16, padding: "20px", marginTop: 12, textAlign: "center" }}>
        <div style={{ color: "#7a8099", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>📈 Ganancia estimada</div>
        <div style={{ color: profit >= 0 ? "#00d4aa" : "#ff4757", fontSize: 36, fontWeight: 900 }}>{fmt(profit)}</div>
        <div style={{ color: "#5a6080", fontSize: 12, marginTop: 6 }}>Cobrado − Gastos</div>
      </div>
    </div>
  );
};

// ============================================================
// REPORTS
// ============================================================
const ReportsScreen = () => {
  const sales = storage.get("sales");
  const payments = storage.get("payments");
  const expenses = storage.get("expenses");
  const clients = storage.get("clients");
  const [tab, setTab] = useState("ventas");

  const tabs = [
    { id: "ventas", label: "Ventas" },
    { id: "productos", label: "Productos" },
    { id: "clientes", label: "Deudores" },
    { id: "gastos", label: "Gastos" },
  ];

  const productStats = {};
  sales.forEach(s => s.items.forEach(i => {
    if (!productStats[i.name]) productStats[i.name] = { qty: 0, total: 0, emoji: i.emoji };
    productStats[i.name].qty += i.qty;
    productStats[i.name].total += i.price * i.qty;
  }));
  const productList = Object.entries(productStats).sort((a, b) => b[1].total - a[1].total);
  const debtors = clients.filter(c => c.balance > 0).sort((a, b) => b.balance - a.balance);

  return (
    <div>
      <h2 style={{ color: "#f0f0f0", fontSize: 20, fontWeight: 800, margin: "0 0 20px" }}>📊 Reportes</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? "#00d4aa" : "#1a1d2e", color: tab === t.id ? "#000" : "#7a8099", border: "none", borderRadius: 20, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{t.label}</button>
        ))}
      </div>

      {tab === "ventas" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <StatCard label="Total ventas" value={fmt(sales.reduce((a, s) => a + s.total, 0))} icon="🛒" color="#f0f0f0" />
            <StatCard label="Cantidad" value={sales.length} icon="📋" color="#4facfe" />
          </div>
          {[...sales].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(s => (
            <div key={s.id} style={{ background: "#0f1117", border: "1px solid #1e2130", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ color: "#f0f0f0", fontWeight: 700 }}>{s.clientName}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Badge color={s.paid ? "#00d4aa" : "#ff9f43"}>{s.paid ? "Cobrado" : "Pendiente"}</Badge>
                  <span style={{ color: "#f0f0f0", fontWeight: 800 }}>{fmt(s.total)}</span>
                </div>
              </div>
              <div style={{ color: "#5a6080", fontSize: 12 }}>{fmtDate(s.createdAt)} · {s.collaboratorName}</div>
              <div style={{ color: "#5a6080", fontSize: 12, marginTop: 4 }}>{s.items.map(i => `${i.emoji || ""}${i.name} ×${i.qty}`).join(", ")}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "productos" && (
        <div>
          {productList.map(([name, data]) => (
            <div key={name} style={{ background: "#0f1117", border: "1px solid #1e2130", borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#f0f0f0", fontWeight: 700 }}>{data.emoji} {name}</div>
                <div style={{ color: "#5a6080", fontSize: 12 }}>{data.qty} unidades vendidas</div>
              </div>
              <div style={{ color: "#00d4aa", fontWeight: 800 }}>{fmt(data.total)}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "clientes" && (
        <div>
          {debtors.length === 0 && <div style={{ color: "#5a6080", textAlign: "center", padding: 40 }}>🎉 Sin deudas pendientes</div>}
          {debtors.map(c => (
            <div key={c.id} style={{ background: "#0f1117", border: "1px solid #1e2130", borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#f0f0f0", fontWeight: 700 }}>{c.name}</div>
                <div style={{ color: "#5a6080", fontSize: 12 }}>{c.phone}</div>
              </div>
              <Badge color="#ff9f43">{fmt(c.balance)}</Badge>
            </div>
          ))}
        </div>
      )}

      {tab === "gastos" && (
        <div>
          <StatCard label="Total gastos" value={fmt(expenses.reduce((a, e) => a + e.amount, 0))} icon="📤" color="#ff4757" />
          <div style={{ marginTop: 16 }}>
            {[...expenses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(e => (
              <div key={e.id} style={{ background: "#0f1117", border: "1px solid #1e2130", borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: "#f0f0f0", fontWeight: 700 }}>{e.desc}</div>
                  <div style={{ color: "#5a6080", fontSize: 12 }}>{fmtDate(e.createdAt)} · {e.type} · {e.collaboratorName}</div>
                </div>
                <div style={{ color: "#ff4757", fontWeight: 800 }}>{fmt(e.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// TEAM
// ============================================================
const TeamScreen = ({ user }) => {
  const [users, setUsers] = useData("users");
  const [showNew, setShowNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "colaborador", password: "1234", active: true });

  const create = () => {
    if (!form.name || !form.email) return;
    setUsers([...users, { id: uid(), ...form }]);
    setShowNew(false); setForm({ name: "", email: "", role: "colaborador", password: "1234", active: true });
  };

  const toggle = (id) => setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
  const deleteUser = (id) => { setUsers(users.filter(u => u.id !== id)); setConfirmDelete(null); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#f0f0f0", fontSize: 20, fontWeight: 800, margin: 0 }}>👥 Equipo</h2>
        {user.role === "admin" && <Btn onClick={() => setShowNew(true)} style={{ padding: "8px 16px", fontSize: 14 }}>+ Invitar</Btn>}
      </div>
      {users.map(u => (
        <div key={u.id} style={{ background: "#0f1117", border: "1px solid #1e2130", borderRadius: 12, padding: "14px", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "#f0f0f0", fontWeight: 700 }}>{u.name}</span>
                <Badge color={u.role === "admin" ? "#4facfe" : "#7a8099"}>{u.role}</Badge>
                {!u.active && <Badge color="#5a6080">Inactivo</Badge>}
              </div>
              <div style={{ color: "#5a6080", fontSize: 12, marginTop: 2 }}>{u.email}</div>
            </div>
            {u.id === user.id
              ? <Badge color="#00d4aa">Tú</Badge>
              : user.role === "admin" && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => toggle(u.id)} style={{ background: u.active ? "#ff475722" : "#00d4aa22", border: "none", color: u.active ? "#ff4757" : "#00d4aa", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                    {u.active ? "Desactivar" : "Activar"}
                  </button>
                  <button onClick={() => setConfirmDelete(u)} style={{ background: "#ff475722", border: "none", color: "#ff4757", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                    🗑️ Quitar
                  </button>
                </div>
              )
            }
          </div>
        </div>
      ))}

      {showNew && (
        <Modal title="Invitar colaborador" onClose={() => setShowNew(false)}>
          <Input label="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <Input label="Contraseña inicial" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <Select label="Rol" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="colaborador">Colaborador</option>
            <option value="admin">Admin</option>
          </Select>
          <Btn onClick={create} style={{ width: "100%" }}>Crear colaborador</Btn>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Quitar colaborador" onClose={() => setConfirmDelete(null)}>
          <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <div style={{ color: "#f0f0f0", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{confirmDelete.name}</div>
            <div style={{ color: "#7a8099", fontSize: 14, marginBottom: 20 }}>¿Estás seguro que querés quitar a este colaborador? Esta acción no se puede deshacer.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="ghost" onClick={() => setConfirmDelete(null)} style={{ flex: 1 }}>Cancelar</Btn>
              <Btn variant="danger" onClick={() => deleteUser(confirmDelete.id)} style={{ flex: 1 }}>Sí, quitar</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ============================================================
// CONFIG / SETTINGS
// ============================================================
const ConfigScreen = ({ user, onReset }) => {
  const [confirm, setConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [done, setDone] = useState(false);

  const handleReset = () => {
    if (confirmText.toLowerCase() !== "reiniciar") return;
    // Keep clients (reset balance) and products, clear everything else
    const clients = storage.get("clients").map(c => ({ ...c, balance: 0 }));
    storage.set("clients", clients);
    storage.set("sales", []);
    storage.set("payments", []);
    storage.set("expenses", []);
    storage.set("movements", []);
    setConfirm(false);
    setConfirmText("");
    setDone(true);
    setTimeout(() => { setDone(false); onReset(); }, 2000);
  };

  const stats = {
    sales: storage.get("sales").length,
    payments: storage.get("payments").length,
    expenses: storage.get("expenses").length,
    clients: storage.get("clients").length,
    products: storage.get("products").length,
  };

  return (
    <div>
      <h2 style={{ color: "#f0f0f0", fontSize: 20, fontWeight: 800, margin: "0 0 20px" }}>⚙️ Configuración</h2>

      {done && (
        <div style={{ background: "#00d4aa18", border: "1.5px solid #00d4aa", borderRadius: 14, padding: 16, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ color: "#00d4aa", fontWeight: 800, fontSize: 16 }}>¡Consumos reiniciados!</div>
          <div style={{ color: "#5a6080", fontSize: 13, marginTop: 4 }}>Clientes y productos conservados</div>
        </div>
      )}

      {/* Current data summary */}
      <div style={{ background: "#0f1117", border: "1.5px solid #1e2130", borderRadius: 16, padding: 18, marginBottom: 20 }}>
        <div style={{ color: "#7a8099", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Estado actual del torneo</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Ventas", value: stats.sales, icon: "🛒", color: "#f0f0f0", keep: false },
            { label: "Pagos", value: stats.payments, icon: "💰", color: "#f0f0f0", keep: false },
            { label: "Gastos", value: stats.expenses, icon: "📤", color: "#f0f0f0", keep: false },
            { label: "Clientes", value: stats.clients, icon: "👥", color: "#00d4aa", keep: true },
            { label: "Productos", value: stats.products, icon: "🛍️", color: "#00d4aa", keep: true },
          ].map(r => (
            <div key={r.label} style={{ background: "#1a1d2e", borderRadius: 12, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 18 }}>{r.icon}</div>
                <div style={{ color: "#7a8099", fontSize: 12, marginTop: 2 }}>{r.label}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: r.color, fontWeight: 800, fontSize: 18 }}>{r.value}</div>
                {r.keep
                  ? <div style={{ background: "#00d4aa22", color: "#00d4aa", borderRadius: 5, padding: "1px 6px", fontSize: 10, fontWeight: 700, marginTop: 2 }}>SE CONSERVA</div>
                  : <div style={{ background: "#ff475722", color: "#ff4757", borderRadius: 5, padding: "1px 6px", fontSize: 10, fontWeight: 700, marginTop: 2 }}>SE BORRA</div>
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset block */}
      <div style={{ background: "#ff475710", border: "1.5px solid #ff475740", borderRadius: 16, padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>🔄</span>
          <div>
            <div style={{ color: "#ff4757", fontWeight: 800, fontSize: 16 }}>Reiniciar consumos</div>
            <div style={{ color: "#7a8099", fontSize: 13 }}>Borra ventas, pagos y gastos. Conserva clientes y productos.</div>
          </div>
        </div>

        <div style={{ background: "#ff475718", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
          <div style={{ color: "#ff9f43", fontSize: 13, fontWeight: 600 }}>⚠️ Esta acción no se puede deshacer. Úsala al iniciar un nuevo torneo.</div>
        </div>

        {!confirm ? (
          <Btn variant="danger" onClick={() => user.role === "admin" ? setConfirm(true) : null}
            disabled={user.role !== "admin"}
            style={{ width: "100%", padding: 14, fontSize: 15 }}>
            {user.role === "admin" ? "🔄 Reiniciar consumos del torneo" : "🔒 Solo admins pueden reiniciar"}
          </Btn>
        ) : (
          <div>
            <div style={{ color: "#f0f0f0", fontSize: 14, marginBottom: 10 }}>
              Escribí <strong style={{ color: "#ff4757" }}>reiniciar</strong> para confirmar:
            </div>
            <Input
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="Escribí: reiniciar"
              style={{ borderColor: confirmText.toLowerCase() === "reiniciar" ? "#ff4757" : "#252840" }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="ghost" onClick={() => { setConfirm(false); setConfirmText(""); }} style={{ flex: 1 }}>Cancelar</Btn>
              <Btn variant="danger" onClick={handleReset} disabled={confirmText.toLowerCase() !== "reiniciar"} style={{ flex: 2 }}>
                Confirmar reinicio
              </Btn>
            </div>
          </div>
        )}
      </div>

      {/* App info */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>🏸</div>
        <div style={{ color: "#3a4060", fontSize: 13 }}>Cantina Pádel v1.0</div>
        <div style={{ color: "#252840", fontSize: 11, marginTop: 4 }}>Sistema de gestión de cantina para torneos</div>
      </div>
    </div>
  );
};

// ============================================================
// APP
// ============================================================
export default function App() {
  const SESSION_KEY = "padel_session";
  const SESSION_TTL = 2 * 60 * 60 * 1000; // 2 horas en ms

  const loadSession = () => {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (s && s.user && Date.now() - s.loginAt < SESSION_TTL) return s.user;
    } catch {}
    return null;
  };

  const saveSession = (u) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: u, loginAt: Date.now() }));
  };

  const clearSession = () => localStorage.removeItem(SESSION_KEY);

  const [user, setUser] = useState(() => loadSession());
  const [screen, setScreen] = useState("dashboard");

  useEffect(() => { seed(); }, []);

  // Chequear expiración cada minuto
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      if (!loadSession()) { clearSession(); setUser(null); }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogin = (u) => { saveSession(u); setUser(u); };
  const handleLogout = () => { clearSession(); setUser(null); };

  if (!user) return <Login onLogin={handleLogin} />;

  const nav = [
    { id: "dashboard", icon: "📊", label: "Inicio" },
    { id: "sales", icon: "🛒", label: "Venta" },
    { id: "payments", icon: "💰", label: "Pagos" },
    { id: "expenses", icon: "📤", label: "Gastos" },
    { id: "clients", icon: "👥", label: "Clientes" },
    { id: "products", icon: "🛍️", label: "Productos" },
    { id: "cash", icon: "💵", label: "Caja" },
    { id: "reports", icon: "📈", label: "Reportes" },
    { id: "team", icon: "🏸", label: "Equipo" },
    { id: "config", icon: "⚙️", label: "Config" },
  ];

  const screens = {
    dashboard: <Dashboard user={user} setScreen={setScreen} />,
    sales: <SalesScreen user={user} />,
    payments: <PaymentsScreen user={user} />,
    expenses: <ExpensesScreen user={user} />,
    clients: <ClientsScreen user={user} />,
    products: <ProductsScreen user={user} />,
    cash: <CashScreen />,
    reports: <ReportsScreen />,
    team: <TeamScreen user={user} />,
    config: <ConfigScreen user={user} onReset={() => setScreen("dashboard")} />,
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Inter', sans-serif", background: "#080a12", minHeight: "100vh", color: "#f0f0f0", maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: 80 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      
      {/* Header */}
      <div style={{ background: "#0a0c16", borderBottom: "1px solid #1e2130", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏸</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#f0f0f0", letterSpacing: "-0.02em" }}>Cantina Pádel</div>
            <div style={{ fontSize: 11, color: "#3a4060" }}>{nav.find(n => n.id === screen)?.label}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#5a6080" }}>{user.name}</div>
            <Badge color={user.role === "admin" ? "#4facfe" : "#7a8099"}>{user.role}</Badge>
          </div>
          <button onClick={handleLogout} style={{ background: "#1a1d2e", border: "none", color: "#7a8099", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>⏻</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 16px" }}>{screens[screen]}</div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#0a0c16", borderTop: "1px solid #1e2130", display: "flex", overflowX: "auto", zIndex: 100 }}>
        {nav.map(n => (
          <button key={n.id} onClick={() => setScreen(n.id)} style={{ flex: 1, background: "none", border: "none", padding: "10px 4px 14px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 52 }}>
            <span style={{ fontSize: 19 }}>{n.icon}</span>
            <span style={{ fontSize: 9, color: screen === n.id ? "#00d4aa" : "#3a4060", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{n.label}</span>
            {screen === n.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#00d4aa" }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
