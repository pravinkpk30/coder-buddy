from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
from agent.states import Plan, TaskPlan, CoderState
from agent.prompts import planner_prompt, architect_prompt, coder_system_prompt
from langgraph.graph import StateGraph
from langgraph.constants import END
from langchain.globals import set_verbose, set_debug
from agent.tools import write_file, read_file, get_current_directory, list_files
from langchain.agents import create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

load_dotenv()

# enable debug and verbose and get clear output in the terminal
set_debug(True)
set_verbose(True)

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

def coder_agent(state: dict) -> dict:
    """LangGraph tool-using coder agent."""
    coder_state: CoderState = state.get("coder_state")
    if coder_state is None:
        coder_state = CoderState(task_plan=state["task_plan"], current_step_idx=0)

    steps = coder_state.task_plan.implementation_steps
    if coder_state.current_step_idx >= len(steps):
        return {"coder_state": coder_state, "status": "DONE"}

    current_task = steps[coder_state.current_step_idx]
    existing_content = read_file.run(current_task.filepath)

    system_prompt = coder_system_prompt()
    user_prompt = (
        f"Task: {current_task.task_description}\n"
        f"File: {current_task.filepath}\n"
        f"Existing content:\n{existing_content}\n"
        "Use write_file(path, content) to save your changes."
    )

    coder_tools = [read_file, write_file, list_files, get_current_directory]

    # Build a Tool-Calling agent prompt (do NOT include {tools} or {tool_names};
    # create_tool_calling_agent manages tool schemas automatically).
    react_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )

    react_agent = create_tool_calling_agent(llm, coder_tools, react_prompt)

    # Provide the required intermediate_steps key for the agent scratchpad
    react_agent.invoke({"input": user_prompt, "intermediate_steps": []})

    coder_state.current_step_idx += 1
    return {"coder_state": coder_state}


graph = StateGraph(dict)
graph.add_node("planner", planner_agent)
graph.add_node("architect", architect_agent)
graph.add_node("coder", coder_agent)

graph.add_edge("planner", "architect")
graph.add_edge("architect", "coder")
graph.add_conditional_edges(
    "coder",
    lambda s: "END" if s.get("status") == "DONE" else "coder",
    {"END": END, "coder": "coder"}
)

graph.set_entry_point("planner")

agent = graph.compile()

if __name__ == "__main__":
    result = agent.invoke({"user_prompt": "Create a simple calculator application"},
                          {"recursion_limit": 100})
    print("Final State:", result)


