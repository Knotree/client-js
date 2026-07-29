import sys

path = r"D:\code\tinybase\client-js\src\react\UserProfile.tsx"
with open(path, "rb") as f:
    raw = f.read()
nl_b = b"\r\n" if b"\r\n" in raw else b"\n"
nl = nl_b.decode("ascii")
src = raw.decode("utf-8")

# 1) Replace the existing block (with the new userName/initials useMemo) to move things
old_block = (
    "  const userName = useMemo(() => displayName(session), [session]);" + nl
    + "  const initials = useMemo(() => initialsOf(userName), [userName]);" + nl
    + "  const meta = viewCopy[view];" + nl
    + "  const otherSessionsCount = sessions.filter((s) => !s.current).length;" + nl
    + "  const filteredSessions = useMemo(() => {" + nl
    + "    if (!sessionSearch.trim()) return sessions;" + nl
    + "    const q = sessionSearch.toLowerCase();" + nl
    + "    return sessions.filter(" + nl
    + "      (s) =>" + nl
    + "        s.device?.toLowerCase().includes(q) ||" + nl
    + "        s.application?.toLowerCase().includes(q) ||" + nl
    + "        s.network_hint?.toLowerCase().includes(q)," + nl
    + "    );" + nl
    + "  }, [sessionSearch, sessions]);"
)
new_block = (
    "  const meta = viewCopy[view];" + nl
    + "  const otherSessionsCount = sessions.filter((s) => !s.current).length;" + nl
    + "  const filteredSessions = useMemo(() => {" + nl
    + "    if (!sessionSearch.trim()) return sessions;" + nl
    + "    const q = sessionSearch.toLowerCase();" + nl
    + "    return sessions.filter(" + nl
    + "      (s) =>" + nl
    + "        s.device?.toLowerCase().includes(q) ||" + nl
    + "        s.application?.toLowerCase().includes(q) ||" + nl
    + "        s.network_hint?.toLowerCase().includes(q)," + nl
    + "    );" + nl
    + "  }, [sessionSearch, sessions]);" + nl
    + "  const userName = useMemo(() => displayName(session), [session]);" + nl
    + "  const initials = useMemo(() => initialsOf(userName), [userName]);"
)
if old_block not in src:
    print("old_block not found", file=sys.stderr)
    sys.exit(1)
src = src.replace(old_block, new_block)
print("step 1 done")

# 2) Now move the entire block (meta, otherSessionsCount, filteredSessions, userName, initials)
# before the early return
new_block_full = (
    "  const meta = viewCopy[view];" + nl
    + "  const otherSessionsCount = sessions.filter((s) => !s.current).length;" + nl
    + "  const filteredSessions = useMemo(() => {" + nl
    + "    if (!sessionSearch.trim()) return sessions;" + nl
    + "    const q = sessionSearch.toLowerCase();" + nl
    + "    return sessions.filter(" + nl
    + "      (s) =>" + nl
    + "        s.device?.toLowerCase().includes(q) ||" + nl
    + "        s.application?.toLowerCase().includes(q) ||" + nl
    + "        s.network_hint?.toLowerCase().includes(q)," + nl
    + "    );" + nl
    + "  }, [sessionSearch, sessions]);" + nl
    + "  const userName = useMemo(() => displayName(session), [session]);" + nl
    + "  const initials = useMemo(() => initialsOf(userName), [userName]);" + nl
)
# Find the early return
early_return = (
    "  if (!open || !session || typeof document === \"undefined\") return null;"
)
if new_block_full not in src:
    print("new_block_full not found", file=sys.stderr)
    sys.exit(1)
# Remove the new block (it will be re-inserted before early return)
src = src.replace(new_block_full, "")
# Insert before the early return
src = src.replace(early_return, new_block_full + early_return)
print("step 2 done")

with open(path, "wb") as f:
    f.write(src.encode("utf-8"))

print("done")
