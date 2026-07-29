path = r"D:\code\tinybase\client-js\src\react\UserProfile.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()
import re
for m in re.finditer(r'"Profile updated[^"]*"', content):
    print(repr(m.group(0)))
print('---')
for m in re.finditer(r'"Session signed out[^"]*"', content):
    print(repr(m.group(0)))
