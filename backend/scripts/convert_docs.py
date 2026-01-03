
import os
import re

# Configuration
SOURCE_DIR = r"d:\Projects\AltairLabs\reports"
OUTPUT_DIR = r"d:\Projects\AltairLabs\reports\html_docs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

CSS = """
<style>
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 210mm;
        margin: 40px auto;
        padding: 40px;
        background: #fff;
        box-shadow: 0 0 15px rgba(0,0,0,0.1);
    }
    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    h2 { color: #2980b9; margin-top: 30px; }
    h3 { color: #16a085; }
    
    /* Tables */
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f2f2f2; color: #333; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    
    /* Code Blocks */
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; border: 1px solid #ddd; }
    code { font-family: 'Consolas', 'Monaco', monospace; color: #d63384; }
    pre code { color: #333; }
    
    /* Alerts */
    .alert { padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 5px solid; }
    .alert-note { background-color: #e3f2fd; border-color: #2196f3; }
    .alert-tip { background-color: #e8f5e9; border-color: #4caf50; }
    .alert-warning { background-color: #fff3e0; border-color: #ff9800; }
    .alert-important { background-color: #f3e5f5; border-color: #9c27b0; }
    
    /* Mermaid */
    .mermaid { text-align: center; margin: 30px 0; }
    
    /* Print */
    @media print {
        body { box-shadow: none; margin: 0; padding: 0; width: 100%; max-width: 100%; }
        .no-print { display: none; }
    }
</style>
<script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true });
</script>
"""

def parse_markdown(text):
    lines = text.split('\n')
    html_lines = []
    
    in_code_block = False
    in_table = False
    in_mermaid = False
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # --- Blocks ---
        
        # Mermaid Start
        if line.strip().startswith('```mermaid'):
            html_lines.append('<div class="mermaid">')
            in_mermaid = True
            i += 1
            continue
        
        # Code Block Start
        if line.strip().startswith('```'):
            if in_mermaid:
                html_lines.append('</div>')
                in_mermaid = False
            elif in_code_block:
                html_lines.append('</code></pre>')
                in_code_block = False
            else:
                html_lines.append('<pre><code>')
                in_code_block = True
            i += 1
            continue
            
        if in_mermaid:
            html_lines.append(line)
            i += 1
            continue
            
        if in_code_block:
            html_lines.append(line.replace('<', '&lt;').replace('>', '&gt;'))
            i += 1
            continue

        # --- Tables ---
        if line.strip().startswith('|'):
            if not in_table:
                html_lines.append('<table>')
                in_table = True
            
            # Check if separator row
            if '---' in line:
                i += 1
                continue
                
            cells = [c.strip() for c in line.strip('|').split('|')]
            row_tag = 'td'
            # Heuristic: First row of table is TH if we just started table
            if len(html_lines) > 2 and html_lines[-2] == '<table>':
                row_tag = 'th'
                
            row_html = '<tr>' + ''.join(f'<{row_tag}>{c}</{row_tag}>' for c in cells) + '</tr>'
            html_lines.append(row_html)
            i += 1
            continue
        else:
            if in_table:
                html_lines.append('</table>')
                in_table = False
        
        # --- Common Markdown ---
        
        # Alerts
        if line.strip().startswith('> [!'):
            alert_type = line.split('[!')[1].split(']')[0].lower() # note, tip, etc
            html_lines.append(f'<div class="alert alert-{alert_type}">')
            i += 1
            # Consume content lines until blank line or next block
            while i < len(lines) and lines[i].strip().startswith('>'):
                content = lines[i].replace('>', '', 1).strip()
                html_lines.append(content + '<br>')
                i += 1
            html_lines.append('</div>')
            continue
            
        # Headers
        if line.startswith('# '):
            html_lines.append(f'<h1>{line[2:]}</h1>')
        elif line.startswith('## '):
            html_lines.append(f'<h2>{line[3:]}</h2>')
        elif line.startswith('### '):
            html_lines.append(f'<h3>{line[4:]}</h3>')
            
        # Lists
        elif line.strip().startswith('- ') or line.strip().startswith('* '):
             # Simple list handling
             content = line.strip()[2:]
             html_lines.append(f'<li>{inline_format(content)}</li>')
        elif line.strip().startswith('1. '):
             content = line.strip()[3:]
             html_lines.append(f'<li>{inline_format(content)}</li>')
             
        # Paragraphs (Empty lines are breaks)
        elif line.strip() == '':
            html_lines.append('<br>')
        else:
            html_lines.append(f'<p>{inline_format(line)}</p>')
            
        i += 1
        
    return '\n'.join(html_lines)

def inline_format(text):
    # Bold
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    # Italic
    text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
    # Code
    text = re.sub(r'`(.*?)`', r'<code>\1</code>', text)
    return text

def convert_file(filename):
    src_path = os.path.join(SOURCE_DIR, filename)
    name_no_ext = os.path.splitext(filename)[0]
    out_path = os.path.join(OUTPUT_DIR, name_no_ext + ".html")
    
    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    html_content = parse_markdown(content)
    
    full_html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{name_no_ext.replace('_', ' ').title()}</title>
        {CSS}
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(full_html)
    print(f"Generated: {out_path}")

def main():
    print("Starting conversion...")
    files = [f for f in os.listdir(SOURCE_DIR) if f.endswith('.md')]
    for f in files:
        convert_file(f)
    print("Conversion complete.")

if __name__ == "__main__":
    main()
