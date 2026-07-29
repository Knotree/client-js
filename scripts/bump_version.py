path = r"D:\code\tinybase\client-js\package-lock.json"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()
import re
# Replace version only for our package
content = re.sub(
    r'("name": "@knotree/client",\s*"version": )"0\.3\.1"',
    r'\1"0.4.0"',
    content,
    count=1,
)
content = re.sub(
    r'(node_modules/@knotree/client":\s*\{[^}]*"version": )"0\.3\.1"',
    r'\1"0.4.0"',
    content,
    count=1,
)
with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
