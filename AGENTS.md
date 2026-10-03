<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep atlas mock records in local JSON and access them through `src/lib/atlas.ts`, so a later data source can replace the mock without rewriting screens.
- Keep the atlas background and persona context in the root shell, so navigation preserves their state and visual continuity.

- Store short map relationship labels with each mock edge record, so in-graph summaries and evidence descriptions stay tied to the same data source.
