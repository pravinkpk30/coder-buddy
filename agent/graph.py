from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
from states import Plan, TaskPlan
from prompts import planner_prompt, architect_prompt
from langgraph.graph import StateGraph

load_dotenv()

llm = ChatGroq(model="openai/gpt-oss-120b", api_key=os.getenv("GROQ_API_KEY"))

def planner_agent(state: dict) -> dict:
    """Converts user prompt into a structured Plan."""
    user_prompt = state["user_prompt"]
    resp = llm.with_structured_output(Plan).invoke(
        planner_prompt(user_prompt)
    )
    if resp is None:
        raise ValueError("Planner did not return a valid response.")

    return {"plan": resp}

def architect_agent(state: dict) -> dict:
    """Converts plan into a structured TaskPlan."""
    plan: Plan = state["plan"]
    resp = llm.with_structured_output(TaskPlan).invoke(
        architect_prompt(plan)
    )
    if resp is None:
        raise ValueError("Architect did not return a valid response.")
    # pass plan to task plan which is useful to add more param because of adding ConfigDict(extra="allow") in TaskPlan Modal
    resp.plan = plan 
    return {"task_plan": resp}


graph = StateGraph(dict)
graph.add_node("planner", planner_agent)
graph.add_node("architect", architect_agent)

graph.add_edge("planner", "architect")

graph.set_entry_point("planner")

agent = graph.compile()

user_prompt = "Create a simple calculator application"

result = agent.invoke({"user_prompt": user_prompt})

print(result)


