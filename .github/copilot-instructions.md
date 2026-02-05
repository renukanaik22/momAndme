# Copilot Instructions - MomAndMe

This repository contains the MomAndMe bedtime-stories application. This file provides quick navigation to all AI agent guidance documents.

---

## ⚠️ CRITICAL: MANDATORY RULES FOR ALL CODE CHANGES

**BEFORE writing ANY code, you MUST:**

1. **Check Product & Technical Context**: Read [product.md](../docs/product.md)
2. **Apply Standards DURING Implementation**: DO NOT create technical debt that requires later refactoring
3. **Follow Size Limits**:
   - Max 10 lines per method (5 lines preferred)
   - Max 200 lines per file
   - Max 3 parameters per method
   - Max 7 public methods per class
4. **Use Constructor Injection**: NEVER use @Autowired field injection
5. **Single Responsibility**: Each class/method does ONE thing only
6. **No Code Smells**: Check [core-standards.md](../guidelines/core-standards.md) code smell list BEFORE coding

**IF existing code violates standards:**
- **STOP** and refactor FIRST
- **THEN** implement new feature on clean code
- **DO NOT** add to technical debt

**Enforcement:**
- Build will FAIL if standards violated
- Pull requests will be REJECTED
- All tests must pass
- Code review will check compliance

### For AI Assistants (Copilot / Chat-based tools)

When generating or modifying code in this repository, AI assistants MUST:

- Read and respect `docs/product.md` and all referenced guidelines before proposing changes.
- Enforce size limits: ≤10 lines per method, ≤200 lines per file, ≤3 parameters per method, ≤7 public methods per class.
- Use constructor injection only; never suggest `@Autowired` field injection.
- Keep each class and method limited to a single responsibility; refactor first if this is not currently true.
- Eliminate code smells using [`core-standards.md`](../guidelines/core-standards.md) before adding new behavior.
- Refuse to introduce technical debt; if standards are violated in existing code, recommend refactoring before implementing features.

---

## Documentation Structure

### **Start Here: Project Context**

#### [**Product & Technical Context**](../docs/product.md)
**Purpose**: Product vision, system architecture, data flows, and technical decisions  
**What it covers**:
- System overview and architecture (Java/Spring Boot backend + React + TypeScript frontend)
- Data model and persistence strategy
- API endpoint documentation
- Development workflow and debugging

**When to use**: 
- First time working in this codebase
- Understanding how backend and frontend interact
- Debugging issues
- Making architectural decisions

---

### **Coding Standards & Guidelines**

#### [**Core Standards**](../guidelines/core-standards.md) ⭐ READ FIRST
**Purpose**: Universal coding principles applicable to ALL languages and projects  
**What it covers**:
- General principles (KISS, YAGNI, DRY, Boy Scout Rule, SOLID)
- Code smell detection and elimination
- Method/class size guidelines
- Naming conventions and readability requirements
- Cross-functional requirements (error handling, logging, security, performance, i18n)
- Testing best practices

**When to consider**: 
- **Before writing ANY code** - these are mandatory principles
- When reviewing code quality
- Resolving design decisions
- Identifying code smells
- Refactoring legacy code

#### [**Java & Spring Boot Standards**](../guidelines/java-spring-boot.md)
**Purpose**: Java 17 and Spring Boot 3.2 best practices for the **backend service**  
**What it covers**:
- Java language standards (modern Java features, type system, null safety)
- Spring Boot patterns (dependency injection, component annotations)
- Layered architecture (Controller → Service → Repository)
- MongoDB with Spring Data
- DTOs and validation (Bean Validation)
- Exception handling and global error handling
- Transaction management
- Testing (JUnit 5, Mockito, Testcontainers)
- Logging and configuration

**When to use**:
- Working on the `backend/` service
- Writing Spring Boot controllers, services, or repositories
- Working with MongoDB entities
- Implementing REST API endpoints
- Writing backend tests

#### [**React & JavaScript Standards**](../guidelines/react-javascript.md)
**Purpose**: React 18.2 and modern JavaScript best practices for the **frontend service**  
**What it covers**:
- Modern JavaScript (ES6+): const/let, arrow functions, destructuring, async/await
- React functional components and hooks
- State management (useState, useEffect, Context API)
- Component design patterns (presentational vs container)
- API integration with Axios
- React Router v6 for routing
- Forms and validation
- Error handling (Error Boundaries)
- Testing (React Testing Library, Jest)
- Performance and accessibility

**When to use**:
- Working on the `frontend/` service
- Writing React components
- Managing state and side effects
- Integrating with backend APIs
- Writing frontend tests

---

## Repository Structure

```
momAndMe/
├── backend/                      # Spring Boot backend (Java 17)
│   ├── src/
│   │   ├── main/java/com/momandme/
│   │   │   └── MomAndMeApplication.java
│   │   └── main/resources/
│   └── pom.xml                  # Maven dependencies
├── frontend/                     # React + TypeScript frontend (Vite)
│   ├── src/
│   │   ├── App.tsx              # Root component
│   │   └── main.tsx             # Entry point
│   ├── package.json             # npm dependencies
│   ├── tsconfig.json            # TypeScript configuration
│   └── vite.config.mts          # Vite configuration
├── docs/                        # Product and project documentation
│   └── product.md
├── guidelines/                  # Coding standards
│   ├── core-standards.md
│   ├── java-spring-boot.md
│   └── react-javascript.md
└── .github/                     # GitHub configuration and Copilot agents
   ├── copilot-instructions.md
   ├── agents/
   └── stories-and-plans/
```

---

## Recommended Workflow

### For Backend Development (Java/Spring Boot)
1. **First visit**: Read [product.md](../docs/product.md)
2. **Before coding**: Review [core-standards.md](../guidelines/core-standards.md)
3. **While coding**: Follow [java-spring-boot.md](../guidelines/java-spring-boot.md)
4. **Always**: Run `mvn test` before committing
5. **Testing**: Write unit tests for services, integration tests for repositories

### For Frontend Development (React/JavaScript)
1. **First visit**: Read [product.md](../docs/product.md)
2. **Before coding**: Review [core-standards.md](../guidelines/core-standards.md)
3. **While coding**: Follow [react-javascript.md](../guidelines/react-javascript.md)
4. **Always**: Run `npm test` before committing
5. **Testing**: Write component tests with React Testing Library

### Full Stack Development
1. **Understanding the system**: Read both technical and business context
2. **Backend changes**: Java/Spring Boot guidelines
3. **Frontend changes**: React/JavaScript guidelines
4. **Integration**: Test end-to-end flow by running backend and frontend together
5. **Running locally**: Start backend with Maven and frontend with Vite (`npm run dev`)

---

## Quick Reference by Task

| Task | Guidelines to Follow |
|------|---------------------|
| REST API endpoint | [Core](../guidelines/core-standards.md) → [Java/Spring Boot](../guidelines/java-spring-boot.md) § Controller Layer |
| Service layer logic | [Core](../guidelines/core-standards.md) → [Java/Spring Boot](../guidelines/java-spring-boot.md) § Service Layer |
| MongoDB repository | [Java/Spring Boot](../guidelines/java-spring-boot.md) § Repository Layer |
| Domain entity | [Java/Spring Boot](../guidelines/java-spring-boot.md) § Domain Models |
| React component | [Core](../guidelines/core-standards.md) → [React/JavaScript](../guidelines/react-javascript.md) § Component Design |
| API integration | [React/JavaScript](../guidelines/react-javascript.md) § API Integration |
| Form handling | [React/JavaScript](../guidelines/react-javascript.md) § Forms and Validation |
| State management | [React/JavaScript](../guidelines/react-javascript.md) § State Management |
| Error handling | [Core](../guidelines/core-standards.md) § Error Handling + service-specific guide |
| Testing | [Core](../guidelines/core-standards.md) § Testing + service-specific guide |

---

## Code Review Checklist

Before submitting code for review:

- [ ] **Core Standards**: Applied SOLID principles, no code smells, small methods/classes
- [ ] **Types**: Backend uses proper Java types, Frontend has PropTypes
- [ ] **Error Handling**: Comprehensive error handling with proper logging
- [ ] **Security**: Input validation, no hardcoded secrets, sanitized data
- [ ] **Testing**: Unit tests for services/utilities, component tests for React
- [ ] **Logging**: Structured logging with appropriate levels
- [ ] **Documentation**: Complex logic has explanatory comments (WHY, not WHAT)
- [ ] **Performance**: No N+1 queries, proper indexing, resource cleanup
- [ ] **Backend**: DTOs for API, transaction management, Bean Validation
- [ ] **Frontend**: Functional components with hooks, proper state management

---

## Additional Resources

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Data MongoDB](https://docs.spring.io/spring-data/mongodb/docs/current/reference/html/)
- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [MongoDB Best Practices](https://www.mongodb.com/docs/manual/administration/production-notes/)
