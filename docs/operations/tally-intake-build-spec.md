# Tally intake: build specification

**Internal. Not published.** `docs/` is excluded from the Jekyll build.

- **Approved source:** `docs/operations/practice-fundamentals-intake-system.md`, section 4 ("The intake form, ready to build").
- **This file:** instructions for building that form in Tally, by hand, once.
- **Rule for this file:** the questions, their order, help text, options, requirement and logic are carried over from the source without rewording. The question tables below were generated from the source file's own tables, so they can be checked line by line against it. If the two ever disagree, the source wins; fix this file.

**Written:** 17 September 2026, alongside the website changes that host the form at `/client/intake/`.

---

## 0. What changes from the source, and why

Only three things differ from the source, all at Alexander's instruction.

1. **The visible labels.** The source uses five client-facing labels. The form uses these four, in bold at the start of each help text:

| Source label | Label used in the form | Fields |
| --- | --- | --- |
| Needed before publishing (\*) | **Fact needed before publishing** | All of pages 1–2 except B3, B5 and B6; plus D1, D1a, D3, E8, F4, H1, H1a, I1, I2, I4, I5, I9, I10, J1–J5 (except J4b), J9 and K4 |
| Core question (★) | **Core question** | C1, C3, D2, E1, E2, E3, F3 |
| Optional: more context | **Optional context** | B3, B5, C2, C4, D4, E4–E7, F1, F2, F5, G1, G3–G5, J4b, J6–J8, J10, K1–K3 |
| Optional: ideas, references and files | **Optional reference or upload** | B6, G2, H2–H10, I3, I6–I8 |
| Prefer to talk? | **Optional reference or upload** | V3, V4, V5 |

2. **J4b** ("Any domain names you'd like?") falls inside the source's "J1–J5" range, but its table row carries no asterisk. It is treated as **Optional context** and is not required.

3. **The welcome screen and completion screen** use the four labels above in place of the source's asterisk wording. Nothing else in them is changed.

**Never tell a client how many questions there are.** The form has roughly seventy-five fields before conditional logic hides the ones that don't apply. That number appears only in this internal file. Do not put it in the form, the welcome email, the website or anywhere a client will read it.

---

## 1. Create the form

1. Sign in at tally.so and click **Create form** (the + button in the dashboard).
2. Choose **Start from scratch**.
3. Title the form **Practice Fundamentals intake**. The page at `/client/intake/` hides Tally's title (the embed address uses `hideTitle=1`), so this title shows only when the form is opened on its own.
4. Build the welcome screen (section 2), then the nine pages (section 4), separating the pages with **Page break** blocks (type `/page break`).
5. Add the hidden field (section 3) before the first question.
6. Set the completion screen (section 5) and the settings (section 6).
7. Test it (section 8), then **Publish**.

**Tally's menus.** The menu names below were correct when this was written. If Tally renames one, type `/` in the editor and search for the feature (for example "hidden fields", "conditional logic" or "thank you page").

**Type names in Tally.** In the tables, *Short answer*, *Long answer*, *Email*, *Link*, *Multiple choice*, *Checkboxes*, *Checkbox*, *File upload*, *Linear scale* and *Matrix* are Tally block names; type `/` and the name to insert one. A *Required* value of **Yes** means switching on the block's **Required** toggle.

**How each question is laid out.**

- **Title:** the question text, exactly as in the table.
- **Help text:** the label in bold, then a full stop, then the help text from the table. Example: **Fact needed before publishing.** Include a title such as Dr only if you're entitled to use it.
- **If there is no help text:** the help text is the bold label alone.
- **"Other" options:** switch on the option's "Other" setting so the client can type an answer.
- **Options with "(say why)", "(say which)", "(say where)" or "(text)":** add a Short answer block directly below. Title it "Please say more". Show it only when that option is selected.

---

## 2. Welcome screen (page 0)

Build this as the first page, before any question. It is message 3 from the source, followed by the boxed note and the "How this works" list. The list uses the form's four labels.

**Heading (H1):** Hello, and thank you.

**Text:**

> This isn't a test, and you don't need polished answers. Bullet points, rough notes and half-formed thoughts are all useful, and often more useful than finished sentences, because they sound like you.
>
> The more you share, the more accurately I can make the identity and website feel like you and your practice. You don't have to answer everything.
>
> The exception is the practical and professional facts: fees, qualifications, memberships, access and similar. These are marked **Fact needed before publishing**. I need them before anything is published, because I will never invent or assume them. If you don't know one yet, say so, and that counts as an answer.
>
> Everything else is an invitation. Answer what you can, skip what you can't, and use the last page for anything that doesn't fit anywhere else.

**Boxed note** (Callout block):

> **Please don't include anything about your clients.** I don't need, and don't want, names, initials, session content, or details that could identify a current or former client, even to themselves. Where I ask about the people you work with, please describe patterns, never individuals.

**Heading (H3):** How this works

**Bulleted list:**

- **Fact needed before publishing** marks the practical and professional facts. I need these before anything goes live. "I don't know yet" is an acceptable answer.
- **Core question** marks the seven questions that give me the most useful material. Please answer at least four, in writing or as a voice note.
- Everything marked **Optional context** or **Optional reference or upload** is an invitation to share more: context, ideas, references and files.
- It usually takes 60–90 minutes, over as many sittings as you like. Your answers save as you go, on the same device and browser.
- Rough notes are fine. Nothing needs to be polished.

**Additional line** (from the source's data housekeeping note; small text):

> Please don't share information about your own health unless you want it taken into account.

Then a **Page break**.

---

## 3. Hidden field: `ref`

1. At the very top of the form, type `/hidden` and insert a **Hidden fields** block.
2. Name the field exactly `ref` (lower case).
3. Nothing else is needed. Tally fills it from the address: `https://tally.so/r/FORMID?ref=AW-001`.

**How the reference arrives.** The website page `/client/intake/?ref=AW-001` checks the value against `AW-` followed by three or four digits. It then adds the value to the form address, both in the embed and on the "Open the form in a new tab" button. Any other value is dropped.

**What goes in the reference.** Never put a name, an email address or anything else personal in the reference or the link. The reference only matches a response to its invoice.

**Checking it.** In **Results**, the `ref` column shows the value for each submission.

---

## 4. The nine pages

Each page begins with an **H2 heading** (the page title below) and, where given, the intro. Required and core questions come first. On pages 3–5, the optional questions sit beneath a small heading, *If you'd like to add more*.


### Page 1: Your practice, the facts

**Page intro** (Text block under the heading, exactly):

> "These are published as facts, so I need them exactly. 'I don't know yet' is a perfectly good answer. I'll never fill a gap with a guess."

| Order | ID | Question, exactly as written | Help text (after the bold label) | Tally block | Required | Visible label | Logic | Purpose (internal, never shown) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | A1 | Your name as it should appear publicly | Include a title such as Dr only if you're entitled to use it. | Short answer | Yes | **Fact needed before publishing** | — | Wordmark and every page. |
| 2 | A2 | Email address for this project | — | Email | Yes | **Fact needed before publishing** | — | Correspondence and confirmation. |
| 3 | A3 | Should the practice appear under your name, or a practice name? | — | Multiple choice — options: My name / A practice name | Yes | **Fact needed before publishing** | "Practice name" shows A3a | Decides the wordmark and domain. |
| 4 | A3a | The practice name, exactly as it should appear | Capitals and punctuation matter. | Short answer | Yes | **Fact needed before publishing** | Shown if A3 = practice name | As above. |
| 5 | A4 | The professional title you use | For example counsellor, psychotherapist, counselling psychologist. Some titles are legally protected, so please use the one you're entitled to use. | Short answer | Yes | **Fact needed before publishing** | — | Descriptor line; legal accuracy. |
| 6 | A5 | Who do you work with? | — | Checkboxes — options: Adults individually / Couples / Families / Young people / Children / Groups / Other | Yes | **Fact needed before publishing** | Young people or Children shows A5a | Scope statement. |
| 7 | A5a | What age range do you work with? | — | Short answer | Yes | **Fact needed before publishing** | Shown as above | Safeguarding-accurate wording. |
| 8 | A6 | How do you work? | — | Checkboxes — options: In person / Online video / Telephone / Outdoors (walk and talk) / Other | Yes | **Fact needed before publishing** | Drives A7, A8, A17, I2 | Format facts. |
| 9 | A7 | Where? Give the area you're happy to publish. | For example "Didsbury, Manchester". | Short answer | Yes | **Fact needed before publishing** | Shown if In person or Outdoors | Location facts and descriptor. |
| 10 | A7a | Should your full address appear on the website? | — | Multiple choice — options: Yes / No, I'll give it after first contact / Not decided | Yes | **Fact needed before publishing** | As A7 | Privacy and safety. |
| 11 | A8 | Where can your online or phone clients be located? | — | Multiple choice — options: UK only / UK and elsewhere (say where) / Not sure | Yes | **Fact needed before publishing** | Shown if Online or Telephone | Avoids an inaccurate reach claim. |
| 12 | A9 | Your fees and session lengths | Every kind of session you offer, for example "Individual, £60, 50 minutes, weekly". Include any assessment fee. | Long answer | Yes | **Fact needed before publishing** | — | The most-copied facts in the pack. |
| 13 | A9a | Can your fees be published on the website? | — | Multiple choice — options: Yes / I'd prefer not (say why) | Yes | **Fact needed before publishing** | — | Decides the "fee always appears" rule. |
| 14 | A10 | Do you offer reduced fees or concessions? | — | Multiple choice — options: No / Yes / Yes, but don't publish | Yes | **Fact needed before publishing** | Yes shows A10a | Lower-fee fact. |
| 15 | A10a | Tell me how they work | How many places, for whom, any conditions. | Long answer | Yes | **Fact needed before publishing** | Shown if Yes | Exact wording for the site. |
| 16 | A11 | When do you usually see clients? | For example "Tuesday to Thursday, 9am to 7pm". Or write "don't publish". | Short answer | Yes | **Fact needed before publishing** | — | Hours fact. |
| 17 | A12 | How does someone start with you? | — | Multiple choice — options: Free initial call / Free initial session / Paid initial session / Straight into a first session / Other | Yes | **Fact needed before publishing** | Always shows A12a | First-contact fact; lowers the biggest barrier. |
| 18 | A12a | The details | Length, format and any fee. For example "20 minutes, by phone". | Short answer | Yes | **Fact needed before publishing** | — | As above. |
| 19 | A13 | How and when do clients pay? | For example "Bank transfer after each session". | Short answer | Yes | **Fact needed before publishing** | — | Payment fact. |
| 20 | A14 | What is your cancellation policy? | Notice period and any charge. If you don't have one yet, say so. I won't write one for you, but it needs deciding before launch. | Long answer | Yes | **Fact needed before publishing** | — | Never invented. |
| 21 | A15 | How quickly do you usually reply to enquiries? | For example "within two working days". | Short answer | Yes | **Fact needed before publishing** | — | Reply-time fact. |
| 22 | A16 | Are you taking new clients at the moment? | I'll check this again just before launch. | Multiple choice — options: Yes / Waiting list / Opening on (date) / It varies | Yes | **Fact needed before publishing** | — | Sets the contact wording. |
| 23 | A17 | Access to where you work | Step-free entrance? Stairs or lift? Accessible toilet? Parking, public transport, a waiting area? Describe only what you've checked. I'll publish exactly what you confirm. | Long answer<br>Checkbox — "I need to check, I'll confirm later" | Yes, as one of two (see the note below the table) | **Fact needed before publishing** | Shown if In person | The claim most often wrong on therapy sites. |
| 24 | A18 | What length of work do you offer? | — | Checkboxes — options: Short-term (set number) / Open-ended / Other | Yes | **Fact needed before publishing** | — | Sets expectations. |
| 25 | A19 | Which languages do you offer therapy in? | — | Short answer — default "English" | Yes | **Fact needed before publishing** | — | Language fact. |

**Logic on page 1.** In Tally, type `/conditional logic` above the question to insert a *Conditional logic* block. Then set "When … then show block …".

- A3 = "A practice name" → show A3a.
- A5 includes "Young people" **or** "Children" → show A5a.
- A6 includes "In person" **or** "Outdoors (walk and talk)" → show A7 and A7a.
- A6 includes "Online video" **or** "Telephone" → show A8.
- A6 includes "In person" → show A17 (on this page) and I2 (on page 7).
- A10 = "Yes" → show A10a.
- A12: always show A12a.
- **A17 needs one of two answers.** The source makes A17 required, with a checkbox, "I need to check, I'll confirm later", as an alternative to the written answer. Tally's Required toggle cannot say "one of these two", so:
  - set both blocks to **not required**;
  - add a Conditional logic block: when the A17 Long answer is empty **and** the checkbox is unticked, show a short Text block in bold: "Please describe access, or tick 'I need to check'".
  - You still check this yourself when you read the intake, because it is a fact needed before publishing.

### Page 2: Qualifications and professional details

**Page intro** (Text block under the heading, exactly):

> "Everything here may be published. Please write it exactly as it appears on your certificate or membership record. I won't add to it, round it up or reword it."

| Order | ID | Question, exactly as written | Help text (after the bold label) | Tally block | Required | Visible label | Logic | Purpose (internal, never shown) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | B1 | Qualifications you'd like listed | Full title, awarding body or college, and the year if you want it shown. | Long answer | Yes | **Fact needed before publishing** | — | Credential claims in your own words. |
| 2 | B2 | Professional body membership and registration | Body, membership level and number. Write "none" if that's the case. | Long answer | Yes | **Fact needed before publishing** | — | Registration is the claim clients check. |
| 3 | B2a | Should your membership number appear on the website? | — | Multiple choice — options: Yes / No | Yes | **Fact needed before publishing** | Hidden if B2 = "none" | Publishing consent. |
| 4 | B3 | Further training you'd like mentioned | Say what's complete and what's in progress. | Long answer | No | **Optional context** | — | Keeps in-progress training from being published as complete. |
| 5 | B4 | Approaches you're trained in | Only approaches you've trained in. If you'd describe yourself as integrative or pluralistic, say what you draw on. | Long answer | Yes | **Fact needed before publishing** | — | The practitioner card, with nothing assumed. |
| 6 | B5 | Anything else you'd like stated? | Tick only what's true and current. | Checkboxes — options: Regular clinical supervision / Professional indemnity insurance / Enhanced DBS check / Registered with the ICO / Work within a named ethical framework (say which) / Other | No | **Optional context** | — | Optional trust facts, each confirmed by the client. |
| 7 | B6 | Any page that shows your professional details | For example a directory profile or membership page. Please don't send certificates, as I don't need them. | File upload (multiple)<br>Link (URL) | No | **Optional reference or upload** | — | Cross-checks spelling and wording. |

**Logic on page 2:** B2 contains "none" → hide B2a. In Tally, use the condition *B2 does not contain "none"* → show B2a.

### Page 3: How you work, and what you don't do

**Page intro** (Text block under the heading, exactly):

> "From here on, answer in whatever way is easiest. Notes and half-thoughts are useful. ★ marks the questions that help me most. Prefer to talk? There's a voice-note upload at the bottom of the page."

| Order | ID | Question, exactly as written | Help text (after the bold label) | Tally block | Required | Visible label | Logic | Purpose (internal, never shown) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | C1 | Imagine explaining what you actually do with someone to a friend who isn't a therapist. What would you say? | What happens, what you pay attention to, what you do when someone gets stuck. Everyday words work best. | Long answer | No | **Core question** | — | Source for "what the practice does" and the position line. |
| 2 | C3 | What do you believe about therapy that shapes how you work? Something you'd stand by if a colleague disagreed. | It might be about change, about the relationship, or about what people should or shouldn't need before they start. | Long answer | No | **Core question** | — | The belief statement. This is what separates the practice from the category. |
| 3 | D1 | Is there anything you don't work with, or would usually refer on? | For example "active addiction" or "people in immediate crisis". Write "nothing specific" if that's true. | Long answer | Yes | **Fact needed before publishing** | — | A hard boundary on claims. |
| 4 | D1a | Can this be mentioned on the website? | — | Multiple choice — options: Yes / No, keep it private / Some of it (say which) | Yes | **Fact needed before publishing** | Hidden if D1 = "nothing specific" | Publishing consent. |
| 5 | D2 | What do people sometimes expect from a therapist that you don't do? | Give advice, set homework, diagnose, take notes in the room, stay silent, work to a fixed programme… | Long answer | No | **Core question** | — | Source for "what it does not do", which is often the most distinctive line. |
| 6 | D3 | Are there claims you'd never want your website to make? | Whatever you tick, the site will never promise outcomes, use invented testimonials, or name qualifications, bodies or specialisms you haven't confirmed. | Checkboxes — options: That therapy will fix or cure something / A specialism I haven't trained in / "Evidence-based" as a selling point / That I offer crisis or emergency support / Testimonials or reviews / Numbers (years, clients seen) / "Safe space" promises / None of these / Other | Yes | **Fact needed before publishing** | — | The "will not claim" list, agreed before writing starts. |
| — | — | **Divider.** Add a small heading block: *If you'd like to add more* | | Heading 3 (or Divider + Text) | | | | Everything below is optional. |
| 7 | C2 | What is a first session with you like, in practical terms? | How it starts, what you do or don't ask, how it ends, what you say about next steps. | Long answer | No | **Optional context** | — | Answers the biggest fear before contact, concretely. |
| 8 | C4 | What do clients notice about you that they might not expect from a therapist? | Something clients have said in general terms, or that a supervisor or colleague has said. | Long answer | No | **Optional context** | — | Character shown through behaviour rather than adjectives. |
| 9 | D4 | How would you like urgent help to be signposted? | Every therapy website should say it isn't an emergency service and where to go instead. | Multiple choice — options: Please write a standard line / I have wording I use (text) / Let's discuss | No | **Optional context** | — | A line every site needs; its wording is then verified. |
| 10 | V3 | Prefer to talk? Upload a voice note or short video for any question on this page. | Say the question number before each answer. A phone voice memo is perfect. | File upload (audio or video, multiple) | No | **Optional reference or upload** | — | Natural language from people who think out loud. |

**Logic on page 3:** D1 contains "nothing specific" → hide D1a. In Tally, use *D1 does not contain "nothing specific"* → show D1a. V3 accepts audio and video, multiple files.

### Page 4: The people who contact you

**Boxed note at the top** (Callout or a Text block in a coloured box, exactly):

> "Please describe patterns, never individuals. No names, initials, workplaces, distinctive events, or combinations of details that could identify a current or former client, even to themselves. Paraphrase and combine. If in doubt, leave it out."

| Order | ID | Question, exactly as written | Help text (after the bold label) | Tally block | Required | Visible label | Logic | Purpose (internal, never shown) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | E1 | Who tends to contact you? Describe the people and their circumstances rather than diagnoses. | Life stage, what's going on around them, what has usually led up to the moment they get in touch. | Long answer | No | **Core question** | — | "The people" card. |
| 2 | E2 | What kinds of things do people say when they first get in touch? General, paraphrased phrases are perfect. | For example "I don't know if this is serious enough" or "everyone thinks I'm fine". The words people actually use are some of the most useful material you can give me. | Long answer | No | **Core question** | — | The central concern, the vocabulary, and a demonstrated phrase. |
| 3 | E3 | What makes people hesitate before contacting a therapist like you? | Cost, time, not knowing what to say, a bad past experience, worrying it's self-indulgent… | Long answer | No | **Core question** | — | The order of "things to say"; the feeling to create. |
| — | — | **Divider.** Add a small heading block: *If you'd like to add more* | | Heading 3 (or Divider + Text) | | | | Everything below is optional. |
| 4 | E4 | Is there a common thread running through the people you work best with? | Only if one comes to mind. It doesn't need to be a niche. | Long answer | No | **Optional context** | — | Tests the central concern. |
| 5 | E5 | Who is probably not a good fit for you? Not clinically, but in terms of what they're looking for. | For example someone who wants a structured programme, or wants to be told what to do. | Long answer | No | **Optional context** | — | Helps the site let the wrong person self-select out. |
| 6 | E6 | Is there anyone you'd like to see more of? | — | Short answer | No | **Optional context** | — | Direction, only when it is true. |
| 7 | E7 | When your website is working well, what do you hope someone thinks or feels in the first ten seconds? | — | Long answer | No | **Optional context** | — | The feeling to create. |
| 8 | E8 | I've kept every example on this page general and non-identifying. | — | Checkbox | Yes | **Fact needed before publishing** | Shown once any E field has an answer | A deliberate pause before the most sensitive page is submitted. |
| 9 | V4 | Prefer to talk? Voice note or short video. | Same rule: patterns, never individuals. | File upload (audio or video) | No | **Optional reference or upload** | — | As V3. |

**Logic on page 4:** show E8 when any of E1–E7 **is not empty** (one condition per field, joined with *or*). When shown, E8 is required.

### Page 5: You, and your words

No page intro. Use the page title as the only heading.

| Order | ID | Question, exactly as written | Help text (after the bold label) | Tally block | Required | Visible label | Logic | Purpose (internal, never shown) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | F3 | How do you come across? Give three words people who know you well would use, and, if you can, something a colleague, supervisor or tutor has actually said about how you work. | — | Long answer | No | **Core question** | — | The character line, taken from other people's words rather than self-praise. |
| 2 | F4 | How much of yourself should the website show? | — | Multiple choice — options: Professional only / A little: a sense of who I am, no personal details / Quite open: personal background is welcome where it's relevant | Yes | **Fact needed before publishing** | — | Sets the limit for all personal material. |
| — | — | **Divider.** Add a small heading block: *If you'd like to add more* | | Heading 3 (or Divider + Text) | | | | Everything below is optional. |
| 3 | F1 | What brought you to this work? | Share only what you'd be comfortable seeing on your website. I'll check anything personal with you before using it. | Long answer | No | **Optional context** | — | Depth for a longer description, when the client wants it. |
| 4 | F2 | Is there previous work or life experience that shapes how you practise, and that you're happy to mention? | — | Long answer | No | **Optional context** | — | Credibility and specificity without inventing any. |
| 5 | F5 | Is there anything personal that must never appear? | — | Long answer | No | **Optional context** | — | A boundary. |
| 6 | G1 | Are there phrases you find yourself saying, to clients or when you describe your work? | — | Long answer | No | **Optional context** | — | Words that belong to the practice. |
| 7 | G2 | Please share any existing writing that sounds like you. | Website copy, directory profiles, bios, leaflets, business cards, posts, and replies you've sent to enquirers (with anything identifying removed). Drafts are welcome. | File upload (multiple)<br>Long answer (for links or pasted text) | No | **Optional reference or upload** | — | The best evidence of natural voice. |
| 8 | G3 | Of what you've shared, what sounds most like you, and what doesn't? | — | Long answer | No | **Optional context** | — | Tells you which material to trust. |
| 9 | G4 | Are there words or phrases you'd rather never see on your website? | Tick any that make you wince, and add your own. | Checkboxes — options: journey / safe space / holding space / heal / transform / empower / unlock / reach out / take the first step / you are not alone / you deserve / non-judgemental / warm and friendly / struggling with / suffering from / book now / Other | No | **Optional context** | — | Words to avoid, in their own reactions. |
| 10 | G5 | Anything about tone you feel strongly about? | Formal or informal, humour, first names, anything. | Long answer | No | **Optional context** | — | Catches strong views early. The voice itself is your call. |
| 11 | V5 | Prefer to talk? Voice note or short video. | — | File upload (audio or video) | No | **Optional reference or upload** | — | As V3. |

### Page 6: How your practice could look

**Page intro** (Text block under the heading, exactly):

> "You don't need to arrive with design ideas. If you have some, this is the place for them, and they don't need to be developed or technically correct. Your answers set the boundaries, and turning them into a coherent identity is my job. You'll see and approve the direction before I build anything."

| Order | ID | Question, exactly as written | Help text (after the bold label) | Tally block | Required | Visible label | Logic | Purpose (internal, never shown) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1 | Do you have an existing logo, colours or fonts? | — | Multiple choice — options: No / Yes, and they must stay / Yes, but I'm open to change / Yes, and I'd like them replaced | Yes | **Fact needed before publishing** | Any "Yes" shows H1a | Retained assets are a hard constraint. |
| 2 | H1a | Please upload them | SVG, PDF, AI or EPS if you have them. PNG is fine. | File upload (multiple) | Yes | **Fact needed before publishing** | Shown as above | You need the source files. |
| 3 | H2 | Do you already have any ideas about how your practice could look? | Tell me anything you've imagined about colours, fonts, logos, symbols, photography or general atmosphere. These ideas don't have to be developed or technically correct. Please also say which ideas matter to you and which are just possibilities you'd like me to consider. | Long answer<br>File upload (sketches, moodboards, screenshots)<br>Link (URL) | No | **Optional reference or upload** | — | Every idea surfaced before design, not after. |
| 4 | H3 | Colours: any you like, dislike, or already connect with your practice? Any combinations you've imagined? | — | Long answer | No | **Optional reference or upload** | — | Boundaries for the palette. |
| 5 | H4 | Lettering: how do you feel about these styles? | Rows: Classic serif (like a printed book) / Clean, modern sans-serif / Handwritten or calligraphic / Traditional and formal / Contemporary and editorial / Minimal and quiet / Expressive, with character. | Matrix — rows as listed in the help text; columns: Drawn to / Neutral / Not for me (or one Multiple choice question per row if the Matrix block is unavailable) | No | **Optional reference or upload** | — | Type direction without asking them to pick fonts. |
| 6 | H4a | Any particular fonts you like or dislike? | — | Short answer | No | **Optional reference or upload** | — | Catches strong views. |
| 7 | H5 | What kind of logo appeals? | — | Multiple choice — options: My name, well set (a wordmark) / My name with a small symbol / A distinctive symbol / Not sure, please decide | No | **Optional reference or upload** | — | Sets the scope of the mark. |
| 8 | H5a | Any symbols, shapes, initials or images you've considered, or definitely don't want? | — | Long answer<br>File upload | No | **Optional reference or upload** | — | Wanted and ruled-out imagery. |
| 9 | H6 | Up to three things you respond to visually, and what you like about each | Websites, brands, books, packaging, interiors, places, anything. What you like about each matters more than the example itself. | Repeat this pair three times: Short answer (link or description) and Long answer, titled "What specifically do you like about it?"<br>File upload (screenshots) | No | **Optional reference or upload** | — | Specific references with reasons, not a generic mood. |
| 10 | H7 | Are there common therapy-website looks you'd like to avoid? | — | Checkboxes — options: Pebbles and stones / Lotus flowers / Trees, leaves or roots / Hands / Sunrises or horizons / Butterflies / Jigsaw pieces / Head silhouettes / Sage green and beige throughout / Watercolour washes / Stock photos of sofas or tissues / Other | No | **Optional reference or upload** | — | Rules out the category's defaults. |
| 11 | H8 | Is there anything visual that would make you immediately feel the design was wrong for you? | — | Long answer | No | **Optional reference or upload** | — | The single best revision-preventer. |
| 12 | H9 | Is there any personal, cultural, religious or professional meaning a design needs to respect? | For example a colour with a particular meaning in your community, or a symbol with associations you'd want to avoid. | Long answer | No | **Optional reference or upload** | — | Avoids unintended meaning. |
| 13 | H10 | How firm are your views? | Anything you mark as a firm requirement, I'll treat as fixed. Everything else is a steer. | Matrix, rows: Colours / Lettering / Logo / Photography / Overall atmosphere. Columns: Firm requirement / Strong preference / Open idea / Please decide for me / No view | No | **Optional reference or upload** | — | Separates requirements from possibilities (dislikes are covered in H7 and H8). |

**Logic on page 6:** H1 is any of the three "Yes…" options → show H1a, which is then required. H1a accepts SVG, PDF, AI, EPS and PNG.

### Page 7: Photography

**Page intro** (Text block under the heading, exactly):

> "Photographs matter more than almost anything else on your website, because they let someone see who they'd be meeting and where. The minimum is a natural photograph of you, with several usable variations (at least one looking towards the camera), and a photo of the room if you see people in person. Natural means relaxed and easy to read, not a formal headshot, and not a snapshot caught by accident. If you don't have these yet, the brief in your welcome email explains how to get them, and it's worth starting now."

| Order | ID | Question, exactly as written | Help text (after the bold label) | Tally block | Required | Visible label | Logic | Purpose (internal, never shown) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | I1 | Do you have recent, good-quality photographs of yourself? | — | Multiple choice — options: Yes / Some, not sure they're suitable / No | Yes | **Fact needed before publishing** | — | Triggers the photo brief. |
| 2 | I2 | Do you have photographs of your therapy room or where you work? | — | Multiple choice — options: Yes / No, but I can take some / No, I use a shared or rented room / I'd rather not show it (say why) | Yes | **Fact needed before publishing** | Shown if A6 includes In person | The room photo. |
| 3 | I3 | Upload your photographs | Originals from your camera or phone are best, so please don't compress them. For very large files, add a shared-folder link. | File upload (multiple, images)<br>Link (URL) | No | **Optional reference or upload** | Shown if I1 or I2 = Yes or Some | Assets in context. |
| 4 | I4 | If your current photos aren't suitable, would you arrange new ones? | — | Multiple choice — options: Yes, with a friend / Yes, with a photographer / I'd prefer not to, let's discuss | Yes | **Fact needed before publishing** | — | Commits them to the photo route early. |
| 5 | I5 | How comfortable are you being visible on your website? | 1 = I'd rather not be pictured, 5 = entirely comfortable | Linear scale, 1–5 | Yes | **Fact needed before publishing** | — | Sets the photography direction's limits. |
| 6 | I6 | Your website needs at least one photo of you looking towards the camera. Beyond that, would you like others looking away, or a mixture? | — | Multiple choice — options: Mostly towards / Some looking away / A mixture / No preference | No | **Optional reference or upload** | — | Direction. |
| 7 | I7 | Where, or doing what, do you feel most like yourself? | — | Long answer | No | **Optional reference or upload** | — | Setting for a candid portrait. |
| 8 | I8 | Is there anything about how you're photographed that makes you uncomfortable? | — | Long answer | No | **Optional reference or upload** | — | Boundaries. |
| 9 | I9 | Are there privacy, safety or location reasons to limit what photos show? | For example you work from home, or you don't want the building to be identifiable. | Multiple choice — options: No / Yes (shows a text field for details) | Yes | **Fact needed before publishing** | — | Safeguarding. |
| 10 | I10 | I own these photographs or have permission to use them online, and anyone identifiable in them has agreed. | — | Checkbox | Yes | **Fact needed before publishing** | Shown if I3 has files | Rights confirmation. |

**Logic on page 7:**

- A6 includes "In person" → show I2.
- I1 = "Yes" or "Some, not sure they're suitable", **or** I2 = "Yes" → show I3.
- I9 = "Yes" → show a Long answer block titled "Please give details", which is required when shown.
- I3 has one or more files → show I10, which is then required. In Tally, use *I3 is not empty*.

I3 accepts images, several at once. On the free plan each file is limited to 10 MB. On Pro there is no size limit, which is why the source says to upgrade at the first deposit.

### Page 8: The website and technical details

No page intro. Use the page title as the only heading.

| Order | ID | Question, exactly as written | Help text (after the bold label) | Tally block | Required | Visible label | Logic | Purpose (internal, never shown) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | J1 | What does someone need to be able to find, understand or do on your website? | For example "see my fees, understand how online sessions work, get in touch". You don't need to plan the page, as that's my job. | Long answer | Yes | **Fact needed before publishing** | — | Purpose, without asking them to design structure. |
| 2 | J2 | How should people contact you? | — | Checkboxes — options: Enquiry form / Email / Phone / Text message | Yes | **Fact needed before publishing** | Email, Phone or Text shows J2a | Contact functionality. |
| 3 | J2a | Email address and/or phone number exactly as they should appear | — | Short answer | Yes | **Fact needed before publishing** | As above | A published fact. |
| 4 | J3 | Where should enquiry-form messages be sent? | — | Email | Yes | **Fact needed before publishing** | Shown if Enquiry form | Form routing. |
| 5 | J4 | Do you have a domain name? | — | Multiple choice — options: Yes, and I can log in / Yes, but I'm not sure I can access the account / No, please help me register one in my name | Yes | **Fact needed before publishing** | Yes shows J4a; No shows J4b | Launch dependency. |
| 6 | J4a | Your domain and who it's registered with | For example yourname.co.uk, registered with \[company\]. | Short answer | Yes | **Fact needed before publishing** | — | Access planning. |
| 7 | J4b | Any domain names you'd like? | — | Short answer | No | **Optional context** | — | Registration. |
| 8 | J5 | Do you have a current website? | — | Multiple choice — options: Yes / No | Yes | **Fact needed before publishing** | Yes shows J5a and J5b | Migration and redirects. |
| 9 | J5a | Its address | — | Link (URL) | Yes | **Fact needed before publishing** | — | Existing copy source. |
| 10 | J5b | What should happen to it? | — | Multiple choice — options: Replace it at the same address / Keep it for now / Not sure | Yes | **Fact needed before publishing** | — | Launch plan. |
| 11 | J6 | Email on your own domain (for example hello@yourname.co.uk)? | Setting this up isn't included, but I'll point you to simple options. | Multiple choice — options: Already have it / I'd like it / Not needed | No | **Optional context** | — | Flags the dependency early. |
| 12 | J7 | Directory profiles to link to | Links to any profiles you keep. | Long answer | No | **Optional context** | — | Where the 40-word description goes. |
| 13 | J8 | Anything you might want later? | Not included now. This helps me build so these are easy to add. | Checkboxes — options: More pages / Online booking / Articles / Business cards or leaflets / Social media graphics / Email signature / Help keeping the site updated / Other | No | **Optional context** | — | Future development and quotable extras. |
| 14 | J9 | Do you already have a privacy notice for your practice? | The enquiry form collects personal information, so the website needs a privacy notice. | Multiple choice — options: Yes (upload or link) / No / Not sure | Yes | **Fact needed before publishing** | Yes shows an upload/URL field | A launch requirement, raised early. |
| 15 | J10 | Anything the people who visit your site might need for accessibility? | The site includes a reading control for text size, spacing and a calmer view as standard. | Long answer | No | **Optional context** | — | Audience-specific accessibility. |

**Logic on page 8:**

- J2 includes "Email", "Phone" or "Text message" → show J2a.
- J2 includes "Enquiry form" → show J3.
- J4 = either "Yes…" option → show J4a.
- J4 = "No, please help me register one in my name" → show J4b.
- J5 = "Yes" → show J5a and J5b.
- J9 = "Yes (upload or link)" → show a File upload block and a Link block. Title them "Your privacy notice" and "Or a link to it". Neither is required.

### Page 9: Nearly done

No page intro. Use the page title as the only heading.

| Order | ID | Question, exactly as written | Help text (after the bold label) | Tally block | Required | Visible label | Logic | Purpose (internal, never shown) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K1 | Is there anything that would help you during this project? | For example written communication only, longer reply times, or dates you're away. | Long answer | No | **Optional context** | — | Your own accessibility commitment. |
| 2 | K2 | Are there any dates I should know about? | — | Short answer | No | **Optional context** | — | Scheduling. |
| 3 | K3 | Anything else, at all | Notes, half-thoughts, things you nearly wrote earlier, material that feels like you. Nothing is too small or too messy. | Long answer<br>File upload (multiple, any type) | No | **Optional context** | — | The unrestricted dump, which often holds the best line. |
| 4 | K4 | Before you submit | All four are needed. | Checkboxes — options: (1) The practical and professional facts I've given are accurate and current. (2) Nothing I've shared identifies a current or former client. (3) I own, or have permission to use, the words, images and files I've supplied. (4) I understand nothing is published until I've confirmed the facts table. | Yes | **Fact needed before publishing** | — | Accountability for facts, confidentiality and rights, in writing. |

**K4** is one Checkboxes block with the four statements as options. Set it to required, with a **minimum of 4 selections** in the block's settings. If that setting isn't available, use four separate required Checkbox blocks with the same four sentences.

---

## 5. Completion screen and confirmation email

**Completion screen:** after the last page, type `/thank you page` to insert a Thank you page. Enter message 4 exactly:

> **Thank you. That's everything I need to begin.**
>
> I'll read it all within two working days. If anything is unclear, you'll get one short message with questions. Otherwise I'll simply start, and your Practice Fundamentals will arrive about a week after that.
>
> If something occurs to you later, reply to your confirmation email. Anything you add before I start writing is useful.

**Respondent confirmation email** (Pro): Settings → **Email notifications** → **Respondent email** → on.

- **Send to:** the answer to A2.
- **Subject:** "Your intake form has arrived".
- **Body:** the same text as the completion screen.
- **Reply-to:** hello@alexanderwatson.co.uk.
- **Answers:** my recommendation is not to include a copy of the answers. Some of them are the client's private reflections, and email is the least private place for them.

**Your notification:** Settings → **Email notifications** → **Self email** → on, sent to hello@alexanderwatson.co.uk.

---

## 6. Settings

| Setting | Where in Tally | Value |
| --- | --- | --- |
| Save answers for later | Settings → Behaviour | **On.** This saves progress in the respondent's browser only, so the welcome email says "finish on the same device and browser". |
| Partial submissions | Settings → Behaviour (Pro) | **On**, so you can see that someone has started without chasing them. |
| Progress bar | Settings → Layout | **On.** Each page has one heading and a one-line intro. |
| Hidden field | Top of the form | `ref` (section 3). |
| Self email notification | Settings → Email notifications | On. |
| Respondent email | Settings → Email notifications (Pro) | On (section 5). |
| File uploads | Each File upload block | Voice notes: audio and video types allowed. Photos: images. K3: any type. |
| Tally branding | Settings (Pro) | Off. |
| Custom domain | Workspace settings → Domains (Pro) | Optional: `intake.alexanderwatson.co.uk`. If you use it, the website page shows the button only, because the embed address is derived from `tally.so/r/` links (see `_data/intake.yml`). |
| Close form / limit responses | Settings | Off. |
| Language | Settings | English. |
| Data retention | Your own process | Download each response and its files to the client's project folder, then delete it from Tally at launch. The privacy notice states the period; see `_data/legal.yml` → `data_protection.intake_retention`. |

**Voice notes.** V3, V4 and V5 are one audio/video File upload each, at the end of pages 3, 4 and 5. Their help text asks the client to say the question number first.

---

## 7. Connect the form to the website

1. **Publish** the form (top-right button).
2. Click **Share** and copy the **Share link**. It looks like `https://tally.so/r/` followed by a short code.
3. Open `_data/intake.yml` and paste the link between the quotes of `tally_url`:

   ```yaml
   tally_url: "https://tally.so/r/PASTE-CODE-HERE"
   ```

4. Rebuild the site. `/client/intake/` now embeds the form and shows "Open the form in a new tab".
5. The link you send each client is `https://alexanderwatson.co.uk/client/intake/?ref=AW-001`, with their own reference.

---

## 8. Testing checklist

Do all of these before the first client receives the link. Use a phone and a laptop.

- [ ] Open `/client/intake/?ref=AW-999` on the local or preview site. The page shows "Your project reference is AW-999" and the form loads inside the page.
- [ ] "Open the form in a new tab" opens the same form, and its address ends in `?ref=AW-999`.
- [ ] Open `/client/intake/?ref=Jane%20Smith`. No reference is shown, and neither form address carries it.
- [ ] Empty `tally_url` and rebuild. The page shows "The form isn't connected to this page yet" and no frame. Then restore the link.
- [ ] Try every conditional branch on pages 1, 2, 3, 4, 6, 7 and 8, and confirm that hidden questions stay hidden when their condition is not met.
- [ ] Confirm that every **Fact needed before publishing** field blocks submission when empty and when shown, and that no **Core question** or **Optional** field does.
- [ ] Upload an 8 MB photograph to I3, and a phone voice memo to V3.
- [ ] Close the browser halfway through page 5, reopen the link on the same device and browser, and check the answers are still there.
- [ ] Submit. Check that the completion screen shows message 4, that your notification arrives, and that the respondent email arrives at the A2 address (Pro).
- [ ] In Results, check the `ref` column shows AW-999 and the files open.
- [ ] Read every page as a client would, and check that nothing mentions how many questions there are.
- [ ] Check keyboard use in the embedded form: Tab reaches every field, and the focus is visible.
- [ ] Delete the test submission from Tally.

---

## 9. After the first three clients

From the source: after three projects, merge or drop any optional question that produced nothing usable in all three. Record which questions produced material you used. Update the source document first, then this file, then the form.
