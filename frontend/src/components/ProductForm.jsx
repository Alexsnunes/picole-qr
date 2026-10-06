import { useEffect, useState } from "react";

const empty = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  available: true,
  sortOrder: 0
};

export default function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    setForm(product ? {
      ...product,
      price: String(product.price),
      sortOrder: String(product.sortOrder)
    } : empty);
  }, [product]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    await onSave({
      name: form.name,
      description: form.description,
      price: Number(form.price),
      imageUrl: form.imageUrl,
      available: Boolean(form.available),
      sortOrder: Number(form.sortOrder)
    });
    if (!product) setForm(empty);
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <div className="form-title">
        <div>
          <span className="eyebrow">{product ? "Editar" : "Novo cadastro"}</span>
          <h2>{product ? "Editar picolé" : "Adicionar picolé"}</h2>
        </div>
        {product && <button type="button" className="ghost-button" onClick={onCancel}>Cancelar</button>}
      </div>

      <label>
        Sabor
        <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Ex.: Morango" required />
      </label>

      <label>
        Descrição
        <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Uma breve descrição" rows="3" />
      </label>

      <div className="form-grid">
        <label>
          Preço (R$)
          <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} required />
        </label>

        <label>
          Ordem
          <input type="number" min="0" value={form.sortOrder} onChange={(e) => update("sortOrder", e.target.value)} />
        </label>
      </div>

      <label>
        URL da foto
        <input value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://..." />
      </label>

      <label className="checkbox-label">
        <input type="checkbox" checked={form.available} onChange={(e) => update("available", e.target.checked)} />
        Disponível para clientes
      </label>

      <button className="primary-button" type="submit">
        {product ? "Salvar alterações" : "Cadastrar picolé"}
      </button>
    </form>
  );
}
