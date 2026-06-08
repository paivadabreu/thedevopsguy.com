const Markdown = (() => {
  const escapeHtml = (value) => value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const safeHref = (value) => {
    const href = value.trim();
    if (/^(https?:|mailto:|#|\/)/i.test(href)) return escapeHtml(href);
    return "#";
  };

  const inline = (value) => escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => `<a href="${safeHref(href)}" target="_blank" rel="noreferrer">${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  function parse(markdown) {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");
    const html = [];
    let inList = false;
    let inCode = false;
    let codeLines = [];

    for (const line of lines) {
      if (line.startsWith("```")) {
        if (inCode) {
          html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
          codeLines = [];
          inCode = false;
        } else {
          inCode = true;
        }
        continue;
      }

      if (inCode) {
        codeLines.push(line);
        continue;
      }

      if (/^#{1,3}\s/.test(line)) {
        if (inList) {
          html.push("</ul>");
          inList = false;
        }
        const level = line.match(/^#+/)[0].length;
        html.push(`<h${level}>${inline(line.replace(/^#{1,3}\s/, ""))}</h${level}>`);
        continue;
      }

      if (/^-\s+/.test(line)) {
        if (!inList) {
          html.push("<ul>");
          inList = true;
        }
        html.push(`<li>${inline(line.replace(/^-\s+/, ""))}</li>`);
        continue;
      }

      if (!line.trim()) {
        if (inList) {
          html.push("</ul>");
          inList = false;
        }
        continue;
      }

      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<p>${inline(line)}</p>`);
    }

    if (inList) html.push("</ul>");
    return html.join("\n");
  }

  return { parse };
})();

window.Markdown = Markdown;