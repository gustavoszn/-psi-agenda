# PsiAgenda

Aplicação demonstrativa para organização da rotina de profissionais de psicologia. O projeto reúne agenda, cadastro de pacientes, indicadores e um portal separado para que cada paciente acompanhe seus atendimentos.

Os dados são fictícios e persistidos no navegador. A camada de serviços isola essa implementação da interface, permitindo substituir o armazenamento local por uma API sem reestruturar as páginas.

## Funcionalidades

- Dashboard calculado a partir dos pacientes e consultas cadastrados
- Agenda diária, semanal e mensal com detecção de conflitos e recorrência
- Cadastro brasileiro de pacientes, incluindo CPF, CEP e busca de endereço
- Perfil integrado do paciente com dados cadastrais e histórico de consultas
- Busca e filtros por status
- Portal do paciente com confirmação, cancelamento e solicitação de reagendamento
- Autenticação demonstrativa por perfil profissional ou paciente
- Persistência local, temas claro/escuro e layout responsivo

## Tecnologias

- React 19 e React Router
- Vite 8 e Tailwind CSS 4
- React Hook Form e date-fns
- Framer Motion e Oxlint

## Estrutura

```text
src/
  components/   componentes reutilizáveis e formulários
  contexts/     autenticação, tema e estado dos dados
  hooks/        comportamentos compartilhados
  layouts/      estruturas dos portais profissional e paciente
  pages/        páginas organizadas por módulo
  routes/       rotas e proteção por perfil
  services/     persistência e mocks que simulam uma API
  utils/        datas, regras de agenda e configurações de status
```

Consultas usam `patientId` para referenciar o cadastro do paciente. Dashboard, agenda, detalhes e portal consomem a mesma fonte de dados; alterações feitas em um módulo aparecem nos demais.

## Executando localmente

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

O login profissional aceita qualquer e-mail válido e senha com pelo menos quatro caracteres. Para o portal do paciente, use o e-mail de um paciente ativo, como `ana.clara@email.com`, e qualquer senha com quatro ou mais caracteres.

## Qualidade e build

```bash
npm run lint
npm run build
npm run preview
```

## Deploy

O projeto está preparado para deploy na Vercel. O arquivo `vercel.json` redireciona rotas da SPA para `index.html`, permitindo atualizar diretamente endereços como `/agenda` e `/pacientes/1`.

Não há variáveis de ambiente obrigatórias para o modo demonstrativo. O arquivo `src/services/supabase.js` mantém um ponto de extensão opcional para integração futura.

## Decisões técnicas

- O domínio permanece no front-end para manter o projeto simples e demonstrável.
- A interface não acessa `localStorage` diretamente; essa responsabilidade fica na camada de serviços.
- Relacionamentos usam identificadores, evitando duplicar dados de pacientes nas consultas.
- Informações clínicas sensíveis não são exibidas no portal do paciente.

Este é um projeto de portfólio. Não deve ser usado para armazenar dados reais ou sensíveis sem autenticação, autorização, auditoria e infraestrutura adequadas.
