This version is what I would actually use for an AI coding agent. I've adjusted it for your real requirements:

* Only 4 tabs: Profile, Projects, Blog, Contact
* Static HTML/CSS/JS
* GitHub Pages deployment
* Blog driven by Markdown files
* Easy content editing without touching code
* No overengineered backend concepts
* Windows Terminal experience instead of a terminal-themed website

# Project: Windows Terminal Portfolio Website

Build a personal portfolio website that faithfully recreates the experience of using Windows Terminal on Windows 11.

The website should not feel like a traditional portfolio.

The user should feel as though they have opened a Windows Terminal window and are navigating through different terminal sessions containing my professional information.

The website must be lightweight, easy to maintain, and deployable directly to GitHub Pages.

---

# Core Requirements

Technology Stack:

* HTML5
* CSS3
* Vanilla JavaScript
* No frameworks
* No backend
* No build process
* No package managers
* GitHub Pages compatible

The final website should work by simply uploading files to a GitHub repository and enabling GitHub Pages.

---

# Design Goal

This is not a website styled like a terminal.

This is a browser-based recreation of Windows Terminal.

Every visual element should feel authentic to Windows Terminal running on Windows 11.

The experience should be immersive, clean, and professional.

The visitor should immediately think:

"Someone turned their resume into a Windows Terminal application."

---

# Visual Design

Background:

* Windows 11 wallpaper
* Full screen
* Cover mode

Main Window:

* Centered
* Floating appearance
* Rounded corners
* Modern shadow
* Windows Terminal aesthetic

Window Dimensions:

Desktop:

* Width: approximately 1400px
* Height: approximately 1040px

Responsive:

* Max width: 90vw
* Max height: 90vh

Window Styling:

* Background: #000000
* Border radius: 12px
* Overflow: hidden

---

# Title Bar

Height:

48px

Background:

#2C2C2C

Font:

Segoe UI

Structure:

[ Profile ] [ Projects ] [ Blog ] [ Contact ]

Windows controls on the right:

* Minimize
* Maximize
* Close

The tabs should visually resemble actual Windows Terminal tabs.

Active tab should merge into terminal content area.

Inactive tabs should have a darker background.

---

# Typography

Terminal Content:

Font:

Cascadia Mono

Fallback:

Consolas, monospace

Size:

18px

Color:

#F2F2F2

Line Height:

1.45

UI Elements:

Segoe UI

---

# Terminal Philosophy

All content must appear as terminal output.

Avoid:

* Cards
* Dashboards
* Modern portfolio layouts
* Large hero sections

Everything should be displayed as commands and command results.

The visitor should feel like terminal commands are being executed.

---

# Startup Sequence

On first page load display:

Microsoft Windows [Version 11.0]

Copyright (c) Microsoft Corporation.

C:\Users\Visitor> whoami

guest

C:\Users\Visitor> launch portfolio

Initializing modules...
Loading profile...
Ready.

After startup sequence automatically open the Profile tab.

Startup should only play once per session.

---

# Typewriter System

Create a reusable typewriter engine.

Requirements:

* Character by character rendering
* Adjustable speed
* Queue based
* Blinking cursor
* Pause support
* Skip animation support

Typing Speed:

20-40ms

Pause Between Sections:

400-600ms

Cursor:

White block cursor

Blink every second

---

# Tab Structure

The application contains only four tabs:

1. Profile
2. Projects
3. Blog
4. Contact

Each tab should preserve:

* Scroll position
* Render state

Switching tabs should feel like switching terminal sessions.

---

# PROFILE TAB

Purpose:

Professional overview.

Display content as terminal commands.

Example:

C:\profile> type summary.txt

Then display:

* Full Name
* Professional Title
* Professional Summary

Right side:

Profile photo

Desktop:

300x300

Mobile:

200x200

Skills should be displayed as:

C:\profile> dir skills

Azure
AWS
Terraform
Kubernetes
PowerShell
Linux
GitHub Actions

All Profile content should come from a single editable JSON file:

/content/profile.json

The site owner should be able to update profile information without touching HTML.

---

# PROJECTS TAB

Purpose:

Showcase projects.

Projects should be displayed as terminal directories.

Example:

C:\projects> dir

01-project-name
02-project-name
03-project-name

Selecting a project should simulate:

C:\projects> cd project-name

C:\projects\project-name> type readme.txt

Project details should then appear.

Each project should contain:

* Name
* Description
* Technologies
* GitHub URL
* Live Demo URL

Projects must be loaded dynamically from:

/content/projects.json

Adding a project should only require editing the JSON file.

No HTML modifications should be necessary.

---

# BLOG TAB

Purpose:

Technical blog.

This section must support Markdown files.

Folder Structure:

/blog

/blog/post-1.md
/blog/post-2.md
/blog/post-3.md

The system should automatically discover and render blog posts using a simple index file.

Example:

/blog/index.json

The Blog tab should display:

C:\blog> dir

2026-01-terminal-design.md
2026-02-cloud-automation.md
2026-03-devops-lessons.md

Clicking a post should simulate:

C:\blog> type terminal-design.md

The markdown content should then be rendered inside the terminal window.

Use a lightweight markdown parser.

No backend required.

Adding a new blog post should only require:

1. Creating a new .md file
2. Adding an entry to blog/index.json

No code changes should be necessary.

---

# CONTACT TAB

Display contact information as terminal output.

Example:

C:\contact> get-contact

Email:
[email@example.com](mailto:email@example.com)

LinkedIn:
linkedin.com/in/username

GitHub:
github.com/username

Location:
Country

Links must be clickable.

Additional simulated commands:

C:\contact> ping linkedin

Connection successful.

C:\contact> open github

Launching repository...

Contact information should be loaded from:

/content/contact.json

---

# Content Architecture

All content must be editable without modifying source code.

Folder Structure:

/index.html

/css
style.css

/js
app.js
terminal.js
tabs.js
typewriter.js
markdown.js

/content
profile.json
projects.json
contact.json

/blog
index.json
first-post.md
second-post.md

/assets
profile.webp
wallpaper.webp

---

# Terminal Separators

Use terminal-style separators.

Example:

---

Color:

#BDBDBD

Spacing:

48px top and bottom

---

# Animations

Required:

* Typewriter effect
* Cursor blinking
* Terminal loading effects
* Smooth tab transitions

Avoid:

* Excessive motion
* Parallax
* Complex page animations

The terminal experience should remain professional.

---

# Mobile Requirements

Below 1024px:

* Window scales down proportionally
* Profile image moves below text
* Tabs become horizontally scrollable

Below 768px:

* Slightly reduce font size
* Preserve terminal experience

Do not redesign the application for mobile.

Maintain desktop authenticity whenever possible.

---

# Code Quality

Requirements:

* Semantic HTML
* Modular JavaScript
* Clean CSS architecture
* Accessible keyboard navigation
* WCAG AA compliant
* Fast loading
* Production ready

The final product should feel like a real Windows Terminal application running inside a browser while remaining extremely easy to maintain through JSON and Markdown files.

One thing I would add when you actually build it: don't store the Profile tab in HTML at all. Make the AI load **everything** from `/content/*.json` and `/blog/*.md`. That way your site becomes essentially a tiny static CMS on GitHub Pages, and updating your CV is just editing a JSON file or adding a Markdown post. That's probably the cleanest long-term architecture for this project.
