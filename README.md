# API de Gerenciamento de Prescrições

## Introdução
Uma api que gerencia prescrições de um médico/profissional de forma completa, com sistema de filtro, paginação e métricas.

## Tecnologias
- Linguagem: [Node.js](https://nodejs.org)
- Framework: [Fastify.js](https://www.fastify.io)
- Banco de Dados: [PostgreSQL](https://www.postgresql.org)
- Autenticação: [JWT](https://jwt.io)
- ORM: [PrismaORM](https://www.prisma.io)
- Gerenciamento de Dependências: [pnpm](https://pnpm.io)

## Endpoints

| Método | Endpoint                | Descrição                                           |
|--------|-------------------------|-----------------------------------------------------|
| POST   | `/users/sign-up`        | Registrar um novo usuário                           |
| POST   | `/users/sign-in`        | Fazer login e obter o token de autenticação         |
| GET    | `/prescriptions`        | Listar todas as prescrições do usuário autenticado  |
| POST   | `/prescriptions`        | Criar uma nova prescrição                           |
| PUT    | `/prescriptions/:id`    | Atualizar uma prescrição existente                  |
| DELETE | `/prescriptions/:id`    | Deletar uma prescrição                              |

## Instalação
Clone o repositório:

```bash
git clone https://github.com/izaiasmorais/prescriptions-api
cd prescriptions-api
```

Instale as dependências:

```bash
pnpm install
```

Configure o arquivo .env com suas credenciais:

```env
DATABASE_ULR=""
```

## Executando o Projeto
Inicie o servidor:

```bash
pnpm dev
```
