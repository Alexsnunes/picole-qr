
export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-info">
        <h2>{product.name}</h2>

        <strong>
          R$ 2,00
        </strong>
      </div>
    </article>
  );
}

