import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import ProductForm from "../components/ProductForm.jsx";

const TOKEN_KEY = "picole_admin_token";

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [pin, setPin] = useState("");
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [qrData, setQrData] = useState("");

  const catalogUrl = useMemo(() => {
    if (settings?.publicUrl) return settings.publicUrl.replace(/\/$/, "");
    return window.location.origin;
  }, [settings]);

  async function load() {
    try {
      const [items, config] = await Promise.all([api.getProducts(false), api.getSettings()]);
      setProducts(items);
      setSettings(config);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (token) load();
  }, [token]);

  useEffect(() => {
    if (!settings) return;
    QRCode.toDataURL(catalogUrl, {
      width: 720,
      margin: 2,
      errorCorrectionLevel: "H"
    }).then(setQrData).catch(() => setQrData(""));
  }, [catalogUrl, settings]);

  async function login(event) {
    event.preventDefault();
    try {
      const result = await api.login(pin);
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
      setPin("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
  }

  async function saveProduct(data) {
    try {
      if (editing) {
        await api.updateProduct(editing.id, data, token);
      } else {
        await api.createProduct(data, token);
      }
      setEditing(null);
      setMessage("Picolé salvo com sucesso.");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleAvailability(product) {
    try {
      await api.setAvailability(product.id, !product.available, token);
      setMessage(product.available ? "Marcado como esgotado." : "Picolé reativado.");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(product) {
    if (!window.confirm(`Remover "${product.name}"?`)) return;
    try {
      await api.deleteProduct(product.id, token);
      setMessage("Picolé removido.");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveSettings(event) {
    event.preventDefault();
    try {
      const form = new FormData(event.currentTarget);
      const data = {
        storeName: String(form.get("storeName")),
        storeSubtitle: String(form.get("storeSubtitle")),
        currency: String(form.get("currency")),
        publicUrl: String(form.get("publicUrl"))
      };
      const updated = await api.updateSettings(data, token);
      setSettings(updated);
      setMessage("Configurações salvas.");
    } catch (err) {
      setError(err.message);
    }
  }

  function downloadQr() {
    if (!qrData) return;
    const a = document.createElement("a");
    a.href = qrData;
    a.download = "qrcode-picoles.png";
    a.click();
  }

  if (!token) {
    return (
      <main className="admin-login-page">
        <form className="login-card" onSubmit={login}>
          <div className="brand-mark">🍦</div>
          <span className="eyebrow">PAINEL DO VENDEDOR</span>
          <h1>Gerenciar picolés</h1>
          <p>Digite o PIN para administrar os sabores e o QR Code.</p>

          {error && <div className="alert error">{error}</div>}

          <label>
            PIN
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Digite seu PIN"
              autoFocus
            />
          </label>

          <button className="primary-button" type="submit">Entrar</button>
          <Link className="back-link" to="/">← Ver catálogo</Link>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <div>
          <span className="eyebrow">PAINEL</span>
          <h1>{settings?.storeName || "Picolés Delícia"}</h1>
        </div>
        <div className="top-actions">
          <Link className="secondary-button" to="/">Ver catálogo</Link>
          <button className="ghost-button" onClick={logout}>Sair</button>
        </div>
      </header>

      {(message || error) && (
        <div className={`alert ${error ? "error" : "success"}`}>
          {error || message}
          <button onClick={() => { setMessage(""); setError(""); }}>×</button>
        </div>
      )}

      <section className="admin-layout">
        <div className="admin-main">
          <ProductForm
            product={editing}
            onSave={saveProduct}
            onCancel={() => setEditing(null)}
          />

          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">ESTOQUE</span>
                <h2>Seus picolés</h2>
              </div>
              <span className="count-badge">{products.length}</span>
            </div>

            <div className="admin-products">
              {products.map((product) => (
                <article className={`admin-product ${!product.available ? "unavailable" : ""}`} key={product.id}>
                  <div className="mini-image">
                    {product.imageUrl ? <img src={product.imageUrl} alt="" /> : "🍧"}
                  </div>
                  <div className="admin-product-info">
                    <strong>{product.name}</strong>
                    <span>R$ {Number(product.price).toFixed(2).replace(".", ",")}</span>
                  </div>
                  <span className={`status ${product.available ? "available" : "soldout"}`}>
                    {product.available ? "Disponível" : "Esgotado"}
                  </span>
                  <div className="row-actions">
                    <button onClick={() => toggleAvailability(product)}>
                      {product.available ? "Esgotar" : "Ativar"}
                    </button>
                    <button onClick={() => setEditing(product)}>Editar</button>
                    <button className="danger-text" onClick={() => remove(product)}>Excluir</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="admin-side">
          <section className="panel qr-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">PARA SEUS CLIENTES</span>
                <h2>Seu QR Code</h2>
              </div>
            </div>
            <p className="muted">O QR abre diretamente o catálogo. Alterar os sabores não exige um novo QR Code.</p>

            <div className="qr-box">
              {qrData ? <img src={qrData} alt="QR Code do catálogo" /> : "Gerando QR..."}
            </div>

            <div className="qr-url">{catalogUrl}</div>
            <button className="primary-button" onClick={downloadQr} disabled={!qrData}>Baixar QR Code</button>
            <button className="secondary-button full-button" onClick={() => window.print()}>Imprimir página</button>
          </section>

          {settings && (
            <form className="panel settings-form" onSubmit={saveSettings}>
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">CONFIGURAÇÃO</span>
                  <h2>Catálogo</h2>
                </div>
              </div>

              <label>
                Nome da loja
                <input name="storeName" defaultValue={settings.storeName} required />
              </label>

              <label>
                Subtítulo
                <input name="storeSubtitle" defaultValue={settings.storeSubtitle} />
              </label>

              <label>
                URL pública
                <input name="publicUrl" type="url" defaultValue={settings.publicUrl} required />
              </label>

              <label>
                Moeda
                <input name="currency" defaultValue={settings.currency} required />
              </label>

              <button className="primary-button" type="submit">Salvar configurações</button>
            </form>
          )}
        </aside>
      </section>
    </main>
  );
}
