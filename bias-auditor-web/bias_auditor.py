import anthropic
import os

client = anthropic.Anthropic()

print("=================================")
print("   AI Bias Auditor v1.0")
print("=================================\n")

# Let user choose what they're auditing
print("What are you auditing?")
print("1. Job Description")
print("2. News Article")
audit_type = input("\nEnter 1 or 2: ")

if audit_type == "1":
    content_type = "job description"
    system_prompt = """You are an expert AI Ethics and HR Bias Auditor 
    specializing in employment law and fair hiring practices.
    
    When given a job description, analyze it for:
    1. GENDER BIAS — masculine/feminine coded words, pronouns, assumptions
    2. AGE DISCRIMINATION — words like 'young', 'energetic', 'digital native'
    3. RACIAL/CULTURAL BIAS — cultural assumptions or exclusionary language
    4. DISABILITY BIAS — requirements not essential to the role
    5. LEGAL RISK — language that could violate EEOC guidelines
    
    For each issue found:
    - Quote the exact problematic text
    - Explain why it's problematic
    - Give a specific rewritten replacement
    
    End with an overall BIAS SCORE from 1-10 (1=very biased, 10=fully inclusive)
    and a 2 sentence executive summary a business owner can act on immediately."""

elif audit_type == "2":
    content_type = "news article"
    system_prompt = """You are an expert AI Ethics and Media Bias Auditor.
    
    When given a news article, analyze it for:
    1. POLITICAL BIAS — left/right leaning language or framing
    2. SOURCE BIAS — who is quoted and who is left out
    3. FRAMING BIAS — how the headline vs content compares
    4. RACIAL/GENDER BIAS — how different groups are described
    5. CONFIRMATION BIAS — one-sided presentation of facts
    
    For each issue found:
    - Quote the exact problematic text
    - Explain the bias and its potential impact
    - Suggest a more neutral alternative
    
    End with an overall BIAS SCORE from 1-10 (1=very biased, 10=fully balanced)
    and a 2 sentence summary."""
else:
    print("Invalid choice. Please restart and enter 1 or 2.")
    exit()

print(f"\nPaste your {content_type} below.")
print("When done, press Enter twice:\n")

lines = []
while True:
    line = input()
    if line == "":
        break
    lines.append(line)

text = "\n".join(lines)

if not text.strip():
    print("No text entered. Please restart.")
    exit()

print("\nAnalyzing for bias... please wait...\n")

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=2000,
    system=system_prompt,
    messages=[{
        "role": "user",
        "content": f"Please audit this {content_type} for bias:\n\n{text}"
    }]
)

print("=================================")
print("         AUDIT RESULTS")
print("=================================\n")
print(response.content[0].text)

print("\n=================================")
print("Audit complete. Save this report!")
print("=================================")