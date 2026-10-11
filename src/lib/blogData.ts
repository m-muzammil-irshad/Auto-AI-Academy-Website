export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /**
   * Article body as HTML. Supported building blocks (styled by `.article` in globals.css):
   * h2 / h3 (become the table of contents), p, ul / ol, blockquote,
   * <pre><code> for code (escape < and >, keep code flush left),
   * <aside class="callout"> (tip) or <aside class="callout callout-warning">,
   * and <div class="takeaways"> for the closing summary.
   * New posts are written in the admin editor, which produces the same HTML.
   */
  content: string;
  date: string;
  author: string;
  category: string;
  coverImage: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "how-to-start-learning-ai-in-2024",
    title: "How to Start Learning AI in 2024: A Beginner's Guide",
    excerpt: "Discover the best free resources, tools, and roadmaps to kickstart your career in Artificial Intelligence and Automation.",
    content: `
<p>Artificial Intelligence is no longer a futuristic idea. Tools like ChatGPT and automated workflows are already changing how people study, work, and run businesses. The good news is that you do not need a computer science degree to get started. You need a clear order to learn things in, and the habit of practicing every week.</p>

<p>This guide gives you that order: four steps, a four-week plan, and the mistakes most beginners make.</p>

<h2>What "learning AI" actually means</h2>
<p>AI is a wide field, and beginners often feel lost because they try to learn all of it at once. For most people starting out, it comes down to three practical skills:</p>
<ul>
  <li><strong>Programming</strong>, so you can tell a computer exactly what to do.</li>
  <li><strong>Using AI models well</strong>, so you can get reliable results from tools that already exist.</li>
  <li><strong>Building small projects</strong>, so you can combine both to solve a real problem.</li>
</ul>
<p>The heavy mathematics matters later, when you want to train your own models. It is not where you should begin.</p>

<h2>Step 1: Learn Python programming</h2>
<p>Python is the most widely used language in AI. Popular libraries such as TensorFlow, PyTorch, and scikit-learn are all built for it, and its syntax is close to plain English, which makes it friendly for a first language.</p>
<p>Start with the fundamentals: variables, conditions, loops, functions, and lists. Here is a tiny program that uses most of them:</p>
<pre><code>scores = [72, 85, 90, 64]

def average(numbers):
    return sum(numbers) / len(numbers)

result = average(scores)

if result &gt;= 75:
    print(f"Average is {result:.1f}. Great work!")
else:
    print(f"Average is {result:.1f}. Keep practicing.")</code></pre>
<p>If you can read that and explain each line, you already understand the building blocks every AI script is made from.</p>
<aside class="callout">
  <p>Type the code yourself instead of copying it. Fixing your own typos is one of the fastest ways to learn how a language really works.</p>
</aside>

<h2>Step 2: Understand prompt engineering</h2>
<p>Before you write complex code, learn how to communicate with AI. Prompt engineering is the skill of giving a Large Language Model (LLM) clear instructions so it returns the output you actually need.</p>
<p>Compare these two requests:</p>
<blockquote>
  <p>Write about Python.</p>
</blockquote>
<blockquote>
  <p>You are a patient programming teacher. Explain what a Python list is to a complete beginner in three short paragraphs, and finish with one small code example.</p>
</blockquote>
<p>The second prompt gives the model a role, an audience, a length, and a format. The answer will be far more useful, and you did not need any code to get it.</p>

<h2>Step 3: Learn how models work, at a high level</h2>
<p>You do not need the mathematics yet, but you should know the basic idea. A model learns patterns from a large number of examples, then uses those patterns to make predictions about new input. Three terms are worth knowing early:</p>
<ul>
  <li><strong>Training data</strong>: the examples a model learns from.</li>
  <li><strong>Model</strong>: the patterns it has learned, stored as numbers.</li>
  <li><strong>Inference</strong>: using the trained model to answer a new question.</li>
</ul>
<p>Understanding this helps you see why AI sometimes gives confident but wrong answers: it is predicting what is likely, not looking facts up.</p>

<h2>Step 4: Build real projects</h2>
<p>Theory is useful, but practice is what makes skills stay. Start with projects small enough to finish in a weekend:</p>
<ol>
  <li>A script that renames or organizes files on your computer.</li>
  <li>A simple question-and-answer chatbot for one topic you know well.</li>
  <li>A tool that summarizes a long piece of text into five bullet points.</li>
</ol>
<p>At Auto AI Academy every course is built around hands-on assignments for exactly this reason. You learn a concept, then you prove it by building something.</p>

<h2>A four-week starter plan</h2>
<ol>
  <li><strong>Week 1:</strong> Python basics. Variables, conditions, and loops. Write ten small programs.</li>
  <li><strong>Week 2:</strong> Functions, lists, and dictionaries. Rewrite last week's programs in a cleaner way.</li>
  <li><strong>Week 3:</strong> Prompt engineering. Practice roles, context, and output formats on a tool you already use.</li>
  <li><strong>Week 4:</strong> Your first project. Pick one idea from the list above and finish it.</li>
</ol>

<h2>Common mistakes to avoid</h2>
<ul>
  <li><strong>Only watching tutorials.</strong> If you are not writing code, you are not learning to code.</li>
  <li><strong>Jumping to advanced topics too early.</strong> Neural networks make much more sense after you are comfortable with Python.</li>
  <li><strong>Learning alone with no feedback.</strong> Submit your work somewhere it gets reviewed, so you know what to improve.</li>
</ul>
<aside class="callout callout-warning">
  <p>AI tools can write code for you, but if you cannot read and correct that code you will get stuck the moment something breaks. Learn the basics first, then use AI to move faster.</p>
</aside>

<div class="takeaways">
  <h2>Key takeaways</h2>
  <ul>
    <li>Start with Python, not mathematics.</li>
    <li>Learn to write clear prompts before you write complex code.</li>
    <li>Know the basic idea of training data, models, and inference.</li>
    <li>Finish small projects. Finished beats perfect.</li>
  </ul>
</div>
`,
    date: "Oct 5, 2024",
    author: "Muzammil Irshad",
    category: "Artificial Intelligence",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&h=900&q=80"
  },
  {
    id: "2",
    slug: "why-prompt-engineering-is-the-skill-of-the-future",
    title: "Why Prompt Engineering is the Skill of the Future",
    excerpt: "Learn why prompt engineering is becoming the most sought-after skill and how you can master it.",
    content: `
<p>Two people can use the same AI tool and get completely different results. One gets a vague paragraph they have to rewrite. The other gets exactly what they needed on the first try. The difference is rarely the tool. It is the prompt.</p>

<h2>What is prompt engineering?</h2>
<p>Prompt engineering is the practice of writing clear, structured instructions (prompts) that guide an AI model such as ChatGPT toward the output you want. Think of it as learning how to brief a very capable assistant who knows a lot, but knows nothing about your situation until you explain it.</p>

<h2>Why it matters</h2>
<p>AI tools are becoming part of everyday work: writing, research, coding, customer support, and data analysis. As that happens, the ability to get precise and useful answers from them becomes valuable in almost every job, not only technical ones.</p>
<ul>
  <li>It saves time, because you spend less effort fixing weak answers.</li>
  <li>It improves quality, because the model works from better instructions.</li>
  <li>It is a skill you can use immediately, whatever you are studying or working on.</li>
</ul>

<h2>The anatomy of a good prompt</h2>
<p>Strong prompts usually contain the same five parts. You do not need all of them every time, but each one you add removes guesswork for the model.</p>
<ol>
  <li><strong>Role:</strong> who the model should act as.</li>
  <li><strong>Context:</strong> the background it needs to know.</li>
  <li><strong>Task:</strong> exactly what you want done.</li>
  <li><strong>Format:</strong> how the answer should be laid out.</li>
  <li><strong>Examples:</strong> a sample of what good output looks like.</li>
</ol>

<h3>A weak prompt</h3>
<pre><code>Write an email about the meeting.</code></pre>
<p>The model has to guess who the email is for, what the meeting was about, and how formal to be.</p>

<h3>A strong prompt</h3>
<pre><code>You are an assistant helping a university student.

Context: I missed yesterday's project meeting because I was sick.
Task: Write a short email to my team lead apologizing and asking
for the meeting notes.
Format: Under 100 words, polite and professional, with a clear
subject line.</code></pre>
<p>Same request, but now the model knows the role, the situation, the goal, and the shape of the answer.</p>

<h2>Three techniques that work</h2>

<h3>1. Show examples</h3>
<p>If you want output in a particular style, show one or two examples of it. This is often called few-shot prompting, and it is one of the most reliable ways to control tone and format.</p>

<h3>2. Ask for the steps</h3>
<p>For problems that need reasoning, such as mathematics, planning, or debugging, ask the model to work through the problem step by step before giving its final answer. You get better answers, and you can see where it went wrong when it does.</p>

<h3>3. Iterate</h3>
<p>Your first prompt is a draft. Read the output, notice what is missing, and refine the instruction. Small changes, like adding a word limit or naming the audience, often make a large difference.</p>
<aside class="callout">
  <p>When an answer is close but not right, do not start over. Tell the model what to change: "Make it shorter", "Use simpler words", or "Add one example".</p>
</aside>

<h2>Common mistakes</h2>
<ul>
  <li><strong>Being too vague.</strong> "Make this better" gives the model nothing to aim for.</li>
  <li><strong>Asking for too much at once.</strong> Break large jobs into smaller prompts.</li>
  <li><strong>Trusting the answer blindly.</strong> Always check facts, numbers, and code.</li>
</ul>
<aside class="callout callout-warning">
  <p>AI models can state incorrect information with complete confidence. Treat the output as a first draft that you review, not as a final answer.</p>
</aside>

<div class="takeaways">
  <h2>Key takeaways</h2>
  <ul>
    <li>Better prompts produce better results from the same tool.</li>
    <li>Give the model a role, context, a clear task, and a format.</li>
    <li>Use examples, ask for step-by-step reasoning, and iterate.</li>
    <li>Always review what the model gives you.</li>
  </ul>
</div>
`,
    date: "Sep 28, 2024",
    author: "Muzammil Irshad",
    category: "Prompt Engineering",
    coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&h=900&q=80"
  },
  {
    id: "3",
    slug: "python-automation-scripts-for-beginners",
    title: "5 Python Automation Scripts Every Beginner Should Try",
    excerpt: "Stop doing repetitive tasks manually. Learn how to write simple Python scripts to automate your daily workflows.",
    content: `
<p>Automation is about getting your time back. If you do the same boring task on your computer more than a few times, Python can probably do it for you in seconds. The five scripts below use only Python's standard library, so there is nothing extra to install.</p>

<aside class="callout callout-warning">
  <p>Scripts that rename or move files cannot be undone with Ctrl+Z. Always test on a copy of your folder first.</p>
</aside>

<h2>1. Rename many files at once</h2>
<p>Camera photos arrive with names like <code>IMG_4821.jpg</code>. This script renames every JPG in a folder to a clean, numbered name.</p>
<pre><code>from pathlib import Path

folder = Path("photos")

for number, file in enumerate(sorted(folder.glob("*.jpg")), start=1):
    new_name = f"trip_{number:03}.jpg"
    file.rename(folder / new_name)
    print(f"{file.name} -&gt; {new_name}")</code></pre>
<p><code>enumerate</code> gives each file a number starting from 1, and <code>{number:03}</code> pads it with zeros so the files sort correctly: <code>trip_001.jpg</code>, <code>trip_002.jpg</code>, and so on.</p>

<h2>2. Organize a messy folder</h2>
<p>This one sorts every file in your Downloads folder into subfolders named after the file type, such as <code>pdf</code>, <code>jpg</code>, and <code>zip</code>.</p>
<pre><code>from pathlib import Path
import shutil

downloads = Path.home() / "Downloads"

for file in list(downloads.iterdir()):
    if file.is_file():
        extension = file.suffix.lower().lstrip(".") or "other"
        target = downloads / extension
        target.mkdir(exist_ok=True)
        shutil.move(str(file), str(target / file.name))</code></pre>
<p>Files without an extension go into a folder called <code>other</code>. The <code>list(...)</code> around <code>iterdir()</code> takes a snapshot of the folder first, so creating new subfolders does not confuse the loop.</p>

<h2>3. Find duplicate files</h2>
<p>Two files can have different names and still be identical. This script compares the actual content of each file by calculating a hash, which works like a fingerprint.</p>
<pre><code>import hashlib
from pathlib import Path

seen = {}

for file in Path("documents").rglob("*"):
    if file.is_file():
        digest = hashlib.sha256(file.read_bytes()).hexdigest()
        if digest in seen:
            print(f"Duplicate: {file} is the same as {seen[digest]}")
        else:
            seen[digest] = file</code></pre>
<p>It only prints what it finds. Deleting is left to you, which is the safe way to start.</p>

<h2>4. Back up a folder to a ZIP file</h2>
<p>A dated backup takes three lines. Run it before you make big changes to a project.</p>
<pre><code>import shutil
from datetime import date

backup_name = f"project_backup_{date.today()}"
shutil.make_archive(backup_name, "zip", "my_project")
print(f"Created {backup_name}.zip")</code></pre>
<p><code>date.today()</code> adds the date to the file name, so each day's backup is kept separately instead of overwriting the last one.</p>

<h2>5. Total a column in a CSV file</h2>
<p>Spreadsheets exported as CSV are easy to read with Python. This script adds up the <code>amount</code> column of a sales file.</p>
<pre><code>import csv

total = 0

with open("sales.csv", newline="") as f:
    for row in csv.DictReader(f):
        total += float(row["amount"])

print(f"Total sales: {total:.2f}")</code></pre>
<p><code>csv.DictReader</code> uses the first row of the file as column names, so you can write <code>row["amount"]</code> instead of counting columns.</p>

<h2>How to practice</h2>
<p>Reading scripts is not the same as writing them. To make these stick:</p>
<ol>
  <li>Type each script out and run it on a test folder.</li>
  <li>Change one thing, such as the file type or the naming pattern, and predict what will happen before you run it.</li>
  <li>Combine two of them. For example, back up a folder first, then organize it.</li>
</ol>
<aside class="callout">
  <p>When a script fails, read the last line of the error message first. It usually names the exact problem, such as a missing file or a misspelled column.</p>
</aside>

<div class="takeaways">
  <h2>Key takeaways</h2>
  <ul>
    <li>Python's standard library can automate most everyday file tasks.</li>
    <li><code>pathlib</code> handles files and folders; <code>shutil</code> moves and archives them.</li>
    <li>Always test file-changing scripts on a copy first.</li>
    <li>Modify each script yourself. That is where the learning happens.</li>
  </ul>
</div>
`,
    date: "Sep 15, 2024",
    author: "Sarah Khan",
    category: "Python",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&h=900&q=80"
  }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}
