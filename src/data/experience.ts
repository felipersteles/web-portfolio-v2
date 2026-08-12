export interface ExperienceItem {
    company: string;
    description: string;
    role: string;
    period: string;
    highlights: string[];
}

export const SUMMARY =
    "Full-stack Software Engineer with extensive experience developing SaaS platforms, distributed systems, microservices, and event-driven architectures. Backend specialist using Golang, Java, and NestJS, with expertise in cloud computing, Generative AI, LangChain, RAG (Retrieval-Augmented Generation), Machine Learning, and integrating Large Language Models (LLMs) in production applications.";

export const EXPERIENCE: ExperienceItem[] = [
    {
        company: "Concrédito Consignados",
        description: "Fintech specialized in payroll-deducted loans",
        role: "Senior Software Engineer",
        period: "2025 — Present",
        highlights: [
            "Technical leadership in platform evolution, driving migration from monolithic architecture to microservices using Domain-Driven Design (DDD).",
            "Design and implementation of distributed event-driven architectures using RabbitMQ, asynchronous messaging, and concurrent processing.",
            "Development of high-performance REST APIs using Golang and NestJS (Node.js/TypeScript).",
            "Building banking integrations, third-party APIs, and financial services for payroll-deducted loan processing.",
            "Development of applications using PostgreSQL, Redis, and Elasticsearch for persistence, caching, and search mechanisms.",
            "Implementation of authentication and authorization using JWT, OAuth2, and role-based access control (RBAC).",
            "Creation of CI/CD pipelines using GitHub Actions with automated deployment in Kubernetes and Docker environments.",
            "AWS infrastructure using EKS, S3, IAM, SES, CloudWatch, and integration with managed services.",
            "Monitoring and observability through structured logging, metrics, and distributed tracing for production environments.",
            "Application of SOLID principles, Clean Architecture, Clean Code, Design Patterns, and software engineering best practices.",
            "Active participation in code reviews, architecture definition, technical planning, and mentoring of developers.",
        ],
    },
    {
        company: "ASV Digital",
        description: "Technology company for digital marketing",
        role: "Junior/Senior Software Engineer",
        period: "2023 — 2025",
        highlights: [
            "SaaS architecture based on microservices.",
            "Development with Node.js, NestJS, React, Next.js, Golang and Python.",
            "Development of Generative AI applications using OpenAI, Claude, and Gemini.",
            "RAG pipeline construction using LangChain and development of AI agents.",
            "Implementation of embeddings and semantic search with vector databases.",
            "Creation of CI/CD pipelines using GitHub Actions with automated deployment in Kubernetes and Docker environments.",
            "Build of observability solutions using Prometheus and Grafana.",
            "LLM integration in SaaS applications.",
            "Integrations with payment gateways like Stripe, Asaas, and Pagar.me.",
            "Integrations with ClickUp, Google, Slack, Meta, and Calendly.",
            "Event-driven architecture with RabbitMQ.",
            "Deployment with Docker and AWS.",
        ],
    },
    {
        company: "Tarken Ag",
        description: "Fintech startup for agricultural credit",
        role: "Full Stack Developer Intern",
        period: "2022 — 2023",
        highlights: [
            "NestJS, React, and TypeScript.",
            "PostgreSQL and AWS.",
            "Credit platform for agribusiness.",
        ],
    },
    {
        company: "CNPq",
        description: "Research group in Artificial Intelligence",
        role: "AI Researcher",
        period: "2020 — 2022",
        highlights: [
            "Research in Machine Learning, Deep Learning, and Computer Vision.",
            "Pipeline development with Python, PyTorch, and TensorFlow.",
            "AI applied to medical diagnosis.",
            "OpenCV, TensorFlow, and Keras.",
            "Model optimization with Optuna.",
            "MLOps with Docker, Optuna, and Hugging Face.",
            "Scientific paper publications.",
        ],
    },
];

export interface EducationItem {
    degree: string;
    school: string;
    period: string;
}

export const EDUCATION: EducationItem[] = [
    { degree: "Master's Degree in Computer Science", school: "UFMA", period: "2024 — 2026" },
    { degree: "Bachelor's Degree in Computer Science", school: "UFMA", period: "2018 — 2023" },
];
