from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

class Schema(BaseModel):
    price: float
    eps: float

llm = ChatGroq(model="openai/gpt-oss-120b", api_key=os.getenv("GROQ_API_KEY"))

response = llm.invoke("Hello, how are you?")

print(response.content)

# structured output
response = llm.with_structured_output(Schema).invoke("Extract price and eps of Apple from the following text: Apple is a company that makes iPhones. and quarterly EPS is 1.23 and current price is 150")
print(response)



