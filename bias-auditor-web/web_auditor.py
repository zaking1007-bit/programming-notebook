from flask import Flask, request, jsonify, render_template_string
import anthropic
import os

app = Flask(__name__)
client = anthropic.Anthropic()

HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>AI Bias Auditor</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: #f5f5f5;
        }
        h1 { 
            color: #1a1a1a; 
            margin-bottom: 8px; 
        }
        p { 
            color: #666; 
            margin-bottom: 20px; 
        }
        select, textarea { 
            width: 100%; 
            padding: 12px; 
            font-size: 14px;
            border: 1px solid #ddd;
            border-radius: 6px;
            margin-bottom: 12px;
            background: white;
        }
        textarea { height: 220px; resize: vertical; }
        button { 
            background: #2563eb; 
            color: white; 
            padding: 12px 30px; 
            border: none; 
            border-radius: 6px; 
            font-size: 16px; 
            cursor: pointer; 
            width: 100%;
        }
        button:hover { background: #1d4ed8; }
        button:disabled { background: #93c5fd; cursor: not-allowed; }
        #loading { 
            display: none; 
            text-align: center; 
            margin-top: 24px; 
            color: #666; 
            font-size: 15px;
        }
        #results { 
            display: none;
            margin-top: 24px; 
            white-space: pre-wrap; 
            background: white; 
            padding: 24px; 
            border-radius: 8px; 
            border: 1px solid #ddd;
            font-size: 14px;
            line-height: 1.7;
        }
        .score-bar {
            display: none;
            margin-top: 16px;
            background: white;
            padding: 16px 24px;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
        .label { 
            font-size: 13px; 
            color: #666; 
            margin-bottom: 6px; 
        }
        .bar-bg { 
            background: #e5e7eb; 
            border-radius: 999px; 
            height: 12px; 
        }
        .bar-fill { 
            height: 12px; 
            border-radius: 999px; 
            transition: width 0.6s ease;
        }
    </style>
</head>
<body>
    <h1>AI Bias Auditor</h1>
    <p>Paste a job description or news article below to get a full bias report.</p>

    <select id="auditType">
        <option value="job description">Job Description</option>
        <option value="news article">News Article</option>
    </select>

    <textarea id="textInput" 
        placeholder="Paste your text here..."></textarea>

    <button id="auditBtn" onclick="auditText()">
        Run Bias Audit
    </button>

    <div id="loading">
        Analyzing for bias... this takes about 10 seconds...
    </div>

    <div class="score-bar" id="scoreBar">
        <div class="label" id="scoreLabel">Bias Score: --/10</div>
        <div class="bar-bg">
            <div class="bar-fill" id="barFill" style="width:0%"></div>
        </div>
    </div>

    <div id="results"></div>

    <script>
        async function auditText() {
            const text = document.getElementById('textInput').value.trim();
            const type = document.getElementById('auditType').value;
            
            if (!text) { 
                alert('Please paste some text first.'); 
                return; 
            }

            const btn = document.getElementById('auditBtn');
            btn.disabled = true;
            btn.textContent = 'Analyzing...';
            document.getElementById('loading').style.display = 'block';
            document.getElementById('results').style.display = 'none';
            document.getElementById('scoreBar').style.display = 'none';

            try {
                const response = await fetch('/audit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: text, type: type })
                });

                const data = await response.json();

                document.getElementById('loading').style.display = 'none';
                document.getElementById('results').style.display = 'block';
                document.getElementById('results').textContent = data.result;

                // Extract and show score if found
                const scoreMatch = data.result.match(/(\d+)\s*\/\s*10/);
                if (scoreMatch) {
                    const score = parseInt(scoreMatch[1]);
                    const pct = (score / 10) * 100;
                    const color = score >= 7 ? '#16a34a' : 
                                  score >= 4 ? '#d97706' : '#dc2626';
                    document.getElementById('scoreBar').style.display = 'block';
                    document.getElementById('scoreLabel').textContent = 
                        `Bias Score: ${score}/10`;
                    document.getElementById('barFill').style.width = pct + '%';
                    document.getElementById('barFill').style.background = color;
                }

            } catch (err) {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('results').style.display = 'block';
                document.getElementById('results').textContent = 
                    'Something went wrong. Please try again.';
            }

            btn.disabled = false;
            btn.textContent = 'Run Bias Audit';
        }
    </script>
</body>
</html>
"""

@app.route('/')
def home():
    return render_template_string(HTML)

@app.route('/audit', methods=['POST'])
def audit():
    data = request.json
    text = data['text']
    content_type = data['type']

    system_prompt = f"""You are an expert AI Bias Auditor specializing 
    in {content_type} analysis.
    
    Analyze the text for:
    1. GENDER BIAS — coded language, pronouns, assumptions
    2. AGE DISCRIMINATION — exclusionary age-related language
    3. RACIAL/CULTURAL BIAS — exclusionary cultural assumptions
    4. LEGAL RISK — language that could create liability
    5. OVERALL TONE — inclusive vs exclusionary framing
    
    For each issue:
    - Quote the exact problematic text
    - Explain why it is problematic
    - Provide a specific rewritten replacement
    
    End with a BIAS SCORE of X/10 (1=very biased, 10=fully inclusive)
    and a 2 sentence executive summary."""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        system=system_prompt,
        messages=[{
            "role": "user",
            "content": f"Audit this {content_type} for bias:\n\n{text}"
        }]
    )

    return jsonify({"result": response.content[0].text})

if __name__ == '__main__':
    app.run(debug=True)