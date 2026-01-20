# Backend Architecture Flowcharts

This document contains flowcharts for the Backend Architecture, Authentication & Authorization, and Routes flow.

---

## 1. Backend Architecture Overview

```mermaid
graph TB
    Start([Client Request]) --> Server[Express Server<br/>index.js<br/>Port: 4000]
    
    Server --> Middleware1[CORS Middleware<br/>Cross-Origin Resource Sharing]
    Middleware1 --> Middleware2[JSON Parser Middleware<br/>express.json]
    
    Middleware2 --> Router{Route Handler}
    
    Router -->|/user/*| UserRoute[User Routes<br/>user.route.js]
    Router -->|/book/*| BookRoute[Book Routes<br/>book.route.js]
    
    UserRoute --> UserController[User Controller<br/>user.controller.js]
    BookRoute --> BookController[Book Controller<br/>book.controller.js]
    
    UserController --> UserModel[User Model<br/>user.model.js<br/>Mongoose Schema]
    BookController --> BookModel[Book Model<br/>book.model.js<br/>Mongoose Schema]
    
    UserModel --> MongoDB[(MongoDB Database<br/>Mongoose ODM)]
    BookModel --> MongoDB
    
    MongoDB --> Response[HTTP Response<br/>JSON Format]
    
    Response --> End([End])
    
    subgraph "Application Layer"
        Server
        Middleware1
        Middleware2
    end
    
    subgraph "Routing Layer"
        Router
        UserRoute
        BookRoute
    end
    
    subgraph "Business Logic Layer"
        UserController
        BookController
    end
    
    subgraph "Data Access Layer"
        UserModel
        BookModel
    end
    
    subgraph "Database Layer"
        MongoDB
    end
    
    style Server fill:#e1f5ff
    style MongoDB fill:#fff4e1
    style UserController fill:#e8f5e9
    style BookController fill:#e8f5e9
    style UserModel fill:#f3e5f5
    style BookModel fill:#f3e5f5
```

---

## 2. Authentication and Authorization Architecture

### 2.1 Unified Authentication Flow (Signup & Login)

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant UserRoute
    participant UserController
    participant Bcrypt
    participant UserModel
    participant MongoDB

    Note over Client,MongoDB: SIGNUP FLOW
    Client->>Express: POST /user/signup<br/>{fullname, email, password}
    Express->>UserRoute: Route to signup handler
    UserRoute->>UserController: signup(req, res)
    
    UserController->>UserModel: findOne({ email })
    UserModel->>MongoDB: Query: Find user by email
    MongoDB-->>UserModel: User document or null
    UserModel-->>UserController: User object or null
    
    alt User Already Exists
        UserController-->>Client: 400 Bad Request<br/>{message: "User already exists"}
    else User Does Not Exist
        UserController->>Bcrypt: hash(password, 10)
        Note over Bcrypt: Generate salt rounds: 10
        Bcrypt-->>UserController: Hashed password string
        
        UserController->>UserModel: new User({fullname, email, password: hashPassword})
        UserModel->>MongoDB: Save new user document
        MongoDB-->>UserModel: User saved successfully
        UserModel-->>UserController: Created user object
        
        UserController-->>Client: 201 Created<br/>{message: "User created successfully",<br/>user: {_id, fullname, email}}
    end

    Note over Client,MongoDB: LOGIN FLOW
    Client->>Express: POST /user/login<br/>{email, password}
    Express->>UserRoute: Route to login handler
    UserRoute->>UserController: login(req, res)
    
    UserController->>UserModel: findOne({ email })
    UserModel->>MongoDB: Query: Find user by email
    MongoDB-->>UserModel: User document or null
    UserModel-->>UserController: User object or null
    
    alt User Not Found
        UserController-->>Client: 400 Bad Request<br/>{message: "Invalid username or password"}
    else User Found
        UserController->>Bcrypt: compare(password, user.password)
        Note over Bcrypt: Compare plain password with hashed password
        Bcrypt-->>UserController: Boolean (isMatch)
        
        alt Password Matches
            UserController-->>Client: 200 OK<br/>{message: "Login successful",<br/>user: {_id, fullname, email}}
        else Password Does Not Match
            UserController-->>Client: 400 Bad Request<br/>{message: "Invalid username or password"}
        end
    end
```

### 2.2 Authentication Flow Diagram

```mermaid
flowchart TD
    Start([User Request]) --> AuthType{Authentication Type}
    
    AuthType -->|Signup| SignupFlow[Signup Flow]
    AuthType -->|Login| LoginFlow[Login Flow]
    
    SignupFlow --> ValidateInput[Validate Input: fullname, email, password]
    ValidateInput --> CheckEmail{User exists?}
    
    CheckEmail -->|Yes| Error1[Return 400: User already exists]
    CheckEmail -->|No| HashPass[Hash password: bcryptjs.hash, saltRounds=10]
    
    HashPass --> CreateUser[Create user object: fullname, email, hashed password]
    CreateUser --> SaveDB[(Save to MongoDB)]
    SaveDB --> Success1[Return 201: User created, exclude password]
    
    LoginFlow --> ValidateLogin[Validate Input: email, password]
    ValidateLogin --> FindUser[Find user by email: User.findOne]
    FindUser --> UserExists{User Found?}
    
    UserExists -->|No| Error2[Return 400: Invalid credentials]
    UserExists -->|Yes| ComparePass[Compare password: bcryptjs.compare]
    
    ComparePass --> PassMatch{Password Match?}
    PassMatch -->|No| Error2
    PassMatch -->|Yes| Success2[Return 200: Login successful, return user data]
    
    Error1 --> End([End])
    Error2 --> End
    Success1 --> End
    Success2 --> End
    
    style SignupFlow fill:#e1f5ff
    style LoginFlow fill:#e1f5ff
    style HashPass fill:#fff4e1
    style ComparePass fill:#fff4e1
    style SaveDB fill:#e8f5e9
    style Error1 fill:#ffebee
    style Error2 fill:#ffebee
    style Success1 fill:#e8f5e9
    style Success2 fill:#e8f5e9
```

---

## 3. Routes Flowchart

### 3.1 Unified Routes Flow (Structure & Detailed Flow)

```mermaid
flowchart TD
    Start([HTTP Request]) --> Server[Express Server: index.js]
    
    Server --> Middleware[CORS & JSON Middleware]
    Middleware --> RouteCheck{Check Route Path}
    
    RouteCheck -->|/user/*| UserRoutes[User Routes Module: user.route.js]
    RouteCheck -->|/book/*| BookRoutes[Book Routes Module: book.route.js]
    RouteCheck -->|Other| NotFound[404 Not Found]
    
    UserRoutes --> UserMethod{HTTP Method}
    UserMethod -->|POST /signup| SignupHandler[signup Controller]
    UserMethod -->|POST /login| LoginHandler[login Controller]
    UserMethod -->|Other| UserNotFound[404 Not Found]
    
    BookRoutes --> BookMethod{HTTP Method}
    BookMethod -->|GET /| GetBookHandler[getBook Controller]
    BookMethod -->|Other| BookNotFound[404 Not Found]
    
    SignupHandler --> SignupFlow{Signup Flow}
    SignupFlow --> SignupCheck[Check email exists: User.findOne]
    SignupCheck --> SignupExists{User Exists?}
    SignupExists -->|Yes| SignupError[400 Error: User already exists]
    SignupExists -->|No| SignupHash[Hash password: bcryptjs.hash]
    SignupHash --> SignupCreate[Create user object]
    SignupCreate --> SignupSave[Save to MongoDB]
    SignupSave --> SignupSuccess[201 Success: User created]
    
    LoginHandler --> LoginFlow{Login Flow}
    LoginFlow --> LoginFind[Find user by email: User.findOne]
    LoginFind --> LoginExists{User Found?}
    LoginExists -->|No| LoginError[400 Error: Invalid credentials]
    LoginExists -->|Yes| LoginCompare[Compare password: bcryptjs.compare]
    LoginCompare --> LoginMatch{Password Match?}
    LoginMatch -->|No| LoginError
    LoginMatch -->|Yes| LoginSuccess[200 Success: Login successful]
    
    GetBookHandler --> BookFlow{Book Flow}
    BookFlow --> BookQuery[Query all books: Book.find]
    BookQuery --> BookSuccess[200 Success: JSON array of books]
    
    SignupSave --> UserModel[(User Model)]
    LoginFind --> UserModel
    LoginCompare --> UserModel
    BookQuery --> BookModel[(Book Model)]
    
    UserModel --> MongoDB[(MongoDB)]
    BookModel --> MongoDB
    
    SignupSuccess --> Response[Send HTTP Response]
    LoginSuccess --> Response
    BookSuccess --> Response
    SignupError --> Response
    LoginError --> Response
    NotFound --> Response
    UserNotFound --> Response
    BookNotFound --> Response
    
    Response --> End([End])
    
    subgraph "User Endpoints"
        SignupHandler
        LoginHandler
    end
    
    subgraph "Book Endpoints"
        GetBookHandler
    end
    
    style Server fill:#e1f5ff
    style UserRoutes fill:#e8f5e9
    style BookRoutes fill:#e8f5e9
    style MongoDB fill:#fff4e1
    style SignupHandler fill:#f3e5f5
    style LoginHandler fill:#f3e5f5
    style GetBookHandler fill:#f3e5f5
    style SignupSuccess fill:#e8f5e9
    style LoginSuccess fill:#e8f5e9
    style BookSuccess fill:#e8f5e9
    style SignupError fill:#ffebee
    style LoginError fill:#ffebee
```

### 3.2 Request-Response Flow

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant Routes
    participant Controllers
    participant Models
    participant MongoDB

    Note over Client,MongoDB: User Signup Request
    Client->>Express: POST /user/signup
    Express->>Routes: Route to user.route.js
    Routes->>Controllers: Call signup function
    Controllers->>Models: User.findOne({ email })
    Models->>MongoDB: Query database
    MongoDB-->>Models: Return result
    Models-->>Controllers: Return user/null
    Controllers->>Models: new User() & save()
    Models->>MongoDB: Insert document
    MongoDB-->>Models: Confirm save
    Models-->>Controllers: Return saved user
    Controllers-->>Express: res.status(201).json()
    Express-->>Client: HTTP 201 Response

    Note over Client,MongoDB: Book List Request
    Client->>Express: GET /book
    Express->>Routes: Route to book.route.js
    Routes->>Controllers: Call getBook function
    Controllers->>Models: Book.find()
    Models->>MongoDB: Query all books
    MongoDB-->>Models: Return book array
    Models-->>Controllers: Return books
    Controllers-->>Express: res.status(200).json(books)
    Express-->>Client: HTTP 200 Response
```

---

## 4. Database Schema

### 4.1 User Model Schema

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string fullname
        string email UK
        string password
    }
```

### 4.2 Book Model Schema

```mermaid
erDiagram
    BOOK {
        ObjectId _id PK
        string name
        number price
        string category
        string images
        string title
    }
```

---

## Summary

### Backend Architecture Components:
- **Server**: Express.js server with CORS and JSON middleware
- **Routes**: Modular route handlers for `/user` and `/book`
- **Controllers**: Business logic handlers (signup, login, getBook)
- **Models**: Mongoose schemas for User and Book
- **Database**: MongoDB for data persistence

### Authentication Flow:
- **Signup**: Email validation → Password hashing (bcryptjs, 10 rounds) → User creation
- **Login**: Email lookup → Password comparison (bcryptjs.compare) → User data return
- **Security**: Uses bcryptjs for password hashing with salt rounds

### Available Routes:
- `POST /user/signup` - Create new user account
- `POST /user/login` - Authenticate user
- `GET /book` - Retrieve all books

### Technology Stack:
- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Security**: bcryptjs for password hashing
- **Middleware**: CORS, JSON parser

---

*Generated for Student Management API - Backend*
