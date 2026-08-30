# 🛠️ DevKit — Especificação de Melhorias e Refinamentos de Arquitetura

Este documento consolida as diretrizes técnicas para implementar as melhorias de resiliência nas rotas de IA, sincronização de créditos, checkout híbrido no Stripe e as 3 novas ferramentas na plataforma **DevKit** (`dev-kit.tech`).

---

## 1. 🛡️ Resiliência & Transacionalidade no Consumo de Créditos de IA

### Problema Atual
Atualmente, se o crédito for debitado antes da chamada ao modelo Gemini e a API retornar erro/timeout, o usuário perde o crédito sem receber a resposta.

### Implementação Obrigatória em `/api/ai/*`
1. **Verificação Prévia:** Validar se o usuário possui saldo suficiente (`free_credits_remaining > 0` ou `purchased_credits > 0`) antes de iniciar o stream/chamada.
2. **Execução Segura:** Disparar a chamada para a API `@google/genai` dentro de um bloco `try/catch`.
3. **Dedução Post-Success:** 
   - Apenas abater o crédito e registrar em `credit_transactions` após o recebimento com sucesso do payload ou início confirmado do stream.
   - Or```markdown
# Guia de Implementação e Boas Práticas do Projeto

Este documento estabelece os padrões técnicos, arquiteturais e de qualidade que devem ser seguidos em todo o ciclo de desenvolvimento do projeto.

---

## 1. Arquitetura e Estrutura de Pastas

* **Organização Modular:** Divida o código por módulos funcionais/domínio, desacoplando regras de negócio da camada de visualização.
* **Componentização:**
  * Componentes de UI genéricos (botões, inputs, modais) devem ficar isolados em `components/ui`.
  * Componentes complexos e com estado específico de página devem residir em `features/` ou pastas dedicadas.
* **Camada de Serviços / API:** Centralize chamadas HTTP, SDKs externos e clientes de dados em `services/` ou `lib/`.

---

## 2. Padrões de Código e Tipagem

* **TypeScript Estrito:**
  * Proibido o uso de `any`; utilize `unknown`, genéricos ou interfaces explícitas.
  * Valide dados externos (APIs, formulários, URLs) no runtime utilizando bibliotecas de schema como **Zod**.
* **Clean Code & Imutabilidade:**
  * Prefira funções puras e utilitários sem efeitos colaterais (`side effects`).
  * Mantenha componentes pequenos e com responsabilidade única (Single Responsibility Principle).

---

## 3. Performance e Otimização

* **Carregamento e Bundling:**
  * Utilize divisão de código dinâmica (`lazy loading` / `dynamic imports`) para ferramentas pesadas ou rotas não essenciais no primeiro carregamento.
  * Otimize imagens e assets usando formatos modernos (WebP, AVIF) e dimensões explícitas para evitar *Cumulative Layout Shift* (CLS).
* **Renderização:**
  * Evite re-renderizações desnecessárias memoizando cálculos complexos (`useMemo`) ou callbacks passados via props (`useCallback`).
  * Mantenha o estado global o mais enxuto possível; use estado local para comportamentos de interface efêmeros.

---

## 4. UI/UX, Acessibilidade e SEO

* **Design e Responsividade:**
  * Abordagem *mobile-first* com breakpoints consistentes.
  * Feedback visual explícito para estados de *loading*, *empty state*, *hover*, *focus* e *error*.
* **Acessibilidade (a11y):**
  * Tags semânticas do HTML5 (`<main>`, `<nav>`, `<section>`, `<article>`, `<aside>`).
  * Inclusão de atributos `aria-label` e estados `aria-expanded`/`aria-hidden` onde elementos visuais não forem autoexplicativos para leitores de tela.
* **SEO e Metadados:**
  * Título dinâmico, meta description e tags Open Graph / Twitter Cards para cada rota relevante.
  * Geração automatizada de `sitemap.xml` e configuração correta de `robots.txt`.

---

## 5. Integrações, Scripts e Monetização

* **Carregamento de Scripts de Terceiros:**
  * Scripts externos (Analytics, AdSense, etc.) devem ser carregados de forma assíncrona ou diferida (`lazyOnload` / `defer`) para não bloquear a thread principal.
* **Layout Stability (Ads):**
  * Reserve containers com altura e largura mínimas pré-definidas para slots de anúncios e banners, prevenindo quebras e pulos de layout ao renderizar.

---

## 6. Fluxo de Trabalho e Deploy

* **Controle de Versão:**
  * Branches padronizadas (`feat/`, `fix/`, `chore/`, `refactor/`).
  * Commits semânticos no padrão *Conventional Commits*.
* **Qualidade Automatizada:**
  * Pipeline de CI/CD para rodar linters (ESLint/Biome), checagem de tipos (`tsc --noEmit`) e testes unitários antes de qualquer merge.