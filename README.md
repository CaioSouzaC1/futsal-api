# Futsal API

## Descrição
Esta é a API do projeto Futsal, que gerencia informações sobre times de futebol de salão, partidas e jogadores.

Construída com NodeJs & Typescript, orientada a objetos e a testes automatizados.

## Recursos

- Registro e autenticação de usuários
- Gerenciamento de times
- Gerenciamento de jogadores
- Registro de partidas e cálculo de pontos
- Tokens de autenticação com JWT
- Middleware de autenticação
- Testes Automatizados
- Arquivo de log para possíveis erros

## Rotas:
Aqui apenas listarei as rotas, todas as informações e como as requisições devem ser feitas estão disponíveis nas configurações do Postman.

### Rotas de usuário

```POST``` /user/create: Registro de usuários.

```POST``` /user/login: Login de usuários para obter um token de acesso.

### Rotas de Time

```POST``` /team: Criação de times.

```GET``` /team: Recupera uma lista de todos os times.

```GET``` /team/:id: Recupera informações de um time específico.

```PUT``` /team/:id: Atualiza informações de um time específico.

```DELETE``` /team/:id: Deleta um time específico.

### Rotas de Jogador

```POST``` /player: Criação de jogador.

```GET``` /player: Recupera uma lista de todos os jogadores.

```PUT``` /player/:id: Atualiza informações de um jogador específico.

```DELETE``` /player/:id: Deleta um jogador específico.

### Rotas de Partida

```POST``` /game: Criação de partidas.

```GET``` /game: Recupera uma lista de todas as partidas.

```GET``` /game/:id: Recupera informações de uma partida específica.

```PUT``` /game/:id: Atualiza informações de uma partida específica.

```DELETE``` /game/:id: Deleta uma partida específica.

## Dependências
Este projeto utiliza as seguintes tecnologias e bibliotecas:

Node.js

Express.js

Prisma (ORM)

JSON Web Tokens (JWT) para autenticação


## instalando a aplicação

#### 1 - Clonar o Repositório

#### 2 - Instalar Dependências.

Utilize o Yarn para instalar as dependências do projeto:

```bash
  yarn
```
#### 3 - Configurar Variáveis de Ambiente
Existe um exemplo de .env com as configurações necessárias

#### 4 - Rode as migrações do prisma

```bash
  yarn prisma generate
  yarn prisma db push
```

#### 5 - Rodando os testes automatizados

Para rodar o teste E2E, rode o seguinte comando

```bash
  yarn jest --runInBand e2e.login.team.test.ts 
```

## Testes manuais 

#### Postman Collection
Dentro da pasta Postman existe um json pronto para ser importado.

## Passos Iniciais

### 1 - Criação de Usuário

Para começar a usar a API, você precisa criar um usuário. Isso é feito através de uma solicitação POST para a rota de criação de usuário. 

Também está rodando via Postman neste link:
https://www.postman.com/flight-engineer-19866197/workspace/futsalapi

### 2 - Login de Usuário

Após fazer o login será retornado um Access Token, que deverá ser utilizado via Bearer Token:

"Authorization: Bearer seu-access-token"

Os tempos de expiração dos tokens são, 30 minutos para os Access Tokens e 7 Dias para os Refresh Tokens.

### 3 - Utilização das rotas protegidas

A a autenticação dessas rotas é feita por meio do access token, caso o mesmo esteja expirado o sistema irá gerar outro automaticamente, e você precisará atualizar o mesmo.

Caso fique com alguma dúvida estou à disposição!
## Feito por Caio César de Souza!