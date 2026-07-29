import sys
path = r"D:\code\tinybase\client-js\src\react\AuthModal.tsx"
with open(path, "r", encoding="utf-8", newline="") as f:
    src = f.read()
print("len:", len(src))
print("first 100:", repr(src[:100]))
old = (
    "import {\n"
    "  useEffect,\n"
    "  useId,\n"
    "  useRef,\n"
    "  useState,\n"
    "  type FormEvent,\n"
    "  type KeyboardEvent,\n"
    "  type MouseEvent,\n"
    '} from "react";'
)
print("found:", old in src)
