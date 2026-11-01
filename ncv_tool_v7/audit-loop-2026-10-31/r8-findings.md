# Round 8 findings: Fable's review of round 7, a freshwater ecologist on a phone held sideways, a clinician-scientist writing in a third language, 2026-11-01

Recorded from the three agents' final replies. All walked the round 8 snapshot (= commit f3d959c).

## Fable review of round 7 (N-1 to N-9): 2 major · 7 minor

- **N-1 · major (run).** A trainee answer that starts with a capitalised name ending in -s ("James now leads…", "Charles now runs…") was taken for a verb, lower-cased and joined with ", and". → **Fixed:** a capitalised first word joins only when it is a listed verb; the -s/-ed guess applies only to an answer typed in lower case. Any other answer prints whole, as its own sentence.
- **N-2 · major (run).** The round 7 full stop at joins left a part typed in lower case starting in lower case in every output. → **Fixed:** the same rule that adds the stop capitalises the first letter.
- **N-3 · minor.** A stop was doubled after a closing mark that follows a space or a straight quote (« … ». , 'done.'.) and added after a trailing dash. → **Fixed:** closing marks after the stop, with ordinary or French spaces, count as the end; a trailing dash or comma is dropped before the stop.
- **N-4 · minor.** The round 7 button size outranked the small-button sizes (Change, Edit evidence). → **Fixed:** the base size sits at the start of the styles.
- **N-5 · minor.** At 150% text on a laptop the rail broke "Contributions" and "Mentorship" inside the word. → **Fixed:** the rail column is sized in rem (220 px at 100%, 330 px at 150%), so the labels keep whole words. A first attempt with a container query broke the rail's L-lines and was reverted.
- **N-6 · minor.** The .txt printed "[Links to move…]" and "[Lists to rewrite…]" under the mentorship heading though they name contributions. → **Fixed:** both notes sit in the header, beside the over-limit line.
- **N-7 · minor.** The trainee sentence had its own end-of-sentence test, which disagreed with the shared one ("lab….", ".)."). → **Fixed:** one rule for both.
- **N-8 · minor.** Year-led lines ("2019. Joined…") counted as a numbered list. → **Fixed:** a numbered list marker is one or two digits.
- **N-9 · minor.** The word shown in the read across contributions was the first form seen in the session, across drafts. → **Fixed:** the map is rebuilt on each read.

## r8-a · early-career freshwater ecologist, NSERC Discovery, phone held sideways (812 × 375) then laptop: 6 minor · 2 polish

Started on the phone (Setup, two contributions with evidence, mentorship totals), saved a draft file from the rail, then finished on the laptop by opening that file with the browser's storage cleared. Nothing was lost on the way. A stream-health index used by ministry crews, an eDNA protocol for invasive crayfish, a volunteer stream-monitoring program; 819 words ([draft](r8-a-draft.txt)).

- **r8-a-1 · minor.** A phone held sideways (812 × 375) got the desktop layout: a 240 px rail with an inner scroll that hid Save draft, Review and Export. → **Fixed (INFERRED):** a touch screen wider than 768 px and at most 520 px high gets the one-column layout with the folded rail.
- **r8-a-2 · minor · a11y.** The Other group-name box was 58 px wide, 12.8 px text, 30 px tall. → **Fixed:** 16 px text and 44 px height on phones and touch screens; the tiles reflow so the box has room.
- **r8-a-3 · minor · a11y.** A fast Tab left "+ Add evidence" below the screen (the previous field's eased scroll overrode the browser's). → **Fixed:** the eased scroll stops when focus moves to anything other than a field box.
- **r8-a-4 · minor · a11y.** "+ Add evidence" and "Edit evidence" put focus on a control below the screen on a short screen. → **Fixed:** the focused control is brought into view.
- **r8-a-5 · minor.** "each one" counted as a specific number. → **Fixed:** "one" after each, every, no, any, this, that, the, which, someone or anyone, or before "of" or "another", is a pronoun.
- **r8-a-6 · minor.** The Undo for a removed contribution sat after the card list, far below the screen. → **Fixed:** the Undo line takes the removed card's place, beside the card that takes focus.
- **r8-a-7 · polish.** Tile labels broke inside words ("Postdoct / oral"). → **Fixed** with r8-a-2 (the tiles reflow; no word breaks at 812 × 375 or 375 × 812).
- **r8-a-8 · polish.** After a step change the "My narrative CV" kicker was half under the top bar. → **Fixed:** the whole header block is scrolled into view.

## r8-b · mid-career rehabilitation clinician-scientist, CIHR Project Grant, English as a third language: 1 major · 7 minor · 2 polish, and 26 rewrites

A rehabilitation protocol that helps stroke survivors walk sooner, a tele-rehabilitation program for patients far from a hospital, a short questionnaire that predicts return to work after spinal cord injury; 23 trainees, one described; a full statement; 1,074 words ([draft](r8-b-draft.txt)). The persona would take the draft forward and edit the English by hand.

- **r8-b-1 · major.** A role line such as "I am the principal investigator" or "I am responsible for the analysis" did not count as naming a part, so later "we" fields were flagged. → **Fixed:** "I am" or "I was" followed by the, a, an, responsible, in charge, lead, co-lead, principal, senior, first or sole names a part.
- **r8-b-2 · minor.** "our region" in Stakes was flagged for a missing role, depending on the order of writing. → **Fixed (INFERRED):** Stakes and What resulted are not asked for your own part.
- **r8-b-3 · minor.** "the patients could walk without help" was flagged as a hedge. → **Fixed:** walk, stand, swallow, return, climb, dress, speak, drive, live, eat, sleep, breathe, move and sit join the past-ability verbs.
- **r8-b-4 · minor · copy.** The length line gave no verdict ("34 words · 50 to 100 is a comfortable range here."). → **Fixed:** "34 words. The usual range here is 50 to 100, so this is short." or "…, within the usual range of 40 to 80."
- **r8-b-5 · minor.** "List the things themselves" produced verbless sentences in the outputs. → **Fixed (copy):** "Write a sentence that names what the work produced, such as “The study produced a protocol and three papers.” Its effects belong in the next field." A check for a field with no verb is not built.
- **r8-b-6 · minor · a11y.** The join words in the paragraph preview were explained only by a hover title. → **Fixed:** a visible line under the preview.
- **r8-b-7 · minor.** "prestigious" got the Journal Impact Factor message, while the people note used the word. → **Fixed:** its own message ("“prestigious” is an opinion. Name the prize, the journal or the funder, and the year."); the people note says "major scholarships".
- **r8-b-8 · minor.** Nothing said the checks ignore grammar; "a lot of" passed. → **Fixed:** the first check box says the checks look at content and do not check grammar or spelling; "a lot of", "lots of", "numerous" and "plenty of" join the vague words. ("some" stays off the list: it is too common to flag.)
- **r8-b-9 · polish.** "permitted", "received" and "change" appeared in the read across contributions. → **Fixed** (stop words).
- **r8-b-10 · polish.** The trainee placeholders did not match how the sentence prints, and two ", and" joins ran together. → **Fixed:** the placeholders show where the words land; the parts join as "a, b and c".
- **Rewrites:** 10 priority and 16 further. The nine tied to a finding were applied (above); the rest are listed for Prem in [r8-plain-language-rewrites.md](r8-plain-language-rewrites.md), with a Decision column.
