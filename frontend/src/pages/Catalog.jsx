import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.getProducts(true), api.getSettings()])
      .then(([items, config]) => {
        setProducts(items);
        setSettings(config);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="catalog-page">
      <header className="catalog-hero">
        <div className="brand-mark">🍦</div>
        <div>
          <span className="eyebrow">CATÁLOGO DE SABORES</span>
          <h1>{settings?.storeName || "Picolés Delícia"}</h1>
          <p>{settings?.storeSubtitle || "Escolha seu sabor favorito"}</p>
        </div>
      </header>

      <section className="catalog-content">
        <div className="section-heading">
          <div>
            <span className="eyebrow">DISPONÍVEIS AGORA</span>
            <h2>Sabores</h2>
          </div>
          <span className="count-badge">{products.length}</span>
        </div>

        {loading && <div className="state-card">Carregando sabores...</div>}
        {error && <div className="state-card error">{error}</div>}

        {!loading && !error && products.length === 0 && (
          <div className="state-card">
            <strong>Nenhum sabor disponível no momento.</strong>
            <p>Volte mais tarde para conferir as novidades.</p>
          </div>
        )}

        <div className="product-grid">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <footer className="catalog-footer">
        <span>Atualizado pelo vendedor</span>
        <Link to="/admin">Área do vendedor</Link>
      </footer>
    </main>
  );
}
