# Global Lessons Learned

Constraints, bugs, and discoveries that apply across workflows and tools. Check this before designing new tools or business processes.

---

## 2026-04-05

- **Supabase free tier limits**: 50k MAU, 500MB DB, 500MB storage, 2GB bandwidth. Monitor usage as user count grows.
- **Turbify static hosting**: No server-side rendering, no build system. All course pages are plain HTML/CSS/JS.
- **innerHTML security**: Use `createElement`/`createTextNode` for any user-provided data (names, emails). `innerHTML` is safe only for hardcoded trusted content.
- **Browser JS compatibility**: Use `var` (not `const`/`let`), string concatenation (not template literals), `.indexOf()` (not `.includes()`). No ES6 modules — all scripts loaded via `<script>` tags.
- **Subagent rate limits**: When dispatching many parallel agents, some may hit rate limits. Plan for re-dispatch of failed work.
