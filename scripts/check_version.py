path = r"D:\code\tinybase\client-js\package-lock.json"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()
import re
m = re.search(r'"name":\s*"@knotree/client".*?"version":\s*"(0\.\d+\.\d+)"', content, re.DOTALL)
print("package:", m.group(1) if m else "no")
m2 = re.search(r'node_modules/@knotree/client.*?"version":\s*"(0\.\d+\.\d+)"', content, re.DOTALL)
print("node_modules:", m2.group(1) if m2 else "no")
