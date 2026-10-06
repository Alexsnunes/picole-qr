const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001/api").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Não foi possível concluir a operação.");
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  login: (pin) => request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ pin })
  }),

  getProducts: (publicOnly = false) =>
    request(`/products?public=${publicOnly}`),

  createProduct: (data, token) =>
    request("/products", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    }),

  updateProduct: (id, data, token) =>
    request(`/products/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    }),

  setAvailability: (id, available, token) =>
    request(`/products/${id}/availability`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ available })
    }),

  deleteProduct: (id, token) =>
    request(`/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    }),

  getSettings: () => request("/settings"),

  updateSettings: (data, token) =>
    request("/settings", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    })
};
