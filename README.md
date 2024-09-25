# API de Gerenciamento de Prescrições

### Introdução
Essa API tem como objetivo gerenciar prescrições médicas de forma eficiente. Um usuário pode ser um "manager" de várias prescrições, podendo criar, editar e visualizar os detalhes das prescrições associadas.

### Tecnologias
- Linguagem: Node.js
- Framework: Fastify.js
- Banco de Dados: PostgreSQL
- Autenticação: JWT
- ORM: PrismaORM
- Gerenciamento de Dependências: pnpm

### Endpoints

| Método | Endpoint               | Descrição                                           |
|--------|------------------------|-----------------------------------------------------|
| POST   | `/users/register`       | Registrar um novo usuário                           |
| POST   | `/users/login`          | Fazer login e obter o token de autenticação         |
| GET    | `/prescriptions`        | Listar todas as prescrições do usuário autenticado  |
| POST   | `/prescriptions`        | Criar uma nova prescrição                           |
| PUT    | `/prescriptions/:id`    | Atualizar uma prescrição existente                  |
| DELETE | `/prescriptions/:id`    | Deletar uma prescrição                              |

### Instalação
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

### Executando o Projeto
Inicie o servidor:

```bash
pnpm dev
```
