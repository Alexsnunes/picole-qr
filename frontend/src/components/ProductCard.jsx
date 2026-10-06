export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <span aria-hidden="true">🍧</span>
        )}
      </div>

      <div className="product-info">
        <div>
          <h2>{product.name}</h2>
          {product.description && <p>{product.description}</p>}
        </div>
        <strong>
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
          }).format(product.price)}
        </strong>
      </div>
    </article>
  );
}
