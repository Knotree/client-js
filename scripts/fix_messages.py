path = r"D:\code\tinybase\client-js\src\react\UserProfile.tsx"
with open(path, "rb") as f:
    raw = f.read()
src = raw.decode("utf-8")
src = src.replace('"Profile updated");', '"Profile updated.");')
src = src.replace('"Other sessions signed out");', '"Other sessions signed out.");')
with open(path, "wb") as f:
    f.write(src.encode("utf-8"))
print("done")
