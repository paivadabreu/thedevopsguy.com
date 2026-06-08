const Terminal = (() => {
  const prompt = (path) => `<span class="prompt">${path}&gt;</span>`;
  const line = (text = "", className = "line") => {
    const element = document.createElement("div");
    element.className = className;
    element.textContent = text;
    return element;
  };

  const command = (path, text) => {
    const element = document.createElement("div");
    element.className = "command";
    element.innerHTML = `${prompt(path)} ${escape(text)}`;
    return element;
  };

  const html = (markup, className = "output") => {
    const element = document.createElement("div");
    element.className = className;
    element.innerHTML = markup;
    return element;
  };

  const separator = () => line("---", "separator");

  const escape = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const link = (href, label = href) => `<a href="${escape(href)}" target="_blank" rel="noreferrer">${escape(label)}</a>`;

  return { command, escape, html, line, link, prompt, separator };
})();

window.Terminal = Terminal;