# Coder Buddy
Coder Buddy is a simple application built using agentic AI and prompt engineering. It helps users generate, refine, and test code snippets interactively, showcasing how lightweight agent workflows can be applied to practical coding tasks with minimal setup.

## Tech Stack
- **LangChain**: Framework for building LLM-powered applications, prompt chains, and tools. [LangChain Docs](https://python.langchain.com)
- **LangGraph**: Library for building stateful, multi-actor agent workflows on top of LangChain. [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- **Groq Cloud**: Low-latency inference platform for running LLMs; used as the model provider. [Groq Cloud](https://groq.com)
- **uv**: Ultra-fast Python package and project manager for reproducible environments and builds. [uv by Astral](https://github.com/astral-sh/uv)

## Setup with uv
To install all dependencies declared in `pyproject.toml`, run:

```bash
uv sync
```

This will resolve and install the full dependency set (and create/manage a virtual environment) specified in `pyproject.toml`, ensuring your local environment matches the project requirements.

### Activate the virtual environment
If you prefer to work inside the environment directly, activate the venv created by uv:

```bash
source .venv/bin/activate
```

## Environment Variables
This project uses environment variables stored in a local `.env` file (loaded via `python-dotenv`).

- **GROQ_API_KEY**: API key for Groq Cloud. Used to authenticate requests to Groq-hosted LLMs (fast, low-latency models; free tier available). Required for running the agent with Groq as the model provider.

Setup:

```bash
cp .env.example .env
# Edit .env and set your key
# GROQ_API_KEY=your_real_key
```

Alternatively, export it in your shell session:

```bash
export GROQ_API_KEY=your_real_key
```

This project uses Groq Cloud as the LLM backend (free tier available); setting `GROQ_API_KEY` is required to authenticate requests.
