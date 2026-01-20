# Frontend Architecture Flowcharts

This document contains flowcharts for the Frontend Architecture, Component Structure, Routing, Authentication Flow, and State Management.

---

## 1. Frontend Architecture Overview

```mermaid
graph TB
    Start([User Browser]) --> Entry[main.jsx<br/>React Entry Point]
    
    Entry --> Router[BrowserRouter<br/>React Router DOM]
    Router --> AuthProvider[AuthProvider<br/>Context Provider]
    
    AuthProvider --> App[App Component<br/>App.jsx]
    
    App --> RouteCheck{Route Matching}
    
    RouteCheck -->|/| HomePage[Home Component<br/>home/Home.jsx]
    RouteCheck -->|/signup| SignupPage[Signup Component<br/>components/Signup.jsx]
    RouteCheck -->|/course| CourseCheck{User Authenticated?}
    
    CourseCheck -->|Yes| CoursesPage[Courses Component<br/>courses/Courses.jsx]
    CourseCheck -->|No| Redirect[Navigate to /signup]
    
    HomePage --> HomeComponents[Navbar, Banner,<br/>Freebook, Footer]
    CoursesPage --> CourseComponents[Navbar, Course,<br/>Footer]
    
    SignupPage --> SignupForm[Signup Form<br/>react-hook-form]
    SignupForm --> API1[POST /user/signup<br/>Axios Request]
    
    HomeComponents --> LoginModal[Login Modal<br/>components/Login.jsx]
    LoginModal --> LoginForm[Login Form<br/>react-hook-form]
    LoginForm --> API2[POST /user/login<br/>Axios Request]
    
    API1 --> Backend[(Backend API<br/>localhost:4001)]
    API2 --> Backend
    
    Backend --> LocalStorage[localStorage<br/>Store User Data]
    LocalStorage --> AuthContext[AuthContext<br/>Update State]
    
    AuthContext --> App
    
    subgraph "React Application"
        Entry
        Router
        AuthProvider
        App
    end
    
    subgraph "Pages"
        HomePage
        SignupPage
        CoursesPage
    end
    
    subgraph "Components"
        HomeComponents
        CourseComponents
        LoginModal
        SignupForm
        LoginForm
    end
    
    subgraph "State Management"
        AuthProvider
        AuthContext
        LocalStorage
    end
    
    style Entry fill:#e1f5ff
    style AuthProvider fill:#fff4e1
    style Backend fill:#e8f5e9
    style LocalStorage fill:#f3e5f5
```

---

## 2. Component Architecture

### 2.1 Component Hierarchy

```mermaid
graph TD
    App[App.jsx] --> Home[Home.jsx]
    App --> Signup[Signup.jsx]
    App --> Courses[Courses.jsx]
    
    Home --> Navbar1[Navbar]
    Home --> Banner[Banner]
    Home --> Freebook[Freebook]
    Home --> Footer1[Footer]
    
    Courses --> Navbar2[Navbar]
    Courses --> Course[Course]
    Courses --> Footer2[Footer]
    
    Signup --> SignupForm[Signup Form]
    Signup --> LoginModal1[Login Modal]
    
    Navbar1 --> LoginModal2[Login Modal]
    Navbar1 --> Logout[Logout]
    Navbar2 --> LoginModal3[Login Modal]
    Navbar2 --> Logout2[Logout]
    
    LoginModal1 --> LoginForm1[Login Form]
    LoginModal2 --> LoginForm2[Login Form]
    LoginModal3 --> LoginForm3[Login Form]
    
    subgraph "Layout Components"
        Navbar1
        Navbar2
        Footer1
        Footer2
    end
    
    subgraph "Feature Components"
        Banner
        Freebook
        Course
    end
    
    subgraph "Auth Components"
        SignupForm
        LoginForm1
        LoginForm2
        LoginForm3
        Logout
        Logout2
    end
    
    style App fill:#e1f5ff
    style Home fill:#e8f5e9
    style Courses fill:#e8f5e9
    style Signup fill:#fff4e1
```

### 2.2 Component Communication Flow

```mermaid
sequenceDiagram
    participant User
    participant Navbar
    participant LoginModal
    participant LoginForm
    participant AuthContext
    participant LocalStorage
    participant Backend

    User->>Navbar: Click Login Button
    Navbar->>LoginModal: showModal()
    LoginModal->>LoginForm: Render Form
    
    User->>LoginForm: Enter credentials & Submit
    LoginForm->>Backend: POST /user/login<br/>{email, password}
    Backend-->>LoginForm: Response with user data
    
    alt Login Success
        LoginForm->>LocalStorage: setItem("Users", user)
        LoginForm->>AuthContext: Update authUser state
        LoginForm->>User: Show success toast
        LoginForm->>Navbar: Reload page
        Navbar->>AuthContext: Read authUser
        AuthContext-->>Navbar: Return user data
        Navbar->>User: Show Logout button
    else Login Failed
        LoginForm->>User: Show error toast
    end
```

---

## 3. Routing Flow

### 3.1 Route Structure

```mermaid
flowchart TD
    Start([User Navigation]) --> Router[React Router<br/>BrowserRouter]
    
    Router --> Route1[Route: /]
    Router --> Route2[Route: /signup]
    Router --> Route3[Route: /course]
    
    Route1 --> Home[Home Component]
    Route2 --> Signup[Signup Component]
    Route3 --> AuthCheck{Check Auth<br/>authUser exists?}
    
    AuthCheck -->|Authenticated| Courses[Courses Component]
    AuthCheck -->|Not Authenticated| Redirect[Navigate to /signup]
    
    Home --> RenderHome[Render:<br/>Navbar, Banner,<br/>Freebook, Footer]
    Signup --> RenderSignup[Render:<br/>Signup Form]
    Courses --> RenderCourses[Render:<br/>Navbar, Course,<br/>Footer]
    
    RenderHome --> End([End])
    RenderSignup --> End
    RenderCourses --> End
    Redirect --> End
    
    style Router fill:#e1f5ff
    style AuthCheck fill:#fff4e1
    style Home fill:#e8f5e9
    style Signup fill:#fff4e1
    style Courses fill:#e8f5e9
    style Redirect fill:#ffebee
```

### 3.2 Route Protection Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant App
    participant AuthContext
    participant RouteGuard
    participant Courses

    User->>Browser: Navigate to /course
    Browser->>App: Route change detected
    App->>AuthContext: Check authUser state
    AuthContext->>AuthContext: Read from localStorage
    
    alt User Authenticated
        AuthContext-->>App: authUser exists
        App->>RouteGuard: authUser? <Courses /> : <Navigate />
        RouteGuard->>Courses: Render Courses Component
        Courses-->>User: Display Course Page
    else User Not Authenticated
        AuthContext-->>App: authUser is undefined
        App->>RouteGuard: Navigate to /signup
        RouteGuard-->>User: Redirect to Signup Page
    end
```

---

## 4. Authentication Flow

### 4.1 Signup Flow

```mermaid
sequenceDiagram
    participant User
    participant SignupForm
    participant ReactHookForm
    participant Axios
    participant Backend
    participant LocalStorage
    participant AuthContext
    participant Router

    User->>SignupForm: Fill form & Submit
    SignupForm->>ReactHookForm: handleSubmit(onSubmit)
    ReactHookForm->>ReactHookForm: Validate form fields
    
    alt Validation Failed
        ReactHookForm-->>User: Show validation errors
    else Validation Passed
        ReactHookForm->>SignupForm: Call onSubmit(data)
        SignupForm->>Axios: POST /user/signup<br/>{fullname, email, password}
        Axios->>Backend: HTTP Request
        
        alt Signup Success
            Backend-->>Axios: 201 Created<br/>{user: {_id, fullname, email}}
            Axios-->>SignupForm: Response data
            SignupForm->>LocalStorage: setItem("Users", user)
            SignupForm->>AuthContext: Update authUser state
            SignupForm->>User: Show success toast
            SignupForm->>Router: navigate(from)
            Router-->>User: Navigate to home page
        else Signup Failed
            Backend-->>Axios: 400 Bad Request<br/>{message: "User already exists"}
            Axios-->>SignupForm: Error response
            SignupForm->>User: Show error toast
        end
    end
```

### 4.2 Login Flow

```mermaid
sequenceDiagram
    participant User
    participant Navbar
    participant LoginModal
    participant LoginForm
    participant ReactHookForm
    participant Axios
    participant Backend
    participant LocalStorage
    participant AuthContext

    User->>Navbar: Click Login Button
    Navbar->>LoginModal: showModal()
    LoginModal->>LoginForm: Display Login Form
    
    User->>LoginForm: Enter email & password
    User->>LoginForm: Click Login Button
    LoginForm->>ReactHookForm: handleSubmit(onSubmit)
    ReactHookForm->>ReactHookForm: Validate fields
    
    alt Validation Failed
        ReactHookForm-->>User: Show validation errors
    else Validation Passed
        ReactHookForm->>LoginForm: Call onSubmit(data)
        LoginForm->>Axios: POST /user/login<br/>{email, password}
        Axios->>Backend: HTTP Request
        
        alt Login Success
            Backend-->>Axios: 200 OK<br/>{user: {_id, fullname, email}}
            Axios-->>LoginForm: Response data
            LoginForm->>LocalStorage: setItem("Users", user)
            LoginForm->>AuthContext: Update authUser state
            LoginForm->>User: Show success toast
            LoginForm->>LoginModal: close()
            LoginForm->>Navbar: window.location.reload()
            Navbar->>AuthContext: Read authUser
            AuthContext-->>Navbar: Return user data
            Navbar->>User: Display Logout button
        else Login Failed
            Backend-->>Axios: 400 Bad Request<br/>{message: "Invalid credentials"}
            Axios-->>LoginForm: Error response
            LoginForm->>User: Show error toast
        end
    end
```

### 4.3 Authentication State Management

```mermaid
flowchart TD
    Start([App Initialization]) --> AuthProvider[AuthProvider Component]
    
    AuthProvider --> CheckStorage{Check localStorage<br/>for 'Users'}
    
    CheckStorage -->|Found| ParseJSON[Parse JSON<br/>JSON.parse]
    CheckStorage -->|Not Found| SetUndefined[Set authUser = undefined]
    
    ParseJSON --> SetState[Set authUser state<br/>useState]
    SetUndefined --> SetState
    
    SetState --> ProvideContext[Provide AuthContext<br/>authUser, setAuthUser]
    
    ProvideContext --> Components[Components Access<br/>useAuth hook]
    
    Components --> UpdateAuth{Update Auth?}
    
    UpdateAuth -->|Login/Signup| UpdateStorage[Update localStorage]
    UpdateAuth -->|Logout| ClearStorage[Clear localStorage]
    
    UpdateStorage --> UpdateState[Update authUser state]
    ClearStorage --> UpdateState
    
    UpdateState --> ReRender[Re-render Components]
    ReRender --> End([End])
    
    style AuthProvider fill:#e1f5ff
    style CheckStorage fill:#fff4e1
    style ProvideContext fill:#e8f5e9
    style UpdateStorage fill:#f3e5f5
    style ClearStorage fill:#ffebee
```

---

## 5. State Management Flow

### 5.1 Context API Flow

```mermaid
graph TB
    AuthProvider[AuthProvider<br/>context/AuthProvider.jsx] --> CreateContext[createContext<br/>AuthContext]
    
    CreateContext --> InitState[Initialize State<br/>useState]
    
    InitState --> CheckLocalStorage{Read localStorage<br/>'Users' key}
    
    CheckLocalStorage -->|Exists| ParseUser[Parse JSON<br/>JSON.parse]
    CheckLocalStorage -->|Not Exists| SetUndefined[Set undefined]
    
    ParseUser --> StateValue[State: authUser]
    SetUndefined --> StateValue
    
    StateValue --> ProvideValue[Provider Value<br/>authUser, setAuthUser]
    
    ProvideValue --> ExportHook[Export useAuth hook<br/>useContext AuthContext]
    
    ExportHook --> Components[Components Use Hook<br/>const authUser, setAuthUser = useAuth]
    
    Components --> UpdateState[Update State<br/>setAuthUser newValue]
    
    UpdateState --> SyncStorage[Sync with localStorage<br/>setItem or removeItem]
    
    SyncStorage --> ReRender[Re-render Tree]
    
    ReRender --> Components
    
    style AuthProvider fill:#e1f5ff
    style CreateContext fill:#fff4e1
    style StateValue fill:#e8f5e9
    style SyncStorage fill:#f3e5f5
```

### 5.2 State Update Flow

```mermaid
sequenceDiagram
    participant Component
    participant useAuth
    participant AuthContext
    participant AuthProvider
    participant LocalStorage
    participant AllComponents

    Component->>useAuth: Call useAuth()
    useAuth->>AuthContext: useContext(AuthContext)
    AuthContext-->>useAuth: Return [authUser, setAuthUser]
    useAuth-->>Component: Provide state & setter
    
    Component->>Component: User action (login/signup/logout)
    Component->>AuthContext: setAuthUser(newValue)
    AuthContext->>AuthProvider: Update state
    AuthProvider->>LocalStorage: Sync localStorage
    
    alt Login/Signup
        AuthProvider->>LocalStorage: setItem("Users", JSON.stringify(user))
    else Logout
        AuthProvider->>LocalStorage: removeItem("Users")
    end
    
    AuthProvider->>AllComponents: Re-render all consumers
    AllComponents-->>Component: Updated UI
```

---

## 6. API Integration Flow

### 6.1 API Request Flow

```mermaid
flowchart LR
    Component[React Component] --> FormValidation[Form Validation<br/>react-hook-form]
    
    FormValidation -->|Valid| PrepareData[Prepare Request Data<br/>userInfo object]
    FormValidation -->|Invalid| ShowErrors[Show Validation Errors]
    
    PrepareData --> AxiosCall[Axios POST Request<br/>http://localhost:4001]
    
    AxiosCall --> Backend[(Backend API)]
    
    Backend --> Response{Response Status}
    
    Response -->|200/201| Success[Success Handler]
    Response -->|400/500| Error[Error Handler]
    
    Success --> UpdateState[Update Auth State<br/>setAuthUser]
    Success --> UpdateStorage[Update localStorage<br/>setItem Users]
    Success --> ShowToast[Show Success Toast<br/>react-hot-toast]
    Success --> Navigate[Navigate/Reload]
    
    Error --> ShowErrorToast[Show Error Toast<br/>Display error message]
    
    UpdateState --> ReRender[Re-render UI]
    UpdateStorage --> ReRender
    ShowToast --> End([End])
    ShowErrorToast --> End
    Navigate --> End
    
    style Component fill:#e1f5ff
    style Backend fill:#fff4e1
    style Success fill:#e8f5e9
    style Error fill:#ffebee
```

### 6.2 API Endpoints Used

```mermaid
graph LR
    Frontend[Frontend Application] --> API1[POST /user/signup<br/>Signup Component]
    Frontend --> API2[POST /user/login<br/>Login Component]
    Frontend --> API3[GET /book<br/>Course Component]
    
    API1 --> Backend1[(Backend API<br/>localhost:4001)]
    API2 --> Backend1
    API3 --> Backend1
    
    Backend1 --> Response1[201 Created<br/>User created]
    Backend1 --> Response2[200 OK<br/>Login successful]
    Backend1 --> Response3[200 OK<br/>Books array]
    
    Response1 --> Frontend
    Response2 --> Frontend
    Response3 --> Frontend
    
    style Frontend fill:#e1f5ff
    style Backend1 fill:#fff4e1
    style Response1 fill:#e8f5e9
    style Response2 fill:#e8f5e9
    style Response3 fill:#e8f5e9
```

---

## 7. User Interaction Flow

### 7.1 Complete User Journey

```mermaid
stateDiagram-v2
    [*] --> HomePage: Initial Load
    
    HomePage --> ViewContent: Browse Content
    HomePage --> ClickLogin: Click Login Button
    HomePage --> ClickSignup: Navigate to Signup
    
    ClickLogin --> LoginModal: Open Modal
    LoginModal --> FillLoginForm: Enter Credentials
    FillLoginForm --> SubmitLogin: Submit Form
    SubmitLogin --> LoginSuccess: API Success
    SubmitLogin --> LoginError: API Error
    LoginSuccess --> Authenticated: Update State
    LoginError --> LoginModal: Show Error
    
    ClickSignup --> SignupPage: Navigate
    SignupPage --> FillSignupForm: Enter Details
    FillSignupForm --> SubmitSignup: Submit Form
    SubmitSignup --> SignupSuccess: API Success
    SubmitSignup --> SignupError: API Error
    SignupSuccess --> Authenticated: Update State
    SignupError --> SignupPage: Show Error
    
    Authenticated --> HomePage: Reload/Navigate
    Authenticated --> CoursesPage: Access Courses
    
    CoursesPage --> ViewCourses: View Course Content
    CoursesPage --> Logout: Click Logout
    Logout --> HomePage: Clear Auth & Redirect
    
    ViewContent --> [*]
    ViewCourses --> [*]
```

---

## Summary

### Frontend Architecture Components:
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **State Management**: Context API (AuthProvider)
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios
- **UI Library**: Tailwind CSS + DaisyUI
- **Notifications**: React Hot Toast
- **Storage**: localStorage for persistence

### Key Features:
- **Authentication**: Signup and Login flows with state management
- **Route Protection**: Protected routes with authentication check
- **State Persistence**: User data stored in localStorage
- **Form Validation**: Client-side validation with react-hook-form
- **Error Handling**: Toast notifications for success/error states
- **Theme Support**: Dark/Light mode toggle

### Component Structure:
- **Pages**: Home, Signup, Courses
- **Layout Components**: Navbar, Footer
- **Feature Components**: Banner, Freebook, Course
- **Auth Components**: Login, Signup, Logout

### API Integration:
- `POST /user/signup` - User registration
- `POST /user/login` - User authentication
- `GET /book` - Fetch books/courses

### Technology Stack:
- **Build Tool**: Vite
- **Language**: JavaScript (ES Modules)
- **Styling**: Tailwind CSS, DaisyUI
- **Icons**: SVG icons
- **Carousel**: React Slick

---

*Generated for Student Management API - Frontend*
