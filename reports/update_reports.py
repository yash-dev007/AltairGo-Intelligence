import os
import markdown
import re

# Template parts
HTML_HEADER = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 40px auto;
            padding: 40px;
            background: #fff;
            box-shadow: 0 0 15px rgba(0,0,0,0.1);
        }}
        h1 {{ color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }}
        h2 {{ color: #2980b9; margin-top: 30px; }}
        h3 {{ color: #16a085; }}
        
        /* Tables */
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        th, td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
        th {{ background-color: #f2f2f2; color: #333; }}
        tr:nth-child(even) {{ background-color: #f9f9f9; }}
        
        /* Code Blocks */
        pre {{ background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; border: 1px solid #ddd; }}
        code {{ font-family: 'Consolas', 'Monaco', monospace; color: #d63384; }}
        pre code {{ color: #333; }}
        
        /* Alerts */
        .alert {{ padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 5px solid; }}
        .alert-note {{ background-color: #e3f2fd; border-color: #2196f3; }}
        .alert-tip {{ background-color: #e8f5e9; border-color: #4caf50; }}
        .alert-warning {{ background-color: #fff3e0; border-color: #ff9800; }}
        .alert-important {{ background-color: #f3e5f5; border-color: #9c27b0; }}
        
        /* Mermaid */
        .mermaid {{ text-align: center; margin: 30px 0; }}
        
        /* Print */
        @media print {{
            body {{ box-shadow: none; margin: 0; padding: 0; width: 100%; max-width: 100%; }}
            .no-print {{ display: none; }}
        }}
    </style>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({{ startOnLoad: true }});
    </script>
</head>
<body>
"""

HTML_FOOTER = """
</body>
</html>
"""

def preprocess_markdown(text):
    # Convert GitHub Alerts to HTML divs
    # Check for > [!NOTE] blocks
    # This is a simple regex assumption, might need robustness for multi-line blockquotes
    
    lines = text.split('\n')
    new_lines = []
    in_alert = False
    alert_type = ""
    
    for line in lines:
        match = re.match(r'>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]', line)
        if match:
            # Start of alert
            if in_alert:
                new_lines.append("</div>") # Close previous if exists (rare nested usage)
            
            alert_type = match.group(1).lower()
            if alert_type == 'caution': alert_type = 'important' # Map caution to important style
            
            new_lines.append(f'<div class="alert alert-{alert_type}">')
            in_alert = True
            # Remove the marker but keep content if any (usually marker is on own line)
            content = line[match.end():].strip()
            if content:
                new_lines.append(content)
        elif in_alert and line.startswith('>'):
             # Continued alert content
             new_lines.append(line[1:].strip())
        elif in_alert and not line.strip():
             # Empty line inside alert usually continues it, but let's assume blank line breaks it 
             # Or we can treat non-> lines as end of alert.
             # Standard MD treats blockquotes until non-> line.
             new_lines.append(line)
        elif in_alert and not line.startswith('>'):
             # End of alert
             new_lines.append("</div>")
             new_lines.append(line)
             in_alert = False
        else:
            new_lines.append(line)
            
    if in_alert:
        new_lines.append("</div>")
        
    return "\n".join(new_lines)

def convert_files():
    # Reports dir
    base_dir = os.getcwd() # Should be d:\Projects\AltairLabs\reports when run
    
    files = [f for f in os.listdir('.') if f.endswith('.md')]
    
    if not os.path.exists('html_docs'):
        os.makedirs('html_docs')
        
    for f in files:
        print(f"Processing {f}...")
        with open(f, 'r', encoding='utf-8') as file:
            md_text = file.read()
            
        # Preprocess
        md_text = preprocess_markdown(md_text)
        
        # Convert to HTML
        # extensions=['tables', 'fenced_code'] are essential
        html_body = markdown.markdown(md_text, extensions=['tables', 'fenced_code', 'nl2br'])
        
        # Handle mermaid blocks separately if markdown didn't handle them nicely
        # Often mermaid is in ```mermaid ... ```
        # python-markdown 'fenced_code' turns into <pre><code class="language-mermaid">
        # We want <div class="mermaid">
        
        html_body = html_body.replace('<pre><code class="language-mermaid">', '<div class="mermaid">').replace('</code></pre>', '</div>')
        # Fix the closing div for mermaid (since we replaced the opening tag, the closing tag </code></pre> needs to match)
        # However, replace above replaces ALL </code></pre> which is bad.
        # We need regex for safe replacement
        
        # Proper regex replace for mermaid blocks
        html_body = re.sub(
            r'<pre><code class="language-mermaid">(.*?)</code></pre>', 
            r'<div class="mermaid">\1</div>', 
            html_body, 
            flags=re.DOTALL
        )
        
        title = f.replace('.md', '').replace('_', ' ').title()
        
        full_html = HTML_HEADER.format(title=title) + html_body + HTML_FOOTER
        
        out_name = f.replace('.md', '.html')
        with open(os.path.join('html_docs', out_name), 'w', encoding='utf-8') as out_file:
            out_file.write(full_html)
            
        print(f"Generated html_docs/{out_name}")

if __name__ == "__main__":
    convert_files()
