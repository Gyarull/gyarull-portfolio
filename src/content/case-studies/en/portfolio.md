---
title: 'This site: impact with purpose, without losing performance'
summary: 'How I built this portfolio with Analog (Angular) and Claude Code: a custom design system, Markdown content validated on every build, and animations that cost the site no performance.'
date: '2026-11-06'
---

## The problem

I wanted a site that showed three things without having to say them: that I work well with AI tools, that I solve problems fast even in new technologies, and that I have visual judgment.

The constraints were concrete:

- **Static site:** no backend.
- **Bilingual:** Spanish and English.
- **Lighthouse 90 or higher** in every category.
- **Accessible:** usable with a keyboard, AA contrast, and respectful of people who prefer less motion.
- **Easy to maintain:** adding a project has to mean adding a text file, without touching components.

## Starting point

I had used Angular at my previous job (2019–2021), so the framework wasn't new. Analog, its meta-framework with file-based routes and prerendering, was. The original brief also mixed in ideas meant for a different stack (Astro and Tailwind). The first task was to spot that contradiction and choose on solid ground: Analog keeps Angular as the lead and solves Markdown content and static generation.

## Architecture and decisions

- **Everything is prerendered.** Each page is built as static HTML and published on Cloudflare Pages. Content reads without JavaScript; Angular hydrates afterwards for the interactive parts.
- **Validated content.** Projects and case studies are Markdown files with frontmatter; profile, stack and journey are JSON. Before every build, a Zod validator checks:
  - that every field has the right type and there are no extra fields;
  - that every file exists in both languages;
  - that references between projects and case studies point to something real;
  - that no phone number has slipped in.

  If anything fails, the build stops.

- **Languages by URL.** Spanish lives at the root and English under `/en`. Interface strings are typed dictionaries: if a key is missing in one language, TypeScript won't compile.
- **A custom design system.** Tokens cover semantic color, a fluid type scale, spacing, radii and durations. I compared two proposals on an internal page that measures contrast live and chose _Partitura_: warm paper and graphite, Newsreader headings and a petrol accent. From Bootstrap I use only reboot, the grid and a few utilities (about 9 KB gzipped), wired to the tokens.
- **One signature element, not ten.** I weighed three options:
  1. A visualizer in the hero.
  2. A small demo with audio in the case study.
  3. A launch button with its own style.

  I chose the button: a five-bar equalizer that "breathes" calmly and ramps up in intensity on hover or focus. It's pure CSS animated on the GPU, and any project with a demo shows it; it isn't tied to one in particular.

- **Motion as an island.** Scroll animations use Motion, but it loads separately, only in the browser and only if the user hasn't asked for less motion. Re-exporting just the three functions I use cut it from 61 KB to 7 KB gzipped.

## How I worked with Claude Code

I started in plan mode: questions first, then a plan in small, verifiable phases, and only then code. From the first phase the repo had two files:

- a `CLAUDE.md` with the rules you can't infer from the code (for example, "content is never hardcoded" or "the phone number is never published");
- a `docs/CRITERIA.md` with the quality criteria as a checklist.

Every phase closed the same way: build, lint and tests with no warnings, a check in the browser (mobile and desktop screenshots, light and dark theme, a keyboard pass) and a commit. Decisions that called for taste or judgment were mine: the framework, how to handle languages, the signature element, the palette. When something in the plan didn't work, we stopped and discussed it instead of improvising a big change.

## Hard problems

**Ghost routes.** Analog also turns every `.md` in the content folder into a route. With the initial structure (`content/en/case-studies/…`), that automatic route overrode the real URL of the English case study and showed a different page. Ordering the folders by collection and then language means those routes never match the site's own.

**Animating without hiding content.** Entrance animations are a performance and accessibility risk: if the heading starts invisible, the largest contentful paint (LCP) is delayed, and if JavaScript fails, the text never shows up. The reveal directive only acts on what's off screen and applies the hidden state from JavaScript, so the prerendered HTML hides nothing.

**Browser code on the server.** During prerendering, the "after render" hooks also ran on the server and tried to measure elements that don't exist there. The fix was checking the platform before touching the DOM or loading Motion.

**A theme without a flash.** If the chosen theme were applied only once Angular loaded, the page would flash in the wrong theme. A tiny script in the `<head>` applies it before the first paint, and the button icon is chosen in CSS, without depending on JavaScript.

## Result and timeline

- **Time:** from the first question to the complete site, with content, animations and case studies, about two days (November 5 and 6, 2026). [TODO: complete with the deploy]
- **Weight:** global CSS of about 12 KB gzipped; Motion at 7 KB, loaded later.
- **Lighthouse:** [TODO: mobile and desktop results, in the performance phase]

## What I'd do differently

- **Check the brief against the stack before writing it.** Mixing Astro concepts into an Angular project cost a round of clarifications.
- **Move files with git, never by hand.** A reorganization lost files that weren't versioned yet, and they had to be recreated.
- **Watch JavaScript weight from the first phase.** The Markdown renderer ended up in the initial bundle and was left to optimize at the end.
