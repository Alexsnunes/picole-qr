
import { useState } from "react";

const PIX_KEY = "11987570150";

export default function PixPayment() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function copyPixKey() {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      setError("");

      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (err) {
      console.error("Erro ao copiar a chave Pix:", err);
      setError("Não foi possível copiar automaticamente. Selecione o número e copie.");
    }
  }

  return (
    <section className="pix-payment">
      <span className="eyebrow">PAGAMENTO</span>

      <h2>Pague com Pix</h2>

      <p>
        Copie a chave Pix abaixo e use o aplicativo do seu banco para realizar
        o pagamento.
      </p>

      <div className="pix-receiver"> 
        <strong>Juliana Martins</strong>
        <span>    São Paulo - SP</span>
      </div>

      <label className="pix-code-label" htmlFor="pix-key">
        Chave Pix — celular
      </label>

      <input
        id="pix-key"
        className="pix-key-input"
        type="text"
        value={PIX_KEY}
        readOnly
        onFocus={(event) => event.target.select()}
      />

      <button
        type="button"
        className="primary-button pix-copy-button"
        onClick={copyPixKey}
      >
        {copied ? "Chave Pix copiada!" : "Copiar chave Pix"}
      </button>

      {error && (
        <p className="pix-error" role="alert">
          {error}
        </p>
      )}

      <p className="pix-note">
        Antes de confirmar, confira se o nome da recebedora está correto no
        aplicativo do banco.
      </p>
    </section>
  );
}
