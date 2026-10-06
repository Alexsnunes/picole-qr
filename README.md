# Picolé QR — versão online

Versão preparada para publicar gratuitamente usando:

- Frontend React/Vite no Render Static Site.
- Backend Node.js/Express no Render Web Service.
- PostgreSQL no Supabase.
- QR Code gerado no navegador.
- Dados persistentes no PostgreSQL.

## 1. Banco Supabase

Crie um projeto no Supabase e abra o SQL Editor.

Execute:

```sql
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10,2) not null default 0,
  image_url text not null default '',
  available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists settings (
  id integer primary key default 1,
  store_name text not null default 'Picolés Delícia',
  store_subtitle text not null default 'Escolha seu sabor favorito',
  currency text not null default 'BRL',
  public_url text not null default 'http://localhost:5173',
  constraint settings_single_row check (id = 1)
);

insert into settings (id)
values (1)
on conflict (id) do nothing;

insert into products (name, description, price, sort_order)
select 'Morango', 'Picolé cremoso de morango.', 3.50, 1
where not exists (select 1 from products);

insert into products (name, description, price, sort_order)
select 'Chocolate', 'Chocolate cremoso e delicioso.', 4.00, 2
where (select count(*) from products) = 1;

insert into products (name, description, price, sort_order)
select 'Manga', 'Sabor refrescante de manga.', 3.50, 3
where (select count(*) from products) = 2;
```

## 2. Backend no Render

Crie um Web Service apontando para a pasta `backend`.

Build Command:

```text
npm install
```

Start Command:

```text
npm start
```

Environment Variables:

```text
ADMIN_PIN=SEU_PIN
DATABASE_URL=SUA_CONNECTION_STRING_DO_SUPABASE
CORS_ORIGIN=https://SEU-FRONTEND.onrender.com
PORT=10000
```

O Render exige que o servidor escute em `0.0.0.0`; este projeto já está configurado para isso.

## 3. Frontend no Render

Crie um Static Site apontando para a pasta `frontend`.

Build Command:

```text
npm install && npm run build
```

Publish Directory:

```text
dist
```

Environment Variable:

```text
VITE_API_URL=https://SEU-BACKEND.onrender.com/api
```

Para o React Router funcionar no Render, crie uma Rewrite:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

## 4. URL pública e QR

Depois que o frontend tiver uma URL, entre no painel `/admin`.

Exemplo:

```text
https://meus-picoles.onrender.com/admin
```

Informe a URL do catálogo:

```text
https://meus-picoles.onrender.com
```

O QR Code será gerado automaticamente.

Depois disso, você pode imprimir o QR. Alterar sabores, preços ou disponibilidade não exige trocar o QR, porque o QR aponta apenas para o endereço do catálogo.

## Observação sobre o plano gratuito

O Render oferece Web Services e Static Sites gratuitos, mas os Web Services gratuitos podem entrar em suspensão após período sem tráfego e o filesystem é efêmero. Por isso os dados deste projeto ficam no PostgreSQL externo. O plano gratuito do Supabase atualmente inclui PostgreSQL, mas projetos gratuitos podem ser pausados após uma semana de inatividade. Confira as condições atuais antes de usar como operação crítica.
