# Truque do Mel 🍯

App leve de ritual matinal (Next.js + Tailwind + Framer Motion), hospedado na Vercel e protegido pelo Cloudflare Access (Zero Trust).

## Stack

- **Next.js 16** (App Router, React 19)
- **Tailwind CSS v4** — tema custom em `src/app/globals.css` (`@theme`), cores/tipografia batendo com o mockup original
- **Framer Motion** — transições de tela, preenchimento animado do jarro, accordion, streak pill
- **jose** — verificação do JWT do Cloudflare Access no middleware (edge runtime)
- Estado local em `localStorage` (`src/lib/storage.ts`) — sem backend/DB necessário para o MVP

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Sem as variáveis do Cloudflare Access configuradas, o middleware libera todas as requisições (ver `src/proxy.ts`), então o dev local funciona normalmente sem login.

## Deploy na Vercel + autenticação via Cloudflare Access

A ideia: a Vercel hospeda o app normalmente; o Cloudflare fica na frente do domínio como proxy e bloqueia quem não estiver autenticado **antes** da requisição chegar na Vercel. O app não precisa de tela de login — só lê a identidade que o Cloudflare já verificou.

### 1. Deploy na Vercel

```bash
vercel
# ou conecte o repositório pelo dashboard da Vercel
```

### 2. Apontar o domínio pro Cloudflare (modo proxied)

No Cloudflare, adicione o domínio/subdomínio que você vai usar, com o registro DNS (CNAME pra `cname.vercel-dns.com`, por exemplo) em modo **Proxied** (nuvem laranja). Isso é o que permite o Access interceptar a requisição antes da Vercel.

### 3. Criar uma Access Application no Zero Trust

No painel Cloudflare → **Zero Trust → Access → Applications → Add an application → Self-hosted**:

1. Aponte para o domínio/subdomínio do app.
2. Configure a política de quem pode entrar (ex: "e-mails terminados em @seudominio.com", ou uma lista de e-mails específicos).
3. Escolha o método de login (email OTP é o mais simples pra começar).
4. Salve e copie:
   - **Team domain** (ex: `seutime.cloudflareaccess.com`)
   - **Application Audience (AUD) tag** (na aba Overview da aplicação)

### 4. Configurar as env vars na Vercel

No projeto da Vercel, em Settings → Environment Variables:

```
CF_ACCESS_TEAM_DOMAIN=seutime.cloudflareaccess.com
CF_ACCESS_AUD=<aud tag copiado no passo anterior>
```

Redeploy. A partir daqui, `src/proxy.ts` passa a exigir e verificar o JWT (`Cf-Access-Jwt-Assertion` / cookie `CF_Authorization`) em toda requisição, e expõe o e-mail do usuário autenticado pra Server Components via `getUserEmail()` (`src/lib/auth.ts`).

> Cloudflare Access já bloqueia no edge antes de chegar na Vercel — a verificação no middleware é defesa em profundidade (garante que o JWT é legítimo e pega o e-mail pra usar no app), não a única camada de proteção.

## Estrutura

```
src/
  app/            layout, page (server component) e estilos globais
  components/     UI (telas, jarro animado, nav, accordion, etc.)
  lib/            estado local, tipos, helpers de data, auth/Cloudflare Access
  proxy.ts        verificação do Cloudflare Access JWT
```
