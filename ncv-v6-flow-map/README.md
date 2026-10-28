# V6 narrative CV tool: flow map

**Open `ncv-v6-flow-map.html`.** Double-click it. It is one file (about 3 MB), needs no server, no network and no install, and can be emailed as it is.

## Files

| File | What it is |
|---|---|
| `ncv-v6-flow-map.html` | The finished map. Send this one. |
| `ncv-v6-flow-map.template.html` | The map's code and data (nodes `N`, edges `E`), with a `SHOTDATA` placeholder where the screenshots go. Edit this one. |
| `build.js` | Fills the placeholder with the screenshots and writes the finished file: `node ncv-v6-flow-map/build.js` |
| `capture-screens.js` | Takes the screenshots with headless Chrome, driven over the DevTools protocol in plain Node: `node ncv-v6-flow-map/capture-screens.js` |
| `test-map.js` | Opens the finished file in headless Chrome with the network off and tests it: `node ncv-v6-flow-map/test-map.js` |
| `FOUR-LISTS.md` | The four lists the map was drawn from: screens, user actions, data, logic. |
| `shots/` | The captured JPEGs and `manifest.json`. |

After the tool changes: re-run `capture-screens.js`, then `build.js`. After editing nodes or edges: `build.js` only.

## What the filters do

- **Layer chips** (U User actions, S Screens, ƒ Logic, D Data, X External, O Ops) show or hide a whole layer. Each chip carries the shape and letter its nodes use.
- **Edge chips** show or hide one kind of line. They double as the legend. Each has its own colour, dash pattern and symbol.
- **Presets** set both rows at once. *User journey only*: users and screens, flow lines. *Data in/out*: logic, data, external, read/write/net lines. *Architecture*: everything but the user and ops. *Exports and files*, *Feedback path* and *Ops and checks* show just the nodes of that topic. *Everything* shows all of it.
- Changing a filter redraws the map without moving your zoom. **Fit to window** is the only button that resets it.
- **Steps 1 to 9** walk the main journey and light up that step's nodes and the lines between them.
- **− / +** on a node folds the nodes inside it into one. **Collapse all** and **Expand all** do it everywhere.
- **Edge labels** prints each line's label on the map. Hovering a node lights its lines and dims the rest. Clicking a node keeps it lit while the mouse moves; clicking it again lets go.

## What the colours and shapes mean

Never colour alone: every layer has a letter and a shape, every line has a dash pattern and a symbol.

| Layer | Shape | Colour |
|---|---|---|
| U user action | pill | blue |
| S screen | box with a dark bar | black outline |
| ƒ logic | hexagon | purple |
| D data | cylinder | orange |
| X external | dashed box | teal |
| O ops | slanted box | brown |

| Line | Meaning | Look |
|---|---|---|
| flow → | the user's path, step to step | blue, solid, thick |
| shows ◎ | a screen displays this data | green, dotted |
| logic ƒ | one piece of code calls another | purple, solid, thin |
| read ◂ | pulls from storage | orange, dash-dot |
| write ▸ | pushes to storage | red, dashed |
| net ⇄ | network call or outside link | teal, long dashes |
| ops ⚙ | deploy, release, backup, admin | brown, fine dots, thick |

A **gold outline** on a node means it has a note. A **red ?** means a guess or something I could not trace.

## Notes for the review

Every node has a note box in its panel. Every screenshot has its own. **Map note** is one general note. Notes save in the browser as you type (localStorage), so they stay on that computer. **All notes** lists them and jumps to each. There you can export Markdown or JSON and import either back; importing asks before replacing a note that differs.

To review together by email: each person exports their notes and sends the file; import it to see theirs next to yours.

## The "?" nodes (guesses or untraced)

- **Project feedback sheet** and **Read feedback rows**: the Apps Script behind the sheet is not in the repository. Only the tool's side of the call is known.
- **GitHub Pages deploy**: set up outside the repository; known from the project notes and from pushes made while building V6.
- **Guide pages**: a link target. Its inside was not read for this map.
- **Print and Word builder**: Word's handling of an HTML file saved as `.doc` is documented behaviour, but the file was not opened in Word.

The feedback read-back path (the extra GET after a failed POST) is drawn, since it is in the code, but it was not exercised.

## Screens not captured

Every screen node has a screenshot. Not captured as their own screens: the browser's own confirm box on Reset, the file-save dialogs, the Word file when opened in Word, and the guide page (not part of V6). The Structural read screen was captured on the draft path only, since it exists only there. The CV-FRQ variant (different section names, an extra prompt) was not captured.

All screenshots use an **invented demo draft**, loaded into a throwaway Chrome profile. No real draft, CV or person appears. The capture script never presses Send, so nothing was sent anywhere. Desktop is 1200 px wide, phone 390 px.

## Scope

Only `narrative-cv-prototype-v6.html` (commit `b14c55d`), the `ncv_tool_v6/` alias, the V6 check script and the V6 log. Nothing else in the codebase is mapped. Line numbers in the panels are for that commit.
